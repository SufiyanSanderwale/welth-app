"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { toast } from "sonner";
import { defaultCategories } from "@/data/categories";

export default function BudgetingPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7));
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [editingCatId, setEditingCatId] = useState("");
  const [catDraft, setCatDraft] = useState({ name: "", limit: "" });
  const [editingGoalId, setEditingGoalId] = useState("");
  const [goalDraft, setGoalDraft] = useState({ title: "", target: "", saved: "", dueDate: "" });
  const [addGoalId, setAddGoalId] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [source, setSource] = useState("budget");
  const [sourceAccountId, setSourceAccountId] = useState("");
  const [accounts, setAccounts] = useState([]);

  const load = async () => {
    const [c, g] = await Promise.all([
      fetch(`/api/budgeting/categories?month=${month}`).then(r=>r.json()),
      fetch(`/api/budgeting/goals`).then(r=>r.json()),
    ]);
    setCategories(c||[]); setGoals(g||[]);
  };
  useEffect(()=>{ load(); }, [month]);
  useEffect(()=>{
    fetch('/api/account-list').then(async r=>{ if(!r.ok) return; const j=await r.json(); setAccounts(j||[]); if(j?.[0]?.id) setSourceAccountId(j[0].id); });
  },[]);

  // form state
  const [newCat, setNewCat] = useState({ name: "", limit: "" });
  const [newGoal, setNewGoal] = useState({ title: "", target: "", saved: "", dueDate: "" });

  const saveCategory = async () => {
    if (!newCat.name) return;
    await fetch("/api/budgeting/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newCat.name, limit: newCat.limit, month }) });
    setNewCat({ name: "", limit: "" });
    load();
  };
  const startEditCategory = (c) => {
    setEditingCatId(c.id);
    setCatDraft({ name: c.name, limit: String(c.limit ?? "") });
  };
  const saveEditCategory = async (id) => {
    await fetch('/api/budgeting/categories',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,name:catDraft.name,limit:catDraft.limit,month})});
    setCategories((prev)=>prev.map(x=>x.id===id?{...x,name:catDraft.name,limit:catDraft.limit}:x));
    setEditingCatId("");
  };
  const deleteCategory = async (id) => {
    // optimistic
    setCategories((prev)=>prev.filter(x=>x.id!==id));
    await fetch(`/api/budgeting/categories/${id}`,{method:'DELETE'});
  };
  // Envelope feature removed permanently
  const saveGoal = async () => {
    if (!newGoal.title) return;
    await fetch("/api/budgeting/goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newGoal) });
    setNewGoal({ title: "", target: "", saved: "", dueDate: "" });
    load();
  };
  const startEditGoal = (g) => {
    setEditingGoalId(g.id);
    setGoalDraft({ title: g.title, target: String(g.target ?? ""), saved: String(g.saved ?? ""), dueDate: g.dueDate ? g.dueDate.slice(0,10) : "" });
  };
  const saveEditGoal = async (id) => {
    setGoals((prev)=>prev.map(x=>x.id===id?{...x,...goalDraft}:x));
    await fetch('/api/budgeting/goals',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,...goalDraft})});
    setEditingGoalId("");
  };
  const deleteGoal = async (id) => {
    setGoals((prev)=>prev.filter(x=>x.id!==id));
    await fetch(`/api/budgeting/goals/${id}`,{method:'DELETE'});
  };

  const openAddToGoal = (g) => {
    setAddGoalId(g.id);
    setAddAmount("");
  };
  const confirmAddToGoal = async () => {
    const g = goals.find(x=>x.id===addGoalId);
    if (!g) { setAddGoalId(""); return; }
    const amt = Number(addAmount);
    const target = Number(g.target)||0;
    const saved = Number(g.saved)||0;
    const remaining = Math.max(0, target - saved);
    if (!amt || amt <= 0) { toast.error("Enter a positive amount"); return; }
    if (amt > remaining) { toast.error("Amount exceeds remaining target"); return; }
    // optimistic goal update
    setGoals(prev=>prev.map(x=>x.id===g.id?{...x, saved: saved + amt}:x));
    const res = await fetch('/api/budgeting/goals/add',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({goalId:g.id,amount:amt,source,accountId: source==='account' ? sourceAccountId : undefined})});
    if(!res.ok){ toast.error('Unable to add to goal'); await load(); setAddGoalId(""); setAddAmount(""); return; }
    const j = await res.json();
    toast.success(`₹${amt} added to ${g.title} (deducted from ${source==='budget'?'Monthly Budget':j.accountName})`);
    setAddGoalId("");
    setAddAmount("");
    // dashboards will re-hydrate on next navigation; for now we keep local goal state in sync
  };


  return (
    <div className="space-y-6 px-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Budgeting</h1>
        <div className="flex items-center gap-2">
          <Input type="month" value={month} onChange={(e)=>setMonth(e.target.value)} className="w-[200px]" />
          <Button variant="outline" onClick={load}>Refresh</Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        In Budgeting, you can set a monthly limit for each expense category, your spending is
        auto-tracked, and you can create savings goals to monitor progress. This helps you avoid
        overspending and plan better.
      </p>

      <Card>
        <CardHeader><CardTitle>Category Budgets</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            {(() => {
              const expenseDefaults = defaultCategories.filter((c)=>c.type==="EXPENSE").map((c)=>c.name);
              const existing = categories.map((c)=>c.name);
              const options = Array.from(new Set([ ...expenseDefaults, ...existing ]));
              return (
                <Select value={newCat.name} onValueChange={(v)=>setNewCat(s=>({...s,name:v}))}>
                  <SelectTrigger className="w-[220px]"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {options.map((name)=> (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            })()}
            <Input placeholder="Limit" type="number" value={newCat.limit} onChange={(e)=>setNewCat(v=>({...v, limit: e.target.value}))} />
            <Button onClick={saveCategory}>Add</Button>
          </div>
          {categories.length === 0 ? (
            <div className="text-sm text-muted-foreground">No categories yet.</div>
          ) : categories.map((c)=>{
            const usedPct = c.limit > 0 ? Math.min((Number(c.spent)/Number(c.limit))*100, 100) : 0;
            return (
              <div key={c.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {editingCatId===c.id ? (
                      <>
                        <Input placeholder="Name" value={catDraft.name} onChange={(e)=>setCatDraft(v=>({...v,name:e.target.value}))} className="h-7 w-[160px]" />
                        <Input placeholder="Limit" type="number" value={catDraft.limit} onChange={(e)=>setCatDraft(v=>({...v,limit:e.target.value}))} className="h-7 w-[120px]" />
                        <Button size="sm" className="h-7" onClick={()=>saveEditCategory(c.id)}>Save</Button>
                        <Button variant="outline" size="sm" className="h-7" onClick={()=>setEditingCatId("")}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <span>{c.name}</span>
                        <span className="text-muted-foreground">limit: {Number(c.limit).toFixed(2)} · spent: {Number(c.spent).toFixed(2)}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7">•••</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={()=>startEditCategory(c)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={()=>deleteCategory(c.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </span>
                  <span />
                </div>
                <Progress value={usedPct} />
                <div className="text-xs text-muted-foreground text-right">{usedPct.toFixed(1)}%</div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/** Envelopes section removed permanently */}

      <Card>
        <CardHeader><CardTitle>Savings Goals</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Input placeholder="Title" value={newGoal.title} onChange={(e)=>setNewGoal(v=>({...v, title: e.target.value}))} className="w-[200px]" />
            <Input placeholder="Target" type="number" value={newGoal.target} onChange={(e)=>setNewGoal(v=>({...v, target: e.target.value}))} className="w-[140px]" />
            <Input placeholder="Saved" type="number" value={newGoal.saved} onChange={(e)=>setNewGoal(v=>({...v, saved: e.target.value}))} className="w-[140px]" />
            <Input placeholder="Due date" type="date" value={newGoal.dueDate} onChange={(e)=>setNewGoal(v=>({...v, dueDate: e.target.value}))} />
            <Button onClick={saveGoal}>Add</Button>
          </div>
          {goals.map((g)=>{
            const pct = g.target > 0 ? Math.min((Number(g.saved)/Number(g.target))*100,100) : 0;
            return (
              <div key={g.id} className="space-y-1">
                {editingGoalId===g.id ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Input placeholder="Title" value={goalDraft.title} onChange={(ev)=>setGoalDraft(v=>({...v,title:ev.target.value}))} className="h-8 w-[220px]" />
                    <Input placeholder="Target" type="number" value={goalDraft.target} onChange={(ev)=>setGoalDraft(v=>({...v,target:ev.target.value}))} className="h-8 w-[120px]" />
                    <Input placeholder="Saved" type="number" value={goalDraft.saved} onChange={(ev)=>setGoalDraft(v=>({...v,saved:ev.target.value}))} className="h-8 w-[120px]" />
                    <Input placeholder="Due date" type="date" value={goalDraft.dueDate} onChange={(ev)=>setGoalDraft(v=>({...v,dueDate:ev.target.value}))} className="h-8" />
                    <Button size="sm" onClick={()=>saveEditGoal(g.id)}>Save</Button>
                    <Button variant="outline" size="sm" onClick={()=>setEditingGoalId("")}>Cancel</Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{g.title}</span>
                    <span className="text-muted-foreground">{Number(g.saved).toFixed(2)} / {Number(g.target).toFixed(2)} · remaining: {Math.max(0, Number(g.target)-Number(g.saved)).toFixed(2)}</span>
                    <span className="text-muted-foreground">{g.dueDate ? g.dueDate.slice(0,10) : ''}</span>
                    <Button size="sm" variant="outline" onClick={()=>openAddToGoal(g)}>Add to Goal</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7">•••</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={()=>startEditGoal(g)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={()=>deleteGoal(g.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                <Progress value={pct} />
                <div className="text-xs text-muted-foreground text-right">{pct.toFixed(1)}%</div>
              </div>
            );
          })}

      {/* Add to Goal Drawer */}
      <Drawer open={!!addGoalId} onOpenChange={(o)=>{ if(!o){ setAddGoalId(""); setAddAmount(""); } }}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add to Goal</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-2 space-y-2">
            <Input type="number" placeholder="Amount" value={addAmount} onChange={(e)=>setAddAmount(e.target.value)} />
            <div className="grid gap-2 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Source</label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Remaining Monthly Budget</SelectItem>
                    <SelectItem value="account">Specific Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {source==='account' && (
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium">Account</label>
                  <Select value={sourceAccountId} onValueChange={setSourceAccountId}>
                    <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map(a=> (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DrawerFooter>
            <div className="flex gap-2">
              <Button className="w-full" onClick={confirmAddToGoal}>Add</Button>
              <Button variant="outline" className="w-full" onClick={()=>{ setAddGoalId(""); setAddAmount(""); }}>Cancel</Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
        </CardContent>
      </Card>
    </div>
  );
}



