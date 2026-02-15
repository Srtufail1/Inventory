import React from "react";
import {
  TrendingUp,
  BarChart3,
  UserPlus,
  Users,
  Boxes,
  Wallet,
} from "lucide-react";
import CollapsibleSection from "./CollapsibleSection";
import type {
  MonthlyTrend,
  CustomerGrowth,
  TopCustomer,
  TopItem,
  CustomerBalance,
} from "./types";

const AnalyticsTab = ({
  monthlyTrends,
  customerGrowth,
  topCustomers,
  topItems,
  customerBalances,
}: {
  monthlyTrends: MonthlyTrend[];
  customerGrowth: CustomerGrowth[];
  topCustomers: TopCustomer[];
  topItems: TopItem[];
  customerBalances: CustomerBalance[];
}) => {
  const maxMonthlyQty = Math.max(
    ...monthlyTrends.map((m) => Math.max(m.inwardQty, m.outwardQty)),
    1
  );

  return (
    <>
      {/* Analytics Quick Stats */}
      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="px-4 py-2.5 border-b bg-muted/50 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-foreground">Trends at a Glance</h3>
          <span className="ml-auto text-xs text-muted-foreground">Last {monthlyTrends.length} months</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x">
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {monthlyTrends.reduce((s, m) => s + m.inwardQty, 0).toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-muted-foreground">Total Inward Qty</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {monthlyTrends.reduce((s, m) => s + m.outwardQty, 0).toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-muted-foreground">Total Outward Qty</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {customerGrowth.reduce((s, c) => s + c.newCustomers, 0)}
            </p>
            <p className="text-[11px] text-muted-foreground">New Customers</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
              {monthlyTrends.length > 0 ? Math.round(monthlyTrends.reduce((s, m) => s + m.inwardQty, 0) / monthlyTrends.length).toLocaleString("en-IN") : 0}
            </p>
            <p className="text-[11px] text-muted-foreground">Avg Monthly Inward</p>
          </div>
        </div>
      </div>

      {/* Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trends Chart */}
        <CollapsibleSection
          title="Monthly Trends (Quantity)"
          icon={<BarChart3 className="h-4 w-4" />}
        >
          <div className="p-4">
            <div className="flex items-end gap-3 h-44">
              {monthlyTrends.map((m, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div className="flex items-end gap-1 w-full h-40">
                    {/* Inward bar */}
                    <div className="flex-1 flex flex-col justify-end items-center">
                      <span className="text-[10px] text-muted-foreground mb-1">
                        {m.inwardQty > 0
                          ? m.inwardQty.toLocaleString("en-IN")
                          : ""}
                      </span>
                      <div
                        className="w-full bg-blue-500/70 dark:bg-blue-400/70 rounded-t transition-all"
                        style={{
                          height: `${
                            maxMonthlyQty > 0
                              ? (m.inwardQty / maxMonthlyQty) * 140
                              : 0
                          }px`,
                          minHeight: m.inwardQty > 0 ? "4px" : "0px",
                        }}
                      />
                    </div>
                    {/* Outward bar */}
                    <div className="flex-1 flex flex-col justify-end items-center">
                      <span className="text-[10px] text-muted-foreground mb-1">
                        {m.outwardQty > 0
                          ? m.outwardQty.toLocaleString("en-IN")
                          : ""}
                      </span>
                      <div
                        className="w-full bg-orange-500/70 dark:bg-orange-400/70 rounded-t transition-all"
                        style={{
                          height: `${
                            maxMonthlyQty > 0
                              ? (m.outwardQty / maxMonthlyQty) * 140
                              : 0
                          }px`,
                          minHeight: m.outwardQty > 0 ? "4px" : "0px",
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 whitespace-nowrap">
                    {m.month.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-blue-500/70 dark:bg-blue-400/70" />
                <span className="text-xs text-muted-foreground">Inward</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-orange-500/70 dark:bg-orange-400/70" />
                <span className="text-xs text-muted-foreground">Outward</span>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Customer Growth Over Time */}
        <CollapsibleSection
          title="Customer Growth"
          icon={<UserPlus className="h-4 w-4" />}
        >
          <div className="p-4">
            {(() => {
              const maxNew = Math.max(
                ...customerGrowth.map((c) => c.newCustomers),
                1
              );
              return (
                <>
                  <div className="flex items-end gap-2 h-32">
                    {customerGrowth.map((c, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end"
                      >
                        <span className="text-[10px] text-muted-foreground mb-1">
                          {c.newCustomers > 0 ? c.newCustomers : ""}
                        </span>
                        <div
                          className="w-full bg-purple-500/70 dark:bg-purple-400/70 rounded-t transition-all"
                          style={{
                            height: `${
                              c.newCustomers > 0
                                ? (c.newCustomers / maxNew) * 100
                                : 0
                            }px`,
                            minHeight: c.newCustomers > 0 ? "4px" : "0px",
                          }}
                        />
                        <span className="text-[9px] text-muted-foreground mt-1 whitespace-nowrap">
                          {c.month.split(" ")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-purple-500/70 dark:bg-purple-400/70" />
                      <span>{customerGrowth.reduce((sum, c) => sum + c.newCustomers, 0)} new in 12 months</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </CollapsibleSection>
      </div>

      {/* Top Customers + Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Customers */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-2.5 border-b bg-muted/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Top Customers
            </h3>
            <span className="text-xs text-muted-foreground">{topCustomers.length}</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {topCustomers.length > 0 ? (
              <table className="w-full text-sm">
                <tbody>
                  {topCustomers.map((tc, i) => {
                    const maxQty = topCustomers[0]?.quantity || 1;
                    const pct = Math.round((tc.quantity / maxQty) * 100);
                    return (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="pl-4 py-2 w-8 text-xs text-muted-foreground font-medium">{i + 1}</td>
                        <td className="py-2 font-medium">{tc.customer}</td>
                        <td className="py-2 pr-4 text-right w-32">
                          <div className="flex items-center gap-2 justify-end">
                            <div className="w-16 bg-muted rounded-full h-1.5">
                              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground w-12 text-right">{tc.quantity.toLocaleString("en-IN")}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">No customer data</p>
            )}
          </div>
        </div>

        {/* Top Items */}
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-2.5 border-b bg-muted/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Boxes className="h-4 w-4" />
              Top Items
            </h3>
            <span className="text-xs text-muted-foreground">{topItems.length}</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {topItems.length > 0 ? (
              <table className="w-full text-sm">
                <tbody>
                  {topItems.map((ti, i) => {
                    const maxQty = topItems[0]?.quantity || 1;
                    const pct = Math.round((ti.quantity / maxQty) * 100);
                    return (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="pl-4 py-2 w-8 text-xs text-muted-foreground font-medium">{i + 1}</td>
                        <td className="py-2 font-medium">{ti.item}</td>
                        <td className="py-2 pr-4 text-right w-32">
                          <div className="flex items-center gap-2 justify-end">
                            <div className="w-16 bg-muted rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground w-12 text-right">{ti.quantity.toLocaleString("en-IN")}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">No item data</p>
            )}
          </div>
        </div>
      </div>

      {/* Customer Balance Summary */}
      {customerBalances.length > 0 && (
        <CollapsibleSection
          title="Customer Balance Summary"
          icon={<Wallet className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
          badge={
            <span className="ml-2 text-xs bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-400 px-2 py-0.5 rounded-full">
              {customerBalances.length}
            </span>
          }
          defaultOpen={false}
        >
          <div className="max-h-96 overflow-y-auto">
            <div className="p-3 space-y-2">
              {customerBalances.map((cb, i) => {
                const isNegative = cb.remaining < 0;
                return (
                <div
                  key={cb.customer}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                    isNegative
                      ? "border-red-300 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20"
                      : "bg-muted/20 hover:bg-muted/40"
                  }`}
                >
                  <span className="text-xs font-bold text-muted-foreground w-5 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{cb.customer}</p>
                      {isNegative && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                          OVER-DISPATCHED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span>In: {cb.totalInward.toLocaleString("en-IN")}</span>
                      <span>Out: {cb.totalOutward.toLocaleString("en-IN")}</span>
                      <span className={`font-semibold ${
                        isNegative ? "text-red-600 dark:text-red-400" : "text-foreground"
                      }`}>
                        Bal: {cb.remaining.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="mt-1 w-full bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isNegative
                            ? "bg-red-500 dark:bg-red-400"
                            : cb.dispatchPercent >= 80
                            ? "bg-orange-500"
                            : cb.dispatchPercent >= 50
                            ? "bg-amber-500"
                            : "bg-teal-500"
                        }`}
                        style={{ width: `${Math.min(isNegative ? 100 : cb.dispatchPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-xs font-medium whitespace-nowrap ${
                    isNegative ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
                  }`}>
                    {isNegative ? `${cb.dispatchPercent}% out!` : `${cb.dispatchPercent}% out`}
                  </span>
                </div>
                );
              })}
            </div>
          </div>
        </CollapsibleSection>
      )}
    </>
  );
};

export default AnalyticsTab;
