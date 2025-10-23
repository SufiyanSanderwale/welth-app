import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { VirtualizedTransactionTable } from "../_components/virtualized-transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";
import { getUserCurrency } from "@/actions/currency";
import { formatCurrency } from "@/lib/currency";

export default async function AccountPage({ params }) {
  const resolvedParams = await params;
  const accountData = await getAccountWithTransactions(resolvedParams.id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;
  const userCurrency = await getUserCurrency();

  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            {formatCurrency(parseFloat(account.balance), userCurrency)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <AccountChart transactions={transactions} userCurrency={userCurrency} />
      </Suspense>

      {/* Transactions Table */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <VirtualizedTransactionTable transactions={transactions} userCurrency={userCurrency} startingBalance={account.balance} />
      </Suspense>
    </div>
  );
}
