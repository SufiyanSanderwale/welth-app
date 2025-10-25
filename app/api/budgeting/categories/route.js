import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json([]);
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return NextResponse.json([]);
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0,7);
    const rows = await db.budgetCategory.findMany({ where: { userId: user.id, month }, orderBy: { name: "asc" } });
    return NextResponse.json(rows);
  } catch { return NextResponse.json([]); }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const body = await req.json();
    const month = body.month || new Date().toISOString().slice(0,7);
    // Prevent duplicates by case for same month
    const exists = await db.budgetCategory.findFirst({ where: { userId: user.id, month, name: { equals: body.name, mode: 'insensitive' } } });
    if (!body.id && exists) return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
    const data = { userId: user.id, name: body.name, limit: Number(body.limit)||0, month };
    const row = body.id ? await db.budgetCategory.update({ where: { id: body.id }, data }) : await db.budgetCategory.create({ data });
    return NextResponse.json(row);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}


