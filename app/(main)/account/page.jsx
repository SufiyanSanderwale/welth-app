import { getUserAccounts } from "@/actions/dashboard";
import { AccountCard } from "../dashboard/_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
export const dynamic = 'force-dynamic';
import { getUserCurrency } from "@/actions/currency";

export default async function AccountsIndexPage() {
  const [accounts, userCurrency] = await Promise.all([
    getUserAccounts(),
    getUserCurrency(),
  ]);

  return (
    <div className="space-y-8 px-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Accounts</h1>
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex items-center gap-2 px-4 py-2 text-muted-foreground">
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Add New Account</span>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
      </div>

      {Array.isArray(accounts) && accounts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} userCurrency={userCurrency} />
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No accounts yet. Create your first account to get started.</div>
      )}
    </div>
  );
}


