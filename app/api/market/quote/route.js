import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Free tier source: Financial Modeling Prep (FMP)
// Docs: https://site.financialmodelingprep.com/developer/docs/
// Get API key (free) and add to .env.local as FMP_API_KEY

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols") || "AAPL,MSFT,GOOGL";
    let symbols = symbolsParam
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .join(",");

    // Normalize common Indian exchange aliases to provider formats
    // Finnhub expects NSE:XXXX and BSE:XXXX
    const toFinnhub = (sym) => {
      if (sym.endsWith(".NS")) return `NSE:${sym.replace(".NS", "")}`;
      if (sym.endsWith(".BS") || sym.endsWith(".BSE")) return `BSE:${sym.replace(/\.(BS|BSE)$/,"")}`;
      return sym;
    };

    // Provider 1: FMP quote-short (may still work on free-tier)
    const fmpKey = process.env.FMP_API_KEY ?? "demo";
    const fmpUrl = `https://financialmodelingprep.com/api/v3/quote-short/${encodeURIComponent(symbols)}?apikey=${fmpKey}`;
    let lastStatus = 0;
    try {
      const res = await fetch(fmpUrl, { cache: "no-store" });
      lastStatus = res.status;
      if (res.ok) {
        const arr = await res.json();
        if (Array.isArray(arr) && arr.length) {
          const mapped = arr.map((q) => ({
            symbol: q.symbol,
            price: q.price ?? q.previousClose ?? 0,
            change: q.change ?? 0,
            changesPercentage: q.changesPercentage ?? 0,
          }));
          return NextResponse.json({ data: mapped, meta: { provider: "fmp", status: lastStatus } });
        }
      }
    } catch {}

    // Provider 2: Finnhub (free key required)
    const finnhubKey = process.env.FINNHUB_API_KEY;
    if (finnhubKey) {
      const syms = symbols.split(",");
      const results = await Promise.all(
        syms.map(async (sym) => {
          try {
            const mapped = toFinnhub(sym);
            const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(mapped)}&token=${finnhubKey}`;
            const r = await fetch(url, { cache: "no-store" });
            lastStatus = r.status;
            if (!r.ok) return null;
            const j = await r.json();
            if (!j || typeof j.c !== "number") return null;
            const change = (j.c ?? 0) - (j.pc ?? 0);
            const pct = j.pc ? (change / j.pc) * 100 : 0;
            return { symbol: sym, price: j.c ?? 0, change, changesPercentage: pct };
          } catch {
            return null;
          }
        })
      );
      const cleaned = results.filter(Boolean);
      if (cleaned.length) {
        return NextResponse.json({ data: cleaned, meta: { provider: "finnhub", status: lastStatus } });
      }
    }

    // Provider 3: AlphaVantage (free key required, one-by-one Global Quote)
    const alphaKey = process.env.ALPHAVANTAGE_API_KEY;
    if (alphaKey) {
      const syms = symbols.split(",");
      const results = await Promise.all(
        syms.map(async (sym) => {
          try {
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(sym)}&apikey=${alphaKey}`;
            const r = await fetch(url, { cache: "no-store" });
            lastStatus = r.status;
            if (!r.ok) return null;
            const j = await r.json();
            const g = j["Global Quote"] || {};
            const price = parseFloat(g["05. price"]) || 0;
            const change = parseFloat(g["09. change"]) || 0;
            const pctStr = g["10. change percent"] || "0%";
            const pct = parseFloat(pctStr.replace("%", "")) || 0;
            if (!price) return null;
            return { symbol: sym, price, change, changesPercentage: pct };
          } catch {
            return null;
          }
        })
      );
      const cleaned = results.filter(Boolean);
      if (cleaned.length) {
        return NextResponse.json({ data: cleaned, meta: { provider: "alphavantage", status: lastStatus } });
      }
    }

    return NextResponse.json({ data: [], meta: { status: lastStatus || 400 } });
  } catch (err) {
    // Return empty data so UI does not break
    return NextResponse.json({ data: [], error: err.message }, { status: 200 });
  }
}


