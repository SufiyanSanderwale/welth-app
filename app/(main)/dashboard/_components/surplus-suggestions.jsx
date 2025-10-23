"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";

export default function SurplusSuggestions({ budget, currentExpenses, userCurrency = "INR" }) {
  const { surplus, percentUsed } = useMemo(() => {
    const total = budget?.amount ?? 0;
    const used = currentExpenses ?? 0;
    const remaining = Math.max(total - used, 0);
    const ratio = total > 0 ? Math.min((used / total) * 100, 100) : 0;
    return { surplus: remaining, percentUsed: ratio };
  }, [budget, currentExpenses]);

  const suggestions = useMemo(() => {
    if (!surplus || surplus <= 0) return [];
    const allocations = [
      { label: "Emergency fund (40%)", pct: 0.4, url: "https://www.investopedia.com/terms/e/emergency_fund.asp" },
      { label: "Index ETF (30%)", pct: 0.3, url: "https://www.financialfitness.group/learn/etf-index-funds" },
      { label: "Gold/Commodities (10%)", pct: 0.1, url: "https://www.investopedia.com/ask/answers/06/goldforinflation.asp" },
      { label: "Debt prepayment (10%)", pct: 0.1, url: "https://www.investopedia.com/terms/p/prepayment.asp" },
      { label: "Skill/education (10%)", pct: 0.1, url: "https://www.coursera.org/" },
    ];
    return allocations.map((a) => ({ ...a, amount: surplus * a.pct }));
  }, [surplus]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly-Budget Surplus Suggestions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {budget ? (
          <>
            <div className="text-sm text-muted-foreground">
              {formatCurrency(currentExpenses ?? 0, userCurrency)} of {formatCurrency(budget.amount, userCurrency)} spent · {percentUsed.toFixed(1)}% used
            </div>
            <Progress value={percentUsed} />
            <div className="text-sm font-medium">
              Surplus this month: {formatCurrency(surplus, userCurrency)}
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">No budget set</div>
        )}

        {suggestions.length > 0 && (
          <ul className="mt-2 space-y-2">
            {suggestions.map((s) => (
              <li key={s.label} className="flex items-center justify-between">
                <div>
                  <div className="text-sm">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{formatCurrency(s.amount, userCurrency)}</div>
                </div>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Learn more
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}


