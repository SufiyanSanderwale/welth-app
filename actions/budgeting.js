"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

function requireUser(user) {
  if (!user) throw new Error("User not found");
}

export async function listBudgetCategories(month) {
  const { userId } = await auth();
  if (!userId) return [];
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  requireUser(user);
  const m = month || new Date().toISOString().slice(0, 7);
  const rows = await db.budgetCategory.findMany({ where: { userId: user.id, month: m }, orderBy: { name: "asc" } });
  return rows;
}

export async function upsertBudgetCategory({ id, name, limit, month }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  requireUser(user);
  const m = month || new Date().toISOString().slice(0, 7);
  const data = { userId: user.id, name, limit: Number(limit) || 0, month: m };
  const row = id
    ? await db.budgetCategory.update({ where: { id }, data })
    : await db.budgetCategory.create({ data });
  revalidatePath("/budgeting");
  return { success: true, data: row };
}

export async function rolloverBudget(fromMonth, toMonth) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  requireUser(user);
  const src = await db.budgetCategory.findMany({ where: { userId: user.id, month: fromMonth } });
  const dest = await db.budgetCategory.findMany({ where: { userId: user.id, month: toMonth } });
  const destByName = new Map(dest.map((d) => [d.name, d]));
  for (const r of src) {
    const unused = Number(r.limit) - Number(r.spent);
    const base = destByName.get(r.name);
    if (base) {
      await db.budgetCategory.update({ where: { id: base.id }, data: { limit: Number(base.limit) + Math.max(unused, 0) } });
    } else {
      await db.budgetCategory.create({ data: { userId: user.id, name: r.name, month: toMonth, limit: Math.max(unused, 0), spent: 0 } });
    }
  }
  revalidatePath("/budgeting");
  return { success: true };
}

// Envelope feature removed permanently

export async function listGoals() {
  const { userId } = await auth();
  if (!userId) return [];
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  requireUser(user);
  return await db.savingGoal.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
}

export async function upsertGoal({ id, title, target, saved, dueDate }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  requireUser(user);
  const data = { userId: user.id, title, target: Number(target) || 0, saved: Number(saved) || 0, dueDate: dueDate ? new Date(dueDate) : null };
  const row = id ? await db.savingGoal.update({ where: { id }, data }) : await db.savingGoal.create({ data });
  revalidatePath("/budgeting");
  return { success: true, data: row };
}






