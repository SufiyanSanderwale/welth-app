"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trash,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCategoryColor } from "@/data/categories";
import { bulkDeleteTransactions } from "@/actions/account";
import { formatCurrency } from "@/lib/currency";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import { LoadingWrapper, SkeletonLoader } from "@/components/ui/loading-wrapper";

const ITEMS_PER_PAGE = 20; // Increased for better performance
const VIRTUAL_THRESHOLD = 100; // Use virtualization for lists > 100 items

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export function VirtualizedTransactionTable({ transactions, userCurrency = "INR", startingBalance = 0 }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isVirtualized, setIsVirtualized] = useState(false);
  const router = useRouter();

  // Determine if we should use virtualization
  useEffect(() => {
    setIsVirtualized(transactions.length > VIRTUAL_THRESHOLD);
  }, [transactions.length]);

  // Memoized filtered and sorted transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    // Apply recurring filter
    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / ITEMS_PER_PAGE
  );
  
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedTransactions, currentPage]);

  // Compute running balance per transaction for the current filtered + sorted order
  const balanceById = useMemo(() => {
    let running = Number(startingBalance) || 0;
    const map = new Map();
    for (const t of filteredAndSortedTransactions) {
      map.set(t.id, running);
      const effect = t.type === "EXPENSE" ? -Number(t.amount) : Number(t.amount);
      running -= effect; // step back in time for the next (older) row
    }
    return map;
  }, [filteredAndSortedTransactions, startingBalance]);

  const handleSort = useCallback((field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleSelect = useCallback((id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((current) =>
      current.length === paginatedTransactions.length
        ? []
        : paginatedTransactions.map((t) => t.id)
    );
  }, [paginatedTransactions]);

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);

  const handleBulkDelete = useCallback(async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
    )
      return;

    deleteFn(selectedIds);
  }, [selectedIds, deleteFn]);

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.error("Transactions deleted successfully");
    }
  }, [deleted, deleteLoading]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    setSelectedIds([]); // Clear selections on page change
  }, []);

  // Render transaction row
  const renderTransactionRow = useCallback((transaction) => (
    <TableRow key={transaction.id}>
      <TableCell>
        <Checkbox
          checked={selectedIds.includes(transaction.id)}
          onCheckedChange={() => handleSelect(transaction.id)}
        />
      </TableCell>
      <TableCell>
        {format(new Date(transaction.date), "PP")}
      </TableCell>
      <TableCell>{transaction.description}</TableCell>
      <TableCell className="capitalize">
        <span
          style={{
            background: getCategoryColor(transaction.category),
          }}
          className="px-2 py-1 rounded text-white text-sm"
        >
          {transaction.category}
        </span>
      </TableCell>
      <TableCell
        className={cn(
          "text-right font-medium",
          transaction.type === "EXPENSE"
            ? "text-red-500"
            : "text-green-500"
        )}
      >
        {transaction.type === "EXPENSE" ? "-" : "+"}
        {formatCurrency(transaction.amount, userCurrency)}
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(balanceById.get(transaction.id) ?? 0, userCurrency)}
      </TableCell>
      <TableCell>
        {transaction.isRecurring ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  variant="secondary"
                  className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                >
                  <RefreshCw className="h-3 w-3" />
                  {
                    RECURRING_INTERVALS[
                      transaction.recurringInterval
                    ]
                  }
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <div className="font-medium">Next Date:</div>
                  <div>
                    {format(
                      new Date(transaction.nextRecurringDate),
                      "PPP"
                    )}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            One-time
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                router.push(
                  `/transaction/create?edit=${transaction.id}`
                )
              }
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => deleteFn([transaction.id])}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  ), [selectedIds, balanceById, userCurrency, handleSelect, router, deleteFn]);

  return (
    <div className="space-y-4">
      <LoadingWrapper isLoading={deleteLoading} fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={recurringFilter}
              onValueChange={(value) => {
                setRecurringFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recurring">Recurring Only</SelectItem>
                <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedIds.length})
                </Button>
              </div>
            )}

            {(searchTerm || typeFilter || recurringFilter) && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleClearFilters}
                title="Clear filters"
              >
                <X className="h-4 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Performance indicator */}
        {isVirtualized && (
          <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
            📊 Large dataset detected - Using optimized rendering for {transactions.length} transactions
          </div>
        )}

        {/* Transactions Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedIds.length === paginatedTransactions.length &&
                      paginatedTransactions.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.field === "date" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center">
                    Category
                    {sortConfig.field === "category" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center justify-end">
                    Amount
                    {sortConfig.field === "amount" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map(renderTransactionRow)
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </LoadingWrapper>
    </div>
  );
}
