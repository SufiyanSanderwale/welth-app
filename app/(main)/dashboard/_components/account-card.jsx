"use client";

import { ArrowUpRight, ArrowDownRight, MoreVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateDefaultAccount, deleteAccount } from "@/actions/account";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { useRouter } from 'next/navigation';

export function AccountCard({ account, userCurrency = "INR" }) {
  const { name, type, balance, id, isDefault } = account;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault(); // Prevent navigation

    if (isDefault) {
      toast.warning("You need atleast 1 default account");
      return; // Don't allow toggling off the default account
    }

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  return (
    <Card className="rounded-2xl border border-slate-200/50 p-8 shadow-lg hover:shadow-xl transition-all duration-300 group relative bg-gradient-to-br from-white to-slate-50/30 overflow-hidden min-h-[200px]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10 h-full flex flex-col">
        {/* Header with title and controls */}
        <div className="flex items-start justify-between mb-6">
          <CardTitle className="text-lg font-bold capitalize text-slate-700 group-hover:text-slate-900 transition-colors duration-300">
            {name}
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
              <span className="text-xs font-medium text-slate-600">Default</span>
              <Switch
                checked={isDefault}
                onClick={handleDefaultChange}
                disabled={updateDefaultLoading}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors duration-200">
                  <span className="sr-only">More</span>
                  <MoreVertical className="h-4 w-4 text-slate-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border border-slate-200/50 shadow-lg">
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); setConfirmOpen(true); }} className="text-red-600 hover:bg-red-50 rounded-lg">
                  Delete account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <LoadingButton
          href={`/account/${id}`}
          variant="ghost"
          className="w-full p-0 hover:bg-transparent flex-1"
          loadingText="Opening Account..."
        >
          <div className="w-full h-full flex flex-col justify-between">
            {/* Amount Section */}
            <div className="text-center py-4">
              <div className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300 mb-2">
                {formatCurrency(parseFloat(balance), userCurrency)}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                {type.charAt(0) + type.slice(1).toLowerCase()} Account
              </p>
            </div>

            {/* Footer with Income/Expense indicators */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                <ArrowUpRight className="h-4 w-4" />
                <span className="font-medium text-sm">Income</span>
              </div>
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <ArrowDownRight className="h-4 w-4" />
                <span className="font-medium text-sm">Expense</span>
              </div>
            </div>
          </div>
        </LoadingButton>
      </div>

      <Drawer open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Delete account?</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 text-muted-foreground">
            This will remove the account and all its transactions. This action cannot be undone.
          </div>
          <DrawerFooter>
            <div className="flex gap-2">
              <Button variant="outline" className="w-full" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              {/* Delete action: call server action, show toast, refresh UI */}
              <LoadingButton
                className="w-full"
                variant="destructive"
                onClick={async () => {
                  try {
                    setDeleting(true);
                    // Call server action to delete the account
                    const res = await deleteAccount(id);
                    if (res?.success) {
                      toast.success("Account deleted");
                      setConfirmOpen(false);
                      // Refresh router to reflect deleted account in lists
                      router.refresh();
                    } else {
                      toast.error(res?.error || "Failed to delete account");
                    }
                  } catch (err) {
                    console.error("Failed to delete account", err);
                    toast.error(err?.message || "Failed to delete account");
                  } finally {
                    setDeleting(false);
                  }
                }}
                loadingText="Deleting..."
                disabled={deleting}
              >
                Delete
              </LoadingButton>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Card>
  );
}
