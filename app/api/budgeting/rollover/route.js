import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { rolloverBudget } from "@/actions/budgeting";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { fromMonth, toMonth } = body || {};
    if (!fromMonth || !toMonth) return NextResponse.json({ error: "fromMonth/toMonth required" }, { status: 400 });
    await rolloverBudget(fromMonth, toMonth);
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}


