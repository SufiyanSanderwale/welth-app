import { Suspense } from "react";
export const dynamic = 'force-dynamic';
import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { getUserCurrency } from "@/actions/currency";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "./_components/budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import DashboardOverview from "./_components/transaction-overview";
import SurplusSuggestions from "./_components/surplus-suggestions";
import Watchlist from "./_components/watchlist";
import EconomicCalendar from "./_components/economic-calendar";
import ErrorBoundary from "./_components/error-boundary";
import { CardSkeleton } from "@/components/ui/loading-wrapper";
import AnimatedWrapper from "@/components/ui/animated-wrapper";
import AnimatedCard from "@/components/ui/animated-card";
import SMSExpenseTracker from "@/components/SMSExpenseTracker";

export default async function DashboardPage() {
  const [accounts, transactions, userCurrency] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
    getUserCurrency(),
  ]);

  const defaultAccount = accounts?.find((account) => account.isDefault);

  // Get budget for default account
  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  // Check if authentication is set up
  const hasAuth = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
                  process.env.CLERK_SECRET_KEY &&
                  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder');

  if (!hasAuth) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">
                🔧 Setup Required
              </h2>
              <p className="text-yellow-700 mb-4">
                To access the dashboard, you need to set up authentication with Clerk.
              </p>
              <div className="text-sm text-yellow-600 space-y-2">
                <p>1. Get API keys from <a href="https://clerk.com" target="_blank" className="underline">clerk.com</a></p>
                <p>2. Update your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file</p>
                <p>3. Restart the development server</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <AnimatedWrapper delay={0.1}>
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to Your Dashboard</h1>
            <p className="text-blue-100 text-lg">Track your finances, manage budgets, and get AI-powered insights</p>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </div>
      </AnimatedWrapper>

      {/* Budget Progress */}
      <AnimatedWrapper delay={0.2}>
        <Suspense fallback={<CardSkeleton />}>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
            <BudgetProgress
              initialBudget={budgetData?.budget}
              currentExpenses={budgetData?.currentExpenses || 0}
              userCurrency={userCurrency}
            />
          </div>
        </Suspense>
      </AnimatedWrapper>

      {/* Surplus Suggestions + Watchlist */}
      <AnimatedWrapper delay={0.3}>
        <div className="grid gap-6 md:grid-cols-2">
          <ErrorBoundary>
            <Suspense fallback={<CardSkeleton />}>
              <AnimatedCard delay={0.1} className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
                <SurplusSuggestions
                  budget={budgetData?.budget}
                  currentExpenses={budgetData?.currentExpenses || 0}
                  userCurrency={userCurrency}
                />
              </AnimatedCard>
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary>
            <Suspense fallback={<CardSkeleton />}>
              <AnimatedCard delay={0.2} className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
                <Watchlist />
              </AnimatedCard>
            </Suspense>
          </ErrorBoundary>
        </div>
      </AnimatedWrapper>

      {/* Dashboard Overview */}
      <AnimatedWrapper delay={0.4}>
        <Suspense fallback={<CardSkeleton />}>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
            <DashboardOverview
              accounts={accounts}
              transactions={transactions || []}
              userCurrency={userCurrency}
            />
          </div>
        </Suspense>
      </AnimatedWrapper>

      {/* SMS Expense Tracker */}
      <AnimatedWrapper delay={0.5}>
        <Suspense fallback={<CardSkeleton />}>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
            <SMSExpenseTracker />
          </div>
        </Suspense>
      </AnimatedWrapper>

      {/* Economic Calendar */}
      <AnimatedWrapper delay={0.6}>
        <ErrorBoundary>
          <Suspense fallback={<CardSkeleton />}>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
              <EconomicCalendar />
            </div>
          </Suspense>
        </ErrorBoundary>
      </AnimatedWrapper>

      {/* Accounts Grid */}
      <AnimatedWrapper delay={0.7}>
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Accounts</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <AnimatedCard delay={0.1}>
              <CreateAccountDrawer>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-400 bg-gradient-to-br from-slate-50 to-blue-50/30 group min-h-[200px]">
                  <CardContent className="flex flex-col items-center justify-center text-slate-500 group-hover:text-blue-600 h-full pt-8 pb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Plus className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-lg font-semibold mb-2">Add New Account</p>
                    <p className="text-sm text-center">Create a new account to start tracking your finances</p>
                  </CardContent>
                </Card>
              </CreateAccountDrawer>
            </AnimatedCard>
            {accounts.length > 0 &&
              accounts?.map((account, index) => (
                <AnimatedCard key={account.id} delay={0.1 + (index * 0.1)}>
                  <AccountCard account={account} userCurrency={userCurrency} />
                </AnimatedCard>
              ))}
          </div>
        </div>
      </AnimatedWrapper>
    </div>
  );
}
