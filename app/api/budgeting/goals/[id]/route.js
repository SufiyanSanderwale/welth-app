import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function DELETE(_req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    await db.savingGoal.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}


