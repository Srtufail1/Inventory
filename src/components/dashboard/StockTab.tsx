"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Package, ChevronDown, ChevronRight, Search, TrendingDown } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "./dashboard-utils";
import type { CustomerStock, InwardStock } from "./types";

const LS_KEY = "stock-checked-inwards";

function loadChecked(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {}
  return new Set();
}

function saveChecked(checked: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(Array.from(checked)));
  } catch {}
}

type FilteredCustomer = CustomerStock & {
  visibleInwards: InwardStock[];
};

const StockTab = ({ customerStock }: { customerStock: CustomerStock[] }) => {
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState<Set<string>>(new Set());

  // Filters
  const [customerFilter, setCustomerFilter] = useState("");
  const [inumberFilter, setInumberFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [showNegativeOnly, setShowNegativeOnly] = useState(false);

  useEffect(() => {
    setChecked(loadChecked());
  }, []);

  const toggleCheck = useCallback((id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveChecked(next);
      return next;
    });
  }, []);

  const anyFilterActive =
    !!customerFilter.trim() ||
    !!inumberFilter.trim() ||
    !!itemFilter.trim() ||
    !!(startDate && endDate) ||
    showNegativeOnly;

  const filteredCustomers = useMemo((): FilteredCustomer[] => {
    const cq = customerFilter.trim().toLowerCase();
    const iq = inumberFilter.trim().toLowerCase();
    const itemq = itemFilter.trim().toLowerCase();

    return customerStock
      .map((c): FilteredCustomer | null => {
        if (cq && !c.customer.toLowerCase().includes(cq)) return null;

        const visibleInwards = c.inwards.filter((inw) => {
          if (iq && !inw.inumber.toLowerCase().includes(iq)) return false;
          if (itemq && !inw.item.toLowerCase().includes(itemq)) return false;
          if (startDate && endDate) {
            const d = new Date(inw.addDate);
            if (!isWithinInterval(d, { start: startOfDay(startDate), end: endOfDay(endDate) }))
              return false;
          }
          if (showNegativeOnly && inw.remaining >= 0) return false;
          return true;
        });

        if ((iq || itemq || (startDate && endDate) || showNegativeOnly) && visibleInwards.length === 0)
          return null;

        return { ...c, visibleInwards };
      })
      .filter((c): c is FilteredCustomer => c !== null);
  }, [customerStock, customerFilter, inumberFilter, itemFilter, startDate, endDate, showNegativeOnly]);

  const toggleCustomer = (customer: string) => {
    setExpandedCustomers((prev) => {
      const next = new Set(prev);
      if (next.has(customer)) next.delete(customer);
      else next.add(customer);
      return next;
    });
  };

  const isExpanded = (customer: string) =>
    anyFilterActive || expandedCustomers.has(customer);

  return (
    <div className="space-y-4">
      {/* Filter row */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Customer..."
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="pl-8 h-10 w-52 text-sm"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Inward No..."
            value={inumberFilter}
            onChange={(e) => setInumberFilter(e.target.value)}
            className="pl-8 h-10 w-52 text-sm"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Item..."
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value)}
            className="pl-8 h-10 w-52 text-sm"
          />
        </div>
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(update: [Date | null, Date | null]) => setDateRange(update)}
          placeholderText="Select Date range..."
          className="h-10 w-48 rounded-md border border-input bg-background px-2.5 text-sm placeholder:text-muted-foreground focus:outline-none"
          dateFormat="dd MMM yyyy"
          isClearable
        />
        <Button
          variant={showNegativeOnly ? "destructive" : "outline"}
          size="sm"
          className="h-10 gap-2"
          onClick={() => setShowNegativeOnly((v) => !v)}
        >
          <TrendingDown className="h-4 w-4" />
          Negative Stock
        </Button>
        <div className="h-10 flex items-center gap-2 rounded-md border border-input bg-muted/40 px-3 text-sm ml-auto">
          <span className="text-muted-foreground">Total Remaining:</span>
          <span
            className={`font-bold ${
              filteredCustomers.reduce((sum, c) => sum + c.totalRemaining, 0) < 0
                ? "text-red-500"
                : ""
            }`}
          >
            {filteredCustomers
              .reduce((sum, c) => sum + c.totalRemaining, 0)
              .toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Customer list */}
      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="px-4 py-2.5 border-b bg-muted/50 flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-foreground">
            Remaining Stock by Customer
          </h3>
          <span className="ml-auto text-xs text-muted-foreground">
            {filteredCustomers.length} customers
          </span>
        </div>

        {filteredCustomers.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No customers found.
          </p>
        ) : (
          <div>
            <div className="grid grid-cols-[28px_1fr_auto] items-center px-4 py-2 bg-muted/30 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <div />
              <div>Customer</div>
              <div className="pr-1">Total Remaining Qty</div>
            </div>

            {filteredCustomers.map((cust) => {
              const expanded = isExpanded(cust.customer);
              return (
                <div key={cust.customer}>
                  <div
                    className="grid grid-cols-[28px_1fr_auto] items-center px-4 py-3 border-b cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => toggleCustomer(cust.customer)}
                  >
                    <div>
                      {expanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="font-medium text-foreground text-sm">
                      {cust.customer}
                    </div>
                    <div
                      className={`font-bold text-sm pr-1 ${
                        cust.totalRemaining < 0 ? "text-red-500" : ""
                      }`}
                    >
                      {cust.totalRemaining.toLocaleString("en-IN")}
                    </div>
                  </div>

                  {expanded && (
                    <div className="bg-muted/10 border-b">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10"></TableHead>
                            <TableHead>Inward No.</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>In Date</TableHead>
                            <TableHead className="text-right">Inward Qty</TableHead>
                            <TableHead className="text-right">Remaining Qty</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cust.visibleInwards.map((inw) => (
                            <TableRow
                              key={inw.id}
                              className={
                                checked.has(inw.id)
                                  ? "bg-green-50 dark:bg-green-950/20"
                                  : ""
                              }
                            >
                              <TableCell
                                className="pl-4"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Checkbox
                                  checked={checked.has(inw.id)}
                                  onCheckedChange={() => toggleCheck(inw.id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                {inw.inumber}
                              </TableCell>
                              <TableCell>{inw.item}</TableCell>
                              <TableCell>{formatDate(inw.addDate)}</TableCell>
                              <TableCell className="text-right">
                                {inw.inwardQty.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell
                                className={`text-right font-medium ${
                                  inw.remaining < 0
                                    ? "text-red-500"
                                    : inw.remaining === 0
                                    ? "text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {inw.remaining.toLocaleString("en-IN")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
};

export default StockTab;
