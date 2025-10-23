import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { goalId, amount, source, accountId } = body || {};
    const amt = Number(amount);
    if (!goalId || !amt || amt <= 0) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    // Load goal
    const goal = await db.savingGoal.findFirst({ where: { id: goalId, userId: user.id } });
    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    const target = Number(goal.target) || 0;
    const saved = Number(goal.saved) || 0;
    if (saved + amt > target) return NextResponse.json({ error: "Amount exceeds goal target" }, { status: 400 });

    // Resolve account for wallet/account sources
    let debitAccount = null;
    if (source === "wallet") {
      debitAccount = await db.account.findFirst({ where: { userId: user.id, isDefault: true } });
      if (!debitAccount) return NextResponse.json({ error: "Default account not found" }, { status: 400 });
    } else if (source === "account") {
      if (!accountId) return NextResponse.json({ error: "accountId required" }, { status: 400 });
      debitAccount = await db.account.findFirst({ where: { id: accountId, userId: user.id } });
      if (!debitAccount) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    } else if (source === "budget") {
      // For budget, we will also use default account to persist a transaction so dashboards stay in sync
      debitAccount = await db.account.findFirst({ where: { userId: user.id, isDefault: true } });
      if (!debitAccount) return NextResponse.json({ error: "Default account not found" }, { status: 400 });
      // Verify remaining budget >= amt
      const startDate = new Date(); startDate.setDate(1);
      const expenses = await db.transaction.aggregate({ where: { userId: user.id, accountId: debitAccount.id, type: "EXPENSE", date: { gte: startDate } }, _sum: { amount: true } });
      const totalExpenses = expenses._sum.amount?.toNumber() || 0;
      const bud = await db.budget.findFirst({ where: { userId: user.id } });
      const budgetAmount = Number(bud?.amount || 0);
      const remaining = Math.max(0, budgetAmount - totalExpenses);
      if (amt > remaining) return NextResponse.json({ error: "Insufficient remaining monthly budget" }, { status: 400 });
    } else {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    // Validate funds for account sources
    const balance = Number(debitAccount.balance) || 0;
    if ((source === "wallet" || source === "account") && amt > balance) {
      return NextResponse.json({ error: "Insufficient funds in source account" }, { status: 400 });
    }

    // Apply updates in a transaction
    const updated = await db.$transaction(async (tx) => {
      // Update goal saved
      const goalUpd = await tx.savingGoal.update({ where: { id: goal.id }, data: { saved: saved + amt } });

      // Create an expense transaction to reflect movement
      const now = new Date();
      await tx.transaction.create({
        data: {
          type: "EXPENSE",
          amount: amt,
          description: `Goal Deposit: ${goal.title}`,
          date: now,
          category: "Saving-Goal",
          userId: user.id,
          accountId: debitAccount.id,
          status: "COMPLETED",
        },
      });

      // Decrement account balance for wallet/account/budget
      await tx.account.update({ where: { id: debitAccount.id }, data: { balance: balance - amt } });

      return goalUpd;
    });

    return NextResponse.json({ success: true, data: updated, sourceLabel: source, accountName: debitAccount.name });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


