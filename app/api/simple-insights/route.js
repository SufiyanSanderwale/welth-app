import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

function generateBasicInsights(transactions) {
  if (transactions.length === 0) {
    return `💡 **Getting Started with Financial Management:**

1. **Start Recording**: Add your first transaction to begin tracking your money flow
2. **Set Categories**: Organize expenses into categories like Food, Transport, Entertainment
3. **Create Budgets**: Set monthly limits for each category in the Budgeting section
4. **Emergency Fund**: Start saving ₹1000-5000 monthly for unexpected expenses
5. **Review Weekly**: Check your spending patterns every week

Add some transactions to get personalized insights!`;
  }

  // Analyze transactions
  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const categories = {};
  transactions.forEach(t => {
    const cat = t.category || 'Other';
    if (!categories[cat]) categories[cat] = 0;
    categories[cat] += Number(t.amount);
  });

  const topCategory = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)[0];

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0;

  return `📊 **Your Financial Summary:**

• **Total Transactions**: ${transactions.length}
• **Total Income**: ₹${totalIncome.toFixed(2)}
• **Total Expenses**: ₹${totalExpenses.toFixed(2)}
• **Savings Rate**: ${savingsRate}%

💡 **Personalized Tips:**

1. **${topCategory ? `Top Spending Category: ${topCategory[0]} (₹${topCategory[1].toFixed(2)})` : 'Track Your Categories'}**: ${topCategory ? 'Consider if this spending aligns with your goals' : 'Start categorizing your expenses'}

2. **Savings Strategy**: ${savingsRate > 20 ? 'Great job! You\'re saving well' : savingsRate > 0 ? 'Good start! Try to increase to 20%' : 'Focus on spending less than you earn'}

3. **Budget Planning**: ${totalExpenses > 0 ? 'Create monthly budgets based on your spending patterns' : 'Start tracking expenses to build spending patterns'}

4. **Emergency Fund**: ${totalIncome > 0 ? `Aim to save ₹${(totalIncome * 0.2).toFixed(0)} monthly for emergencies` : 'Build an emergency fund equal to 3-6 months of expenses'}

5. **Regular Review**: Check your spending weekly and adjust budgets as needed

Keep tracking to get even better insights!`;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        insights: `🔒 **Authentication Required**

Please log in to get your personalized financial insights.

Once logged in, you'll get:
• Personalized spending analysis
• Custom budgeting tips
• Savings recommendations
• Financial goal tracking`
      });
    }

    // Find user in DB
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        insights: `👤 **Account Setup Required**

It looks like your account isn't fully set up yet. Please:

1. Complete your profile setup
2. Add your first transaction
3. Try again for personalized insights

Contact support if this issue persists.`
      });
    }

    // Get transactions
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 100
    });

    const insights = generateBasicInsights(transactions);
    
    return NextResponse.json({ insights });
    
  } catch (e) {
    console.error('Simple AI Insights API Error:', e);
    return NextResponse.json({ 
      error: e.message,
      insights: `⚠️ **System Issue**

We're experiencing technical difficulties. Here are some general tips:

1. **Track Everything**: Record all income and expenses
2. **Set Budgets**: Create monthly spending limits
3. **Save Regularly**: Aim for 20% savings rate
4. **Review Weekly**: Check spending patterns
5. **Emergency Fund**: Build 3-6 months of expenses

Please try again later or contact support.`
    });
  }
}







