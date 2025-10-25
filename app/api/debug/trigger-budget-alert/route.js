import { inngest } from "@/lib/inngest/client";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await inngest.send({
            name: "check.budget.alerts",
            data: {},
        });

        return NextResponse.json({ success: true, message: "✅ Budget alert manually triggered" });

    } catch (error) {
        console.error("Trigger error:", error);
        return NextResponse.json({ success: false, message: "❌ Failed to trigger" });
    }
}