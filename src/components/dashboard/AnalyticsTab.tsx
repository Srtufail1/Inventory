"use client";

import React from "react";
import {
  TrendingUp,
  UserPlus,
  Users,
  Boxes,
  Wallet,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import CollapsibleSection from "./CollapsibleSection";
import { Badge } from "./dashboard-utils";
import type {
  MonthlyTrend,
  CustomerGrowth,
  TopCustomer,
  TopItem,
  CustomerBalance,
} from "./types";

// ── Reusable RankedList ─────────────────────────────────────────────

const RankedList = <T extends Record<string, any>>({
  items,
  labelKey,
  valueKey,
  barColor,
}: {
  items: T[];
  labelKey: keyof T;
  valueKey: keyof T;
  barColor: string;
}) => {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm text-center py-4">
        No data
      </p>
    );
  }

  const maxQty = (items[0]?.[valueKey] as number) || 1;

  return (
    <table className="w-full text-sm">
      <tbody>
        {items.map((item, i) => {
          const value = item[valueKey] as number;
          const pct = Math.round((value / maxQty) * 100);
          return (
            <tr
              key={i}
              className="border-b last:border-0 hover:bg-muted/30 transition-colors"
            >
              <td className="pl-4 py-2 w-8 text-xs text-muted-foreground font-medium">
                {i + 1}
              </td>
              <td className="py-2 font-medium">{String(item[labelKey])}</td>
              <td className="py-2 pr-4 text-right w-32">
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-16 bg-muted rounded-full h-1.5">
                    <div
                      className={`${barColor} h-1.5 rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {value.toLocaleString("en-IN")}
                  </span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

// ── CustomerBalanceCard ─────────────────────────────────────────────

const CustomerBalanceCard = ({
  cb,
  index,
}: {
  cb: CustomerBalance;
  index: number;
}) => {
  const isNegative = cb.remaining < 0;

  const barColor = isNegative
    ? "bg-red-500 dark:bg-red-400"
    : cb.dispatchPercent >= 80
    ? "bg-orange-500"
    : cb.dispatchPercent >= 50
    ? "bg-amber-500"
    : "bg-teal-500";

  return (
    <div
      className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
        isNegative
          ? "border-red-300 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20"
          : "bg-muted/20 hover:bg-muted/40"
      }`}
    >
      <span className="text-xs font-bold text-muted-foreground w-5 text-center">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{cb.customer}</p>
          {isNegative && <Badge color="red">OVER-DISPATCHED</Badge>}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <span>In: {cb.totalInward.toLocaleString("en-IN")}</span>
          <span>Out: {cb.totalOutward.toLocaleString("en-IN")}</span>
          <span
            className={`font-semibold ${
              isNegative
                ? "text-red-600 dark:text-red-400"
                : "text-foreground"
            }`}
          >
            Bal: {cb.remaining.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="mt-1 w-full bg-muted rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${barColor}`}
            style={{
              width: `${Math.min(isNegative ? 100 : cb.dispatchPercent, 100)}%`,
            }}
          />
        </div>
      </div>
      <span
        className={`text-xs font-medium whitespace-nowrap ${
          isNegative
            ? "text-red-600 dark:text-red-400"
            : "text-muted-foreground"
        }`}
      >
        {isNegative
          ? `${cb.dispatchPercent}% out!`
          : `${cb.dispatchPercent}% out`}
      </span>
    </div>
  );
};

// ── Custom tooltip for recharts ─────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border rounded-lg shadow-lg p-2.5 text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {Number(entry.value).toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────

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
  // Shorten month labels for chart axis (e.g. "Jan 2025" → "Jan")
  const trendsData = monthlyTrends.map((m) => ({
    ...m,
    shortMonth: m.month.split(" ")[0],
  }));

  const growthData = customerGrowth.map((c) => ({
    ...c,
    shortMonth: c.month.split(" ")[0],
  }));

  return (
    <>
      {/* Analytics Quick Stats */}
      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="px-4 py-2.5 border-b bg-muted/50 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-foreground">
            Trends at a Glance
          </h3>
          <span className="ml-auto text-xs text-muted-foreground">
            Last {monthlyTrends.length} months
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x">
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {monthlyTrends
                .reduce((s, m) => s + m.inwardQty, 0)
                .toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Total Inward Qty
            </p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {monthlyTrends
                .reduce((s, m) => s + m.outwardQty, 0)
                .toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Total Outward Qty
            </p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {customerGrowth.reduce((s, c) => s + c.newCustomers, 0)}
            </p>
            <p className="text-[11px] text-muted-foreground">New Customers</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
              {monthlyTrends.length > 0
                ? Math.round(
                    monthlyTrends.reduce((s, m) => s + m.inwardQty, 0) /
                      monthlyTrends.length
                  ).toLocaleString("en-IN")
                : 0}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Avg Monthly Inward
            </p>
          </div>
        </div>
      </div>

      {/* Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trends Chart — recharts */}
        <CollapsibleSection
          title="Monthly Trends (Quantity)"
          icon={<TrendingUp className="h-4 w-4" />}
        >
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={trendsData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <XAxis
                  dataKey="shortMonth"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v.toLocaleString("en-IN")}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  iconSize={10}
                  iconType="square"
                />
                <Bar
                  dataKey="inwardQty"
                  name="Inward"
                  fill="hsl(217, 91%, 60%)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="outwardQty"
                  name="Outward"
                  fill="hsl(25, 95%, 53%)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CollapsibleSection>

        {/* Customer Growth Chart — recharts */}
        <CollapsibleSection
          title="Customer Growth"
          icon={<UserPlus className="h-4 w-4" />}
        >
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={growthData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <XAxis
                  dataKey="shortMonth"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="newCustomers"
                  name="New Customers"
                  fill="hsl(271, 91%, 65%)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center mt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-purple-500/70 dark:bg-purple-400/70" />
                <span>
                  {customerGrowth.reduce((sum, c) => sum + c.newCustomers, 0)}{" "}
                  new in 12 months
                </span>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Top Customers + Top Items — reusable RankedList */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-2.5 border-b bg-muted/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Top Customers
            </h3>
            <span className="text-xs text-muted-foreground">
              {topCustomers.length}
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <RankedList
              items={topCustomers}
              labelKey="customer"
              valueKey="quantity"
              barColor="bg-purple-500"
            />
          </div>
        </div>

        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-2.5 border-b bg-muted/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Boxes className="h-4 w-4" />
              Top Items
            </h3>
            <span className="text-xs text-muted-foreground">
              {topItems.length}
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <RankedList
              items={topItems}
              labelKey="item"
              valueKey="quantity"
              barColor="bg-green-500"
            />
          </div>
        </div>
      </div>

      {/* Customer Balance Summary — extracted cards */}
      {customerBalances.length > 0 && (
        <CollapsibleSection
          title="Customer Balance Summary"
          icon={
            <Wallet className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          }
          badge={
            <Badge color="teal" className="ml-2">
              {customerBalances.length}
            </Badge>
          }
          defaultOpen={false}
        >
          <div className="max-h-96 overflow-y-auto">
            <div className="p-3 space-y-2">
              {customerBalances.map((cb, i) => (
                <CustomerBalanceCard key={cb.customer} cb={cb} index={i} />
              ))}
            </div>
          </div>
        </CollapsibleSection>
      )}
    </>
  );
};

export default AnalyticsTab;