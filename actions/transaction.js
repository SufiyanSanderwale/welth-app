"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { inngest } from "@/lib/inngest/client";
import EmailTemplate from "@/emails/template";
import { sendEmail } from "@/actions/send-email";
import { request } from "@arcjet/next";
import { getCurrencySymbol } from "@/lib/currency";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

// Create Transaction
export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request blocked");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;
    if (newBalance < 0) {
      throw new Error("This transaction would make the account balance negative");
    }

    // Calculate budget usage before transaction (for threshold crossing detection)
    const defaultAccount = await db.account.findFirst({
      where: { userId: user.id, isDefault: true },
      orderBy: { createdAt: "asc" },
    });

    const budget = await db.budget.findFirst({ where: { userId: user.id } });

    // Calculate start and end of current month (same logic as dashboard)
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const beforeExpensesAgg = defaultAccount
      ? await db.transaction.aggregate({
        where: {
          userId: user.id,
          accountId: defaultAccount.id,
          type: "EXPENSE",
          date: { 
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: { amount: true },
      })
      : { _sum: { amount: { toNumber: () => 0 } } };

    const beforeExpenses = beforeExpensesAgg._sum.amount?.toNumber?.() || 0;

    // Create transaction and update account balance
    const persist = data;
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...persist,
          userId: user.id,
          nextRecurringDate:
            persist.isRecurring && persist.recurringInterval
              ? calculateNextRecurringDate(persist.date, persist.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    // Post-commit hooks (outside the transaction to avoid timeouts)
    if (persist.type === "EXPENSE") {
      try {
        const d = new Date(persist.date);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const existingCat = await db.budgetCategory.findFirst({
          where: { userId: user.id, month: monthKey, name: { equals: persist.category, mode: 'insensitive' } },
        });
        if (existingCat) {
          await db.budgetCategory.update({
            where: { id: existingCat.id },
            data: { spent: Number(existingCat.spent) + Number(persist.amount) },
          });
        }
        // Envelope feature removed
      } catch {}
    }

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`, "page");

    // Kick off budget alert check for this user immediately (no need to wait for cron)
    try {
      await inngest.send({ name: "check.budget.alerts", data: { userId: user.id } });
    } catch (e) {
      console.error("Failed to emit budget alert event", e);
    }

    // If this expense crosses the 80% threshold on default account, send alert immediately
    try {
      if (budget && defaultAccount) {
        const addedExpense =
          data.type === "EXPENSE" && data.accountId === defaultAccount.id
            ? data.amount
            : 0;
        const afterExpenses = beforeExpenses + addedExpense;
        const beforePct = (beforeExpenses / Number(budget.amount)) * 100;
        const afterPct = (afterExpenses / Number(budget.amount)) * 100;

        if (beforePct < 80 && afterPct >= 80) {
          const currencySymbol = getCurrencySymbol(user.currency || "INR");
          const percentageUsed = afterPct;
          await sendEmail({
            to: user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: EmailTemplate({
              userName: user.name || "User",
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount: Number(budget.amount),
                totalExpenses: afterExpenses,
                accountName: defaultAccount.name,
                currencySymbol,
              },
            }),
          });

          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        }
      }
    } catch (e) {
      console.error("Immediate budget alert send failed", e);
    }

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance change and revert hooks
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      // Revert original hooks if original was EXPENSE
      try {
        if (originalTransaction.type === "EXPENSE") {
          const d0 = new Date(originalTransaction.date);
          const month0 = `${d0.getFullYear()}-${String(d0.getMonth() + 1).padStart(2, "0")}`;
          const cat0 = await tx.budgetCategory.findFirst({ where: { userId: user.id, month: month0, name: { equals: originalTransaction.category, mode: 'insensitive' } } });
          if (cat0) {
            await tx.budgetCategory.update({ where: { id: cat0.id }, data: { spent: Math.max(0, Number(cat0.spent) - Number(originalTransaction.amount)) } });
          }
          // No stored envelope id; skip revert for envelope for safety
        }
      } catch {}

      const persist = data;
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...persist,
          nextRecurringDate:
            persist.isRecurring && persist.recurringInterval
              ? calculateNextRecurringDate(persist.date, persist.recurringInterval)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      // Apply new hooks if EXPENSE
      try {
        if (persist.type === "EXPENSE") {
          const d = new Date(persist.date);
          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const cat = await tx.budgetCategory.findFirst({ where: { userId: user.id, month: monthKey, name: { equals: persist.category, mode: 'insensitive' } } });
          if (cat) {
            await tx.budgetCategory.update({ where: { id: cat.id }, data: { spent: Number(cat.spent) + Number(persist.amount) } });
          }
          // Envelope feature removed
        }
      } catch {}

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: transactions };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Scan Receipt
export async function scanReceipt(file) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Base64
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw new Error("Failed to scan receipt");
  }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}
