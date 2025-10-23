import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json([]);
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return NextResponse.json([]);
    const rows = await db.savingGoal.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
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
    const data = { userId: user.id, title: body.title, target: Number(body.target)||0, saved: Number(body.saved)||0, dueDate: body.dueDate ? new Date(body.dueDate) : null };
    const row = body.id ? await db.savingGoal.update({ where: { id: body.id }, data }) : await db.savingGoal.create({ data });
    return NextResponse.json(row);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}


