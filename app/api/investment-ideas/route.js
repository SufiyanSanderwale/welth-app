import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

function analyzeFinancialProfile(transactions) {
  if (transactions.length === 0) {
    return {
      hasData: false,
      message: "No transaction data available for analysis"
    };
  }

  // Calculate financial metrics
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome * 100) : 0;

  // Analyze spending patterns
  const categories = {};
  transactions.forEach(t => {
    if (t.type === 'EXPENSE') {
      const cat = t.category || 'Other';
      if (!categories[cat]) categories[cat] = 0;
      categories[cat] += Number(t.amount);
    }
  });

  const topExpenseCategory = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)[0];

  // Determine risk profile based on spending patterns
  let riskProfile = 'Conservative';
  if (savingsRate > 30) riskProfile = 'Aggressive';
  else if (savingsRate > 15) riskProfile = 'Moderate';

  return {
    hasData: true,
    totalIncome,
    totalExpenses,
    savings,
    savingsRate: savingsRate.toFixed(1),
    riskProfile,
    topExpenseCategory,
    transactionCount: transactions.length,
    monthlyIncome: totalIncome / Math.max(1, Math.floor(transactions.length / 30)), // Rough monthly estimate
    monthlyExpenses: totalExpenses / Math.max(1, Math.floor(transactions.length / 30))
  };
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        insights: `🔒 **Authentication Required**

Please log in to get personalized investment advice.

Once logged in, you'll get:
• Risk assessment based on your spending patterns
• Personalized investment recommendations
• Indian market specific advice
• SIP and mutual fund suggestions`
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
2. Add some transactions to build your financial profile
3. Try again for personalized investment advice

Contact support if this issue persists.`
      });
    }

    // Get transactions
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 200 // Get more data for better analysis
    });

    const financialProfile = analyzeFinancialProfile(transactions);

    // Check if Gemini API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Investment API: Gemini API key available:', !!apiKey);
    if (!apiKey) {
      console.log('Investment API: No Gemini API key, using basic advice');
      // Provide basic investment advice without AI
      const basicAdvice = generateBasicInvestmentAdvice(financialProfile);
      return NextResponse.json({ insights: basicAdvice });
    }

    // Create detailed prompt for Gemini
    const prompt = `You are a financial advisor specializing in Indian investments. Analyze this user's financial profile and provide personalized investment recommendations.

**User's Financial Profile:**
- Total Income: ₹${financialProfile.totalIncome.toFixed(2)}
- Total Expenses: ₹${financialProfile.totalExpenses.toFixed(2)}
- Savings: ₹${financialProfile.savings.toFixed(2)}
- Savings Rate: ${financialProfile.savingsRate}%
- Risk Profile: ${financialProfile.riskProfile}
- Top Expense Category: ${financialProfile.topExpenseCategory ? financialProfile.topExpenseCategory[0] : 'N/A'}
- Monthly Income (estimated): ₹${financialProfile.monthlyIncome.toFixed(2)}
- Monthly Expenses (estimated): ₹${financialProfile.monthlyExpenses.toFixed(2)}

**Requirements:**
1. Provide 4-5 specific investment recommendations suitable for Indian market
2. Include SIP suggestions with amounts (₹500-₹10000 range)
3. Suggest mutual funds, stocks, or other instruments
4. Consider their risk profile and savings capacity
5. Include emergency fund recommendations
6. Format with emojis and clear bullet points
7. Respond ONLY in English (no Hindi)
8. Be practical and actionable

Focus on:
- SIP recommendations
- Emergency fund (3-6 months expenses)
- Tax-saving investments (ELSS, PPF)
- Long-term wealth building
- Risk-appropriate suggestions

IMPORTANT: Respond in English only, do not use Hindi language.`;

    // Call Gemini API
    console.log('Investment API: Calling Gemini API with prompt length:', prompt.length);
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    
    console.log('Investment API: Gemini response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Investment API: Gemini error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Investment API: Gemini result structure:', Object.keys(result));
    
    const insights = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate investment advice at the moment.';
    console.log('Investment API: Generated insights length:', insights.length);
    
    return NextResponse.json({ insights });
    
  } catch (e) {
    console.error('Investment Ideas API Error:', e);
    
    // Fallback advice even on error
    const fallbackAdvice = `⚠️ **AI Service Temporarily Unavailable**

Here are some general investment tips:

**Basic Investment Strategy:**
1. **Emergency Fund First**: Save 3-6 months of expenses in FD/Savings account
2. **Start SIP**: Begin with ₹500-1000 monthly in index funds
3. **Tax Saving**: Invest in ELSS mutual funds (₹1.5L limit)
4. **Diversify**: Mix of equity, debt, and gold
5. **Long-term Focus**: Invest for 5+ years for better returns

**Popular Indian Investment Options:**
• **SIP**: HDFC Top 100, SBI Bluechip, Axis Bluechip
• **ELSS**: DSP Tax Saver, HDFC Tax Saver
• **Gold**: Gold ETF or Sovereign Gold Bonds
• **Debt**: PPF, EPF, Government Securities

Please try again later for personalized AI advice.`;
    
    return NextResponse.json({ 
      error: e.message,
      insights: fallbackAdvice
    });
  }
}

function generateBasicInvestmentAdvice(profile) {
  if (!profile.hasData) {
    return `💡 **Getting Started with Investments**

**First Steps:**
1. **Track Your Money**: Start recording income and expenses
2. **Build Emergency Fund**: Save ₹10,000-50,000 first
3. **Start Small**: Begin SIP with ₹500-1000 monthly
4. **Learn Basics**: Understand mutual funds, SIP, and compounding
5. **Set Goals**: Define short-term and long-term financial goals

**Beginner-Friendly Options:**
• **SIP in Index Funds**: Nifty 50, Sensex funds
• **ELSS**: Tax-saving mutual funds
• **PPF**: Government-backed savings
• **Gold**: Sovereign Gold Bonds

Add transactions to get personalized investment advice!`;
  }

  const monthlySavings = Math.max(0, profile.monthlyIncome - profile.monthlyExpenses);
  
  return `📊 **Your Investment Analysis:**

**Financial Summary:**
• Monthly Income: ₹${profile.monthlyIncome.toFixed(2)}
• Monthly Expenses: ₹${profile.monthlyExpenses.toFixed(2)}
• Monthly Savings: ₹${monthlySavings.toFixed(2)}
• Savings Rate: ${profile.savingsRate}%
• Risk Profile: ${profile.riskProfile}

**Investment Recommendations:**

1. **Emergency Fund**: Save ₹${(profile.monthlyExpenses * 6).toFixed(0)} (6 months expenses)

2. **SIP Suggestions**:
   ${monthlySavings > 5000 ? 
     `• ₹${Math.min(5000, monthlySavings * 0.3).toFixed(0)} in Large Cap Funds
     • ₹${Math.min(3000, monthlySavings * 0.2).toFixed(0)} in Mid Cap Funds
     • ₹${Math.min(2000, monthlySavings * 0.1).toFixed(0)} in ELSS (Tax Saving)` :
     `• ₹${Math.min(1000, monthlySavings * 0.5).toFixed(0)} in Index Funds
     • ₹${Math.min(500, monthlySavings * 0.3).toFixed(0)} in ELSS`}

3. **Tax Saving**: Invest ₹1.5L annually in ELSS funds

4. **Gold Investment**: ₹${Math.min(2000, monthlySavings * 0.1).toFixed(0)} monthly in Gold ETF

5. **Long-term Goals**: Consider PPF, NPS for retirement planning

**Next Steps:**
• Start with emergency fund
• Begin SIP with available amount
• Increase investments as income grows
• Review and rebalance annually

Configure Gemini API key for AI-powered personalized advice!`;
}
