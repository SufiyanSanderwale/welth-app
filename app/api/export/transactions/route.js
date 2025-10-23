import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    const format = (searchParams.get("format") || "csv").toLowerCase();
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!accountId) return NextResponse.json({ error: "accountId is required" }, { status: 400 });

    // Verify account belongs to user
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const account = await db.account.findFirst({ where: { id: accountId, userId: user.id } });
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    // Inclusive date range: include the full end day by shifting 'to' by +1 day and using lt
    let range = undefined;
    if (from || to) {
      const start = from ? new Date(from) : undefined;
      const end = to ? new Date(to) : undefined;
      if (end) {
        const endInclusive = new Date(end);
        endInclusive.setDate(endInclusive.getDate() + 1);
        range = { gte: start, lt: endInclusive };
      } else {
        range = { gte: start };
      }
    }
    const where = {
      userId: user.id,
      accountId,
      ...(range ? { date: range } : {}),
    };

    // Get transactions oldest->newest for natural banking statement
    const txs = await db.transaction.findMany({ where, orderBy: { date: "asc" } });

    // Get current account balance and compute opening balance for the period
    const acct = await db.account.findUnique({ where: { id: accountId } });
    const current = acct?.balance?.toNumber?.() ?? 0;
    const netDelta = txs.reduce((acc, t) => acc + (t.type === "INCOME" ? t.amount.toNumber() : -t.amount.toNumber()), 0);
    let running = current - netDelta; // opening balance before first row

    // Build data rows once
    const rows = [["Date", "Type", "Amount", "Category", "Description", "Balance"]];
    const fmtLocal = (dt) => new Date(dt).toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone
    for (const t of txs) {
      const change = t.type === "INCOME" ? t.amount.toNumber() : -t.amount.toNumber();
      running += change; // post-transaction balance
      rows.push([
        fmtLocal(t.date),
        t.type,
        t.amount.toNumber(),
        t.category,
        t.description || "",
        running,
      ]);
    }

    if (format === "csv") {
      const csv = rows.map((r) => r.map((v) => String(v).replaceAll('"', '""')).map((v) => `"${v}"`).join(",")).join("\n");
      const headers = new Headers({
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=transactions_${account.name}.csv`,
      });
      return new NextResponse(csv, { status: 200, headers });
    }

    if (format === "xls" || format === "excel" || format === "xlsx") {
      // SpreadsheetML (Excel 2003 XML) - opens in all modern Excels
      const xmlRows = rows
        .map(
          (r) =>
            "<Row>" +
            r
              .map((c) => `<Cell><Data ss:Type="String">${String(c).replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</Data></Cell>`)
              .join("") +
            "</Row>"
        )
        .join("");
      const xml = `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n<Worksheet ss:Name="Transactions"><Table>${xmlRows}</Table></Worksheet>\n</Workbook>`;
      const headers = new Headers({
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": `attachment; filename=transactions_${account.name}.xls`,
      });
      return new NextResponse(xml, { status: 200, headers });
    }

    // PDF export removed per requirement

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


