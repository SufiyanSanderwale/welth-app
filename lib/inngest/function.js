import { inngest } from "./client";
import { db } from "@/lib/prisma";
import EmailTemplate from "@/emails/template";
import { sendEmail } from "@/actions/send-email";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getCurrencySymbol } from "@/lib/currency";

// 1. Recurring Transaction Processing with Throttling
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    throttle: {
      limit: 10, // Process 10 transactions
      period: "1m", // per minute
      key: "event.data.userId", // Throttle per user
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    // Validate event data
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data:", event);
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          account: true,
        },
      });

      if (!transaction || !isTransactionDue(transaction)) return;

      // Create new transaction and update account balance in a transaction
      await db.$transaction(async (tx) => {
        // Create new transaction
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });

        // Update account balance
        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });

        // Update last processed date and next recurring date
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });
      });
    });
  }
);

// Trigger recurring transactions with batching
export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions", // Unique ID,
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" }, // Daily at midnight
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null },
              {
                nextRecurringDate: {
                  lte: new Date(),
                },
              },
            ],
          },
        });
      }
    );

    // Send event for each recurring transaction in batches
    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: {
          transactionId: transaction.id,
          userId: transaction.userId,
        },
      }));

      // Send events directly using inngest.send()
      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length };
  }
);

// 2. Monthly Report Generation
async function generateFinancialInsights(stats, month) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;

  try {
    // Simple retry with exponential backoff for transient 5xx errors
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
        return JSON.parse(cleanedText);
      } catch (err) {
        const status = err?.status || err?.cause?.status;
        const retriable = status >= 500 && status < 600;
        if (!retriable || attempt === maxAttempts) {
          throw err;
        }
        const delayMs = 300 * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" }, // First day of each month
  async ({ step, event }) => {
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({
        include: {
          accounts: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        // For cron (1st of month), report previous month; manual invokes use current
        const now = new Date();
        const isCron = event?.name?.includes?.("schedule.triggered");
        const reportMonth = new Date(now);
        if (isCron) {
          reportMonth.setMonth(reportMonth.getMonth() - 1);
        }

        // Choose default account if available; otherwise first account
        const defaultAccount = user.accounts.find((a) => a.isDefault) || user.accounts[0];
        const accountId = defaultAccount?.id;

        const stats = await getMonthlyStats(user.id, reportMonth, accountId);
        const monthName = reportMonth.toLocaleString("default", {
          month: "long",
        });

        // Generate AI insights
        const insights = await generateFinancialInsights(stats, monthName);

        const currencySymbol = getCurrencySymbol(user.currency || "INR");
        const emailRes = await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data: {
              stats,
              month: monthName,
              insights,
              currencySymbol,
            },
          }),
        });
        if (!emailRes?.success) {
          console.error("Monthly report email failed for", user.email, emailRes?.error);
        }
      });
    }

    return { processed: users.length };
  }
);

// 3. Budget Alerts with Event Batching
export const checkBudgetAlerts = inngest.createFunction(
  {
    id: "check-budget-alerts",
    name: "Check Budget Alerts",
  },
  // Allow both cron and manual trigger
  { event: "check.budget.alerts", cron: "*/10 * * * *" },

  // Every 6 hours
  async ({ step, event }) => {
    const budgets = await step.run("fetch-budgets", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
        where: event?.data?.userId ? { userId: event.data.userId } : undefined,
      });
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue; // Skip if no default account

      await step.run(`check-budget-${budget.id}`, async () => {
        // Calculate start and end of current month (same logic as dashboard)
        const currentDate = new Date();
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
          0, 0, 0, 0  // Set to midnight start of day
        );
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
          23, 59, 59, 999  // Set to end of last day
        );

        // Calculate total expenses for the default account only
        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: "EXPENSE",
            status: "COMPLETED",  // Only consider completed transactions
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        // Ensure Decimal -> number conversion for accurate math
        const budgetAmount =
          typeof budget.amount?.toNumber === "function"
            ? budget.amount.toNumber()
            : Number(budget.amount) || 0;
        const percentageUsed = budgetAmount > 0 ? (totalExpenses / budgetAmount) * 100 : 0;

        // Check if we should send an alert
        if (
          percentageUsed >= 80 &&
          (!budget.lastAlertSent || isOlderThanHours(new Date(budget.lastAlertSent), 24))
        ) {
          const currencySymbol = getCurrencySymbol(budget.user.currency || "INR");
          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert for ${defaultAccount.name}`,
            react: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount: budgetAmount.toFixed?.(1) ?? Number(budgetAmount).toFixed(1),
                totalExpenses: totalExpenses.toFixed?.(1) ?? Number(totalExpenses).toFixed(1),
                accountName: defaultAccount.name,
                currencySymbol,
              },
            }),
          });

          // Update last alert sent
          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        }
      });
    }
  }
);

function isOlderThanHours(lastDate, hours) {
  const ms = hours * 60 * 60 * 1000;
  return Date.now() - lastDate.getTime() >= ms;
}

// Utility functions
function isTransactionDue(transaction) {
  // If no lastProcessed date, transaction is due
  if (!transaction.lastProcessed) return true;

  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);

  // Compare with nextDue date
  return nextDue <= today;
}

function calculateNextRecurringDate(date, interval) {
  const next = new Date(date);
  switch (interval) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

async function getMonthlyStats(userId, month, accountId) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      ...(accountId ? { accountId } : {}),
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const base = transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );

  // Include current balance for the selected account (if provided)
  if (accountId) {
    const acct = await db.account.findUnique({ where: { id: accountId } });
    base.currentBalance = acct?.balance?.toNumber?.() ?? null;
    base.accountName = acct?.name ?? null;
  }

  return base;
}
