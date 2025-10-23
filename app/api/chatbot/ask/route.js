import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCurrencySymbol } from "@/lib/currency";
import { trainingData } from "@/lib/trainingContext";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const userQuery = String(body?.query || "").slice(0, 2000);
    const history = Array.isArray(body?.history) ? body.history.slice(-10) : [];
    if (!userQuery) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    // Fetch recent transactions from Prisma (DB already configured)
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 200,
      select: { id: true, amount: true, type: true, category: true, description: true, date: true, accountId: true },
    });

    const currencyCode = user.currency || "INR";
    const currencySymbol = getCurrencySymbol(currencyCode);

    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!geminiKey) return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build deterministic aggregates so the model doesn't mis-calculate
    const asPlain = transactions.map(t => ({
      id: t.id,
      amount: Number(t.amount),
      type: t.type,
      category: (t.category || "").toString().trim(),
      date: new Date(t.date).toISOString(),
      accountId: t.accountId,
    }));

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);

    const sum = (arr) => arr.reduce((n, x) => n + (Number(x.amount) || 0), 0);
    const filterByType = (arr, t) => arr.filter(x => x.type === t);
    const filterByDateGte = (arr, d) => arr.filter(x => new Date(x.date) >= d);

    const normalizeCat = (s) => (s || "").toString().trim().toLowerCase();
    const groupByCategory = (arr) => arr.reduce((acc, x) => {
      const k = normalizeCat(x.category) || "other";
      acc[k] = (acc[k] || 0) + (Number(x.amount) || 0);
      return acc;
    }, {});

    const overallIncome = sum(filterByType(asPlain, "INCOME"));
    const overallExpense = sum(filterByType(asPlain, "EXPENSE"));
    const overallNet = overallIncome - overallExpense;

    const monthTx = filterByDateGte(asPlain, startOfMonth);
    const monthIncome = sum(filterByType(monthTx, "INCOME"));
    const monthExpense = sum(filterByType(monthTx, "EXPENSE"));
    const monthNet = monthIncome - monthExpense;
    const monthByCategory = groupByCategory(filterByType(monthTx, "EXPENSE"));

    const last30Tx = filterByDateGte(asPlain, last30);
    const last30Income = sum(filterByType(last30Tx, "INCOME"));
    const last30Expense = sum(filterByType(last30Tx, "EXPENSE"));
    const last30Net = last30Income - last30Expense;

    const aggregates = {
      currencyCode,
      currencySymbol,
      overall: { income: overallIncome, expense: overallExpense, net: overallNet },
      month: {
        startIso: startOfMonth.toISOString(),
        income: monthIncome,
        expense: monthExpense,
        net: monthNet,
        byCategory: monthByCategory,
      },
      last30: { income: last30Income, expense: last30Expense, net: last30Net },
    };

    const historyText = history
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${String(m.content || '').slice(0, 1000)}`)
      .join("\n");

    const prompt = `You are a smart AI financial assistant for the Welth app.\nUser currency code: ${currencyCode}\nUser currency symbol: ${currencySymbol}\n\nConversation so far (most recent first may appear last):\n${historyText}\n\nAlways display all money amounts using the user's currency symbol and standard formatting (example: ${currencySymbol}1,234.56).\n\nWelth Training Book (for app usage questions):\n${trainingData.join("\n")}\n\nNEW FEATURES AVAILABLE:\n- Investment Ideas: Get AI-powered investment recommendations based on financial profile (Main Menu > Investment Ideas)\n- AI Financial Insights: Get personalized financial advice and spending tips from AI (Main Menu > AI Insights)\n\nWe computed deterministic aggregates for accuracy. If any value conflicts with raw transactions, TRUST AGGREGATES.\nAggregates JSON:\n${JSON.stringify(aggregates)}\n\nRecent transactions JSON (max 200):\n${JSON.stringify(asPlain)}\n\nUser question: "${userQuery}"\n\nGuidelines:\n- If the question is about how to use the app, answer strictly based on the Training Book.\n- If asking about spending/budgets, use the aggregates to compute totals and top categories; then add brief advice.\n- If general finance (investing, SIP, mutual funds, gold), provide beginner-friendly and safe guidance.\n- For investment advice, mention the new "Investment Ideas" feature in the main menu.\n- For financial insights, mention the new "AI Financial Insights" feature in the main menu.\n- Keep answers concise and scannable with bullets.\n- IMPORTANT: Always use the user's currency symbol (${currencySymbol}) for all amounts.`;

    const result = await model.generateContent(prompt);
    const text = (await result.response.text()).trim();

    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: e.message || "Unexpected error" }, { status: 500 });
  }
}


