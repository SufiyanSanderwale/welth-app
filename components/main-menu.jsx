"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import { LayoutDashboard, Wallet, ListTree, ArrowDownToLine, Bot, BookOpen, Lightbulb, TrendingUp } from "lucide-react";

export default function MainMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button aria-label="Open menu" className="h-10 w-10 rounded-xl hover:bg-blue-50 flex items-center justify-center transition-all duration-200 group">
          <span className="sr-only">Menu</span>
          <div className="flex flex-col gap-[3px] group-hover:gap-[4px] transition-all duration-200">
            <span className="block h-[2px] w-5 bg-slate-600 group-hover:bg-blue-600 transition-colors duration-200" />
            <span className="block h-[2px] w-5 bg-slate-600 group-hover:bg-blue-600 transition-colors duration-200" />
            <span className="block h-[2px] w-5 bg-slate-600 group-hover:bg-blue-600 transition-colors duration-200" />
          </div>
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-gradient-to-br from-white to-blue-50/30">
        <DrawerHeader className="border-b border-slate-200/50">
          <DrawerTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Navigation Menu
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4 grid gap-1">
          <LoadingButton 
            href="/dashboard" 
            variant="ghost" 
            className="justify-start h-auto py-3 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
            loadingText="Opening Dashboard..."
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={20} className="mr-3 text-blue-600 group-hover:scale-110 transition-transform duration-200" /> 
            <span className="font-medium">Dashboard</span>
          </LoadingButton>
          <LoadingButton 
            href="/account" 
            variant="ghost" 
            className="justify-start h-auto py-3 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all duration-200 group"
            loadingText="Opening Accounts..."
            onClick={() => setOpen(false)}
          >
            <Wallet size={20} className="mr-3 text-green-600 group-hover:scale-110 transition-transform duration-200" /> 
            <span className="font-medium">Accounts</span>
          </LoadingButton>
          <LoadingButton 
            href="/transaction" 
            variant="ghost" 
            className="justify-start h-auto py-3 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 group"
            loadingText="Opening Transactions..."
            onClick={() => setOpen(false)}
          >
            <ListTree size={20} className="mr-3 text-purple-600 group-hover:scale-110 transition-transform duration-200" /> 
            <span className="font-medium">Transactions</span>
          </LoadingButton>
          <LoadingButton 
            href="/budgeting" 
            variant="ghost" 
            className="justify-start h-auto py-3 rounded-xl hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 group"
            loadingText="Opening Budgeting..."
            onClick={() => setOpen(false)}
          >
            <ListTree size={20} className="mr-3 text-orange-600 group-hover:scale-110 transition-transform duration-200" /> 
            <span className="font-medium">Budgeting</span>
          </LoadingButton>
          <LoadingButton 
            href="/import-export" 
            variant="ghost" 
            className="justify-start h-auto py-3 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 group"
            loadingText="Opening Export..."
            onClick={() => setOpen(false)}
          >
            <ArrowDownToLine size={20} className="mr-3 text-indigo-600 group-hover:scale-110 transition-transform duration-200" /> 
            <span className="font-medium">Export</span>
          </LoadingButton>
          <LoadingButton 
            href="/chatbot" 
            variant="ghost" 
            className="justify-start h-auto py-3 rounded-xl hover:bg-pink-50 hover:text-pink-700 transition-all duration-200 group"
            loadingText="Opening Chat..."
            onClick={() => setOpen(false)}
          >
            <Bot size={20} className="mr-3 text-pink-600 group-hover:scale-110 transition-transform duration-200" /> 
            <span className="font-medium">AI Chatbot</span>
          </LoadingButton>
          <LoadingButton 
            href="/ai-insights" 
            variant="ghost" 
            className="justify-start h-auto py-3 rounded-xl hover:bg-yellow-50 hover:text-yellow-700 transition-all duration-200 group"
            loadingText="Opening AI Insights..."
            onClick={() => setOpen(false)}
          >
            <Lightbulb size={20} className="mr-3 text-yellow-600 group-hover:scale-110 transition-transform duration-200" /> 
            <span className="font-medium">AI Insights</span>
          </LoadingButton>
          <LoadingButton 
            href="/investment-ideas" 
            variant="ghost" 
            className="justify-start h-auto py-3 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 group"
            loadingText="Opening Investment Ideas..."
            onClick={() => setOpen(false)}
          >
            <TrendingUp size={20} className="mr-3 text-emerald-600 group-hover:scale-110 transition-transform duration-200" /> 
            <span className="font-medium">Investment Ideas</span>
          </LoadingButton>
          <LoadingButton 
            href="/training" 
            variant="ghost" 
            className="justify-start h-auto py-3 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-all duration-200 group"
            loadingText="Opening Training..."
            onClick={() => setOpen(false)}
          >
            <BookOpen size={20} className="mr-3 text-slate-600 group-hover:scale-110 transition-transform duration-200" /> 
            <span className="font-medium">Training Book</span>
          </LoadingButton>
        </div>
        <DrawerFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}


