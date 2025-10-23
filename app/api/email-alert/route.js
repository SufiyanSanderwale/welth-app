import { NextResponse } from "next/server";
import { sendEmail } from "@/actions/send-email";
import { db } from "@/lib/prisma";
import EmailTemplate from "@/emails/template";

export async function GET() {
    try {
        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({
                error: "Missing RESEND_API_KEY. Set it in .env.local and restart dev server.",
            }, { status: 500 });
        }
        // Fetch all users with budgets
        const users = await db.user.findMany({
            include: {
                budgets: true,
                transactions: {
                    where: { type: "EXPENSE" },
                },
            },
        });


        // Loop through each user
        for (const user of users) {
            const budget = user.budgets[0];
            if (!budget) continue;

            // Sum this month’s expenses
            const currentMonth = new Date().getMonth();
            const totalExpenses = user.transactions
                .filter((tx) => new Date(tx.date).getMonth() === currentMonth)
                .reduce((sum, tx) => sum + Number(tx.amount), 0);

            const percentageUsed = (totalExpenses / Number(budget.amount)) * 100;

            // Only send email if over threshold (e.g., 80%)
            if (percentageUsed >= 80) {
                const res = await sendEmail({
                    to: user.email,
                    subject: "🚨 Budget Alert",
                    react: EmailTemplate({
                        userName: user.name || "User",
                        type: "budget-alert",
                        data: {
                            percentageUsed,
                            budgetAmount: Number(budget.amount),
                            totalExpenses,
                        },
                    }),
                });
                if (!res?.success) {
                    console.error("Email send failed for", user.email, res?.error);
                }
            }
        }

        return NextResponse.json({ message: "✅ Budget alert emails sent!" });
    } catch (error) {
        console.error("❌ Error sending budget alerts:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}