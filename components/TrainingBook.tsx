"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, PlusCircle, PieChart, Bot, Shield, Wallet, FileDown, CircleDollarSign, TrendingUp, Lightbulb } from "lucide-react";
import Link from "next/link";

const pages = [
  { icon: BookOpen, title: "Welcome", body: "Welth helps you track your money, analyze spending, and chat with AI for guidance. Use the main menu to navigate the app." },
  { icon: Wallet, title: "Accounts", body: "Every transaction belongs to an account. Set a default account so it preselects in the form. Open an account to see balance, chart and full history." },
  { icon: PlusCircle, title: "Add Transactions", body: "Go to Transactions → Add Transaction. Choose type (INCOME/EXPENSE), amount, account, category, date and description, then submit." },
  { icon: PieChart, title: "Dashboard & Charts", body: "Dashboard shows Recent Transactions and Monthly Expense Breakdown. Switch account from the selector. Categories are normalized so 'Education' and 'education' are merged." },
  { icon: CircleDollarSign, title: "Budgeting", body: "On the Budgeting page, set monthly limits per category and track spent vs limit. Keep category names consistent for accurate tracking." },
  { icon: TrendingUp, title: "Investment Ideas", body: "Get AI-powered investment recommendations based on your financial profile. The system analyzes your income, expenses, and savings to suggest SIP amounts, mutual funds, and tax-saving investments tailored to your risk profile." },
  { icon: Lightbulb, title: "AI Financial Insights", body: "Get personalized financial advice and spending tips from AI. The system analyzes your transaction history to provide actionable insights for better money management and budgeting strategies." },
  { icon: Bot, title: "AI Chatbot", body: "Open AI Chatbot from Main Menu or the home chat button. Ask spending questions or 'How to use the app?' for guidance based on this Training Book." },
  { icon: FileDown, title: "Export", body: "Export transactions by Account and Date Range. Use Export CSV or Export Excel for statements including running balances." },
  { icon: Shield, title: "Privacy & Tips", body: "Your data stays in your account. Review transactions regularly. Use Export for backups and sharing with your accountant." },
];

export default function TrainingBook() {
  const [index, setIndex] = useState(0);
  const total = pages.length;
  const canPrev = index > 0;
  const canNext = index < total - 1;
  const PageIcon = pages[index].icon;

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Training Book</h1>
        <p className="text-sm text-muted-foreground">Learn Welth step-by-step</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
          <Card className="bg-gradient-to-br from-background to-accent/10">
            <CardHeader className="flex flex-row items-center gap-3">
              <PageIcon size={24} />
              <CardTitle>{pages[index].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">{pages[index].body}</p>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between">
        <button 
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          onClick={() => setIndex((i) => Math.max(0, i - 1))} 
          disabled={!canPrev}
        >
          Previous
        </button>
        <div className="text-sm text-muted-foreground">Page {index + 1} of {total}</div>
        {canNext ? (
          <button 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
            onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          >
            Next
          </button>
        ) : (
          <Link href="/dashboard">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
              Finish Training
            </button>
          </Link>
        )}
      </div>

      {/* Floating Help button opens Chatbot */}
      <Link href="/chatbot" className="fixed bottom-6 right-6">
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-full h-12 w-12 p-0 shadow-lg" title="Need Help?">
          <Bot />
        </button>
      </Link>
    </div>
  );
}


