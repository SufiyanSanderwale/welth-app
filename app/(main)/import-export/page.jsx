"use client";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ImportExportPage() {
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [range, setRange] = useState("last30");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    // Minimal fetch of accounts via the dashboard API we already have
    fetch("/api/account-list").then(async (r) => {
      if (!r.ok) return;
      const j = await r.json();
      setAccounts(j || []);
      if (j?.[0]?.id) setAccountId(j[0].id);
    });
  }, []);

  const computeDates = () => {
    const now = new Date();
    if (range === "last30") {
      const d = new Date(now); d.setDate(d.getDate() - 30); return { from: d, to: now };
    }
    if (range === "last180") {
      const d = new Date(now); d.setDate(d.getDate() - 180); return { from: d, to: now };
    }
    if (range === "custom") {
      return { from: from ? new Date(from) : undefined, to: to ? new Date(to) : undefined };
    }
    return {};
  };

  const exportFile = (format) => {
    const d = computeDates();
    const params = new URLSearchParams();
    params.set("accountId", accountId);
    params.set("format", format);
    if (d.from) params.set("from", d.from.toISOString());
    if (d.to) params.set("to", d.to.toISOString());
    window.location.href = `/api/export/transactions?${params.toString()}`;
  };

  return (
    <div className="space-y-6 px-5">
      <h1 className="text-3xl font-bold">Export Transactions</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Range</label>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last30">Last 30 days</SelectItem>
              <SelectItem value="last180">Last 6 months</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {range === "custom" && (
          <div className="grid grid-cols-2 gap-2 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button disabled={!accountId} onClick={() => exportFile('csv')}>Export CSV</Button>
        <Button disabled={!accountId} onClick={() => exportFile('excel')}>Export Excel</Button>
      </div>
    </div>
  );
}



