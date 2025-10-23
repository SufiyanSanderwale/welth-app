import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export const dynamic = 'force-dynamic';

import { getUserCurrency } from "@/actions/currency";
import CurrencySettings from "@/components/currency-settings";
import { updateUserCurrency } from "@/actions/currency";

export default async function ProfilePage() {
  const currentCurrency = await getUserCurrency();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div>Loading currency settings...</div>}>
          <CurrencySettings 
            currentCurrency={currentCurrency}
            onCurrencyChange={updateUserCurrency}
          />
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Current Currency
                </label>
                <p className="text-lg font-semibold">{currentCurrency}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Account Status
                </label>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
