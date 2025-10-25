import { NextResponse } from "next/server";
import EmailTemplate from "@/emails/template";
import { sendEmail } from "@/actions/send-email";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const to = searchParams.get("to");
    if (!to) {
      return NextResponse.json(
        { error: "Missing 'to' query param. Example: /api/debug/send-test-email?to=you@example.com" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY in env. Set it and restart the dev server." },
        { status: 500 }
      );
    }

    const res = await sendEmail({
      to,
      subject: "Welth Test Email",
      react: EmailTemplate({
        userName: "Welth User",
        type: "budget-alert",
        data: { percentageUsed: 81, budgetAmount: 1000, totalExpenses: 810 },
      }),
    });

    return NextResponse.json({ ok: true, envFrom: process.env.RESEND_FROM || null, result: res });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}


