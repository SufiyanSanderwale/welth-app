import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

function summarizeTransactions(transactions) {
  // Group by category and type, sum amounts
  const summary = {};
  for (const tx of transactions) {
    const cat = tx.category || 'Other';
    const type = tx.type;
    if (!summary[cat]) summary[cat] = { EXPENSE: 0, INCOME: 0 };
    summary[cat][type] += Number(tx.amount);
  }
  // Format summary string
  let lines = [];
  for (const cat in summary) {
    if (summary[cat].EXPENSE > 0) lines.push(`${cat}: Expense ₹${summary[cat].EXPENSE}`);
    if (summary[cat].INCOME > 0) lines.push(`${cat}: Income ₹${summary[cat].INCOME}`);
  }
  return lines.join('\n');
}

export async function GET() {
  try {
    console.log('AI Insights API: Starting request');
    
    const { userId } = await auth();
    console.log('AI Insights API: User ID:', userId);
    if (!userId) throw new Error('Unauthorized - No user ID found');

    // Find user in DB
    console.log('AI Insights API: Looking up user in database');
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    console.log('AI Insights API: User found:', !!user);
    if (!user) throw new Error('User not found in database');

    // Get all transactions for user
    console.log('AI Insights API: Fetching transactions for user:', user.id);
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 100 // limit for performance
    });
    console.log('AI Insights API: Found transactions:', transactions.length);

    // Check if we have transactions
    if (transactions.length === 0) {
      const fallbackInsights = `💡 **General Financial Tips for Getting Started:**

1. **Start Tracking**: Begin by adding your daily transactions to build a spending pattern. This will help identify where your money goes.

2. **Create a Budget**: Set monthly limits for different categories like food, entertainment, and savings. Start with small, achievable goals.

3. **Emergency Fund**: Aim to save at least 3-6 months of expenses in an emergency fund. Start with ₹1000-5000 per month.

4. **Review Regularly**: Check your spending weekly to stay on track and adjust your budget as needed.

5. **Use the 50-30-20 Rule**: Allocate 50% for needs, 30% for wants, and 20% for savings and debt repayment.

Add some transactions to get personalized insights based on your actual spending patterns!`;
      
      return NextResponse.json({ insights: fallbackInsights });
    }

    // Summarize transactions
    const transactionSummary = summarizeTransactions(transactions);
    
    // Check if Gemini API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const basicInsights = `📊 **Your Transaction Summary:**
${transactionSummary}

💡 **Basic Financial Tips:**

1. **Track Your Spending**: You have ${transactions.length} transactions recorded. Keep adding more to get better insights.

2. **Review Categories**: Look at your spending patterns and identify areas where you can cut back.

3. **Set Goals**: Create savings goals in the Budgeting section to work towards specific financial targets.

4. **Regular Monitoring**: Check your spending weekly to stay aware of your financial habits.

To get AI-powered insights, please configure your Gemini API key in the environment variables.`;
      
      return NextResponse.json({ insights: basicInsights });
    }

    const prompt = `You are a financial advisor. Analyze this transaction summary and provide 3-5 specific, actionable tips to save money and improve budgeting. Be encouraging and practical. Format your response with emojis and clear bullet points.

Transaction Summary:
${transactionSummary}

IMPORTANT: Respond ONLY in English language. Do not use Hindi or any other language.`;

    // Call Gemini
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const result = await response.json();
    const insights = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate insights at the moment. Please try again later.';
    
    return NextResponse.json({ insights });
  } catch (e) {
    console.error('AI Insights API Error:', e);
    return NextResponse.json({ 
      error: `Error generating insights: ${e.message}`,
      insights: `⚠️ **Temporary Issue**

We're having trouble generating AI insights right now. Here are some general tips:

1. **Track Everything**: Record all your income and expenses
2. **Set Budgets**: Create monthly spending limits for different categories  
3. **Save Regularly**: Aim to save at least 20% of your income
4. **Review Weekly**: Check your spending patterns regularly
5. **Emergency Fund**: Build a safety net for unexpected expenses

Please try again in a few minutes, or contact support if the issue persists.`
    }, { status: 500 });
  }
}
