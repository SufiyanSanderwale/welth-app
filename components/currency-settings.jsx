"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getAllCurrencies, getCurrencySymbol, getCurrencyName } from "@/lib/currency";
import { toast } from "sonner";

export default function CurrencySettings({ currentCurrency, onCurrencyChange }) {
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency || "INR");
  const [isLoading, setIsLoading] = useState(false);
  
  const currencies = getAllCurrencies();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Call the parent component's handler to save the currency
      await onCurrencyChange(selectedCurrency);
      toast.success("Currency preference updated successfully!");
    } catch (error) {
      console.error("Error updating currency:", error);
      toast.error("Failed to update currency preference");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Settings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose your preferred currency for displaying amounts throughout the app.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Preferred Currency</label>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{currency.symbol}</span>
                    <span>{currency.code}</span>
                    <span className="text-muted-foreground">- {currency.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCurrency && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Preview:</p>
            <p className="text-lg font-semibold">
              {getCurrencySymbol(selectedCurrency)}1,234.56
            </p>
            <p className="text-xs text-muted-foreground">
              {getCurrencyName(selectedCurrency)} ({selectedCurrency})
            </p>
          </div>
        )}

        <Button 
          onClick={handleSave} 
          disabled={isLoading || selectedCurrency === currentCurrency}
          className="w-full"
        >
          {isLoading ? "Saving..." : "Save Currency Preference"}
        </Button>
      </CardContent>
    </Card>
  );
}
