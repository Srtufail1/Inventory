"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  MonitorDown,
  MonitorUp,
  Package,
  Users,
  WarehouseIcon,
  BarChart3,
  TrendingUp,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { signOut } from "next-auth/react";
import DarkModeToggle from "../DarkModeToggle";
import { format } from "date-fns";
import Link from "next/link";

type Stats = {
  totalInwardRecords: number;
  totalOutwardRecords: number;
  totalInwardQuantity: number;
  totalOutwardQuantity: number;
  currentStock: number;
  totalCustomers: number;
};

type RecentInward = {
  id: string;
  inumber: string;
  addDate: string;
  customer: string;
  item: string;
  quantity: string;
};

type RecentOutward = {
  id: string;
  onumber: string;
  inumber: string;
  outDate: string;
  customer: string;
  item: string;
  quantity: string;
};

type TopCustomer = {
  customer: string;
  quantity: number;
};

type RecentLog = {
  id: string;
  action: string;
  entity: string;
  userName: string;
  customer: string | null;
  inumber: string | null;
  createdAt: string;
};

type Props = {
  stats: Stats;
  recentInward: RecentInward[];
  recentOutward: RecentOutward[];
  topCustomers: TopCustomer[];
  recentLogs: RecentLog[];
};

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "orange" | "purple" | "green" | "red" | "teal";
}) => {
  const colorMap = {
    blue: "border-blue-500/30 bg-blue-500/10 dark:bg-blue-500/5",
    orange: "border-orange-500/30 bg-orange-500/10 dark:bg-orange-500/5",
    purple: "border-purple-500/30 bg-purple-500/10 dark:bg-purple-500/5",
    green: "border-green-500/30 bg-green-500/10 dark:bg-green-500/5",
    red: "border-red-500/30 bg-red-500/10 dark:bg-red-500/5",
    teal: "border-teal-500/30 bg-teal-500/10 dark:bg-teal-500/5",
  };
  const iconColorMap = {
    blue: "text-blue-600 dark:text-blue-400",
    orange: "text-orange-600 dark:text-orange-400",
    purple: "text-purple-600 dark:text-purple-400",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    teal: "text-teal-600 dark:text-teal-400",
  };

  return (
    <div className={`border rounded-xl p-5 transition-all hover:shadow-md ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${iconColorMap[color]}`}>
            {typeof value === "number" ? value.toLocaleString("en-IN") : value}
          </p>
        </div>
        <div className={`${iconColorMap[color]} opacity-70`}>{icon}</div>
      </div>
    </div>
  );
};

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400",
  update: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400",
  delete: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400",
};

const DashboardSummary: React.FC<Props> = ({
  stats,
  recentInward,
  recentOutward,
  topCustomers,
  recentLogs,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return "N/A";
    }
  };

  const stockPercentage =
    stats.totalInwardQuantity > 0
      ? Math.round((stats.currentStock / stats.totalInwardQuantity) * 100)
      : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-muted/40 px-6">
        <div className="flex items-center gap-3 w-full">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium text-foreground">Dashboard</span>
        </div>
        <DarkModeToggle />
        <Button variant="outline" onClick={() => signOut()} type="submit">
          Sign Out
        </Button>
      </div>

      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Inward Records"
            value={stats.totalInwardRecords}
            icon={<MonitorDown className="h-8 w-8" />}
            color="blue"
          />
          <StatCard
            title="Total Outward Records"
            value={stats.totalOutwardRecords}
            icon={<MonitorUp className="h-8 w-8" />}
            color="orange"
          />
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={<Users className="h-8 w-8" />}
            color="purple"
          />
          <StatCard
            title="Total Inward Quantity"
            value={stats.totalInwardQuantity}
            icon={<Package className="h-8 w-8" />}
            color="green"
          />
          <StatCard
            title="Total Outward Quantity"
            value={stats.totalOutwardQuantity}
            icon={<Package className="h-8 w-8" />}
            color="red"
          />
          <StatCard
            title="Current Stock (Qty)"
            value={stats.currentStock}
            icon={<WarehouseIcon className="h-8 w-8" />}
            color="teal"
          />
        </div>

        {/* Stock utilization bar */}
        <div className="border rounded-xl p-5 bg-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Stock Utilization
            </h3>
            <span className="text-sm text-muted-foreground">
              {stockPercentage}% in storage
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-teal-500 dark:bg-teal-400 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Dispatched: {stats.totalOutwardQuantity.toLocaleString("en-IN")}</span>
            <span>In Storage: {stats.currentStock.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Middle row: Top Customers + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Customers */}
          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="px-6 py-4 border-b bg-muted/50">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Top Customers by Quantity
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {topCustomers.length > 0 ? (
                topCustomers.map((tc, i) => {
                  const maxQty = topCustomers[0]?.quantity || 1;
                  const pct = Math.round((tc.quantity / maxQty) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">{tc.customer}</span>
                        <span className="text-muted-foreground">{tc.quantity.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-purple-500 dark:bg-purple-400 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">No customer data</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="px-6 py-4 border-b bg-muted/50 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Recent Activity
              </h3>
              <Link
                href="/dashboard/logs"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="px-6 py-3 flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        actionColors[log.action] || ""
                      }`}
                    >
                      {log.action}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        <span className="font-medium">{log.userName}</span>{" "}
                        {log.action === "create" ? "created" : log.action === "update" ? "updated" : "deleted"}{" "}
                        <span className="text-muted-foreground">{log.entity}</span>
                        {log.customer && (
                          <span className="text-muted-foreground"> — {log.customer}</span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Inward */}
          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="px-6 py-4 border-b bg-muted/50 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <MonitorDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Recent Inward
              </h3>
              <Link
                href="/dashboard/inward"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inward No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInward.length > 0 ? (
                    recentInward.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.inumber}
                        </TableCell>
                        <TableCell>{formatDate(item.addDate)}</TableCell>
                        <TableCell>{item.customer}</TableCell>
                        <TableCell>{item.item}</TableCell>
                        <TableCell className="text-right">
                          {parseInt(item.quantity || "0").toLocaleString(
                            "en-IN"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No inward records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Recent Outward */}
          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="px-6 py-4 border-b bg-muted/50 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <MonitorUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                Recent Outward
              </h3>
              <Link
                href="/dashboard/outward"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Outward No.</TableHead>
                    <TableHead>Inward No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOutward.length > 0 ? (
                    recentOutward.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.onumber}
                        </TableCell>
                        <TableCell>{item.inumber}</TableCell>
                        <TableCell>{formatDate(item.outDate)}</TableCell>
                        <TableCell>{item.customer}</TableCell>
                        <TableCell>{item.item}</TableCell>
                        <TableCell className="text-right">
                          {parseInt(item.quantity || "0").toLocaleString(
                            "en-IN"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No outward records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;