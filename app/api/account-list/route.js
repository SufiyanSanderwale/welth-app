import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json([], { status: 200 });
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return NextResponse.json([], { status: 200 });
    const accounts = await db.account.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });
    return NextResponse.json(accounts.map(a => ({ id: a.id, name: a.name })), { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}


