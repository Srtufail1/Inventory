"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  ClipboardList,
  ArrowRight,
  MonitorDown,
  MonitorUp,
  Search,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import CollapsibleSection from "./CollapsibleSection";
import { formatDate, actionColors, Badge } from "./dashboard-utils";
import type { RecentLog, RecentInward, RecentOutward } from "./types";

const ActivityTab = ({
  recentLogs,
  recentInward,
  recentOutward,
}: {
  recentLogs: RecentLog[];
  recentInward: RecentInward[];
  recentOutward: RecentOutward[];
}) => {
  const [inwardSearch, setInwardSearch] = useState("");
  const [outwardSearch, setOutwardSearch] = useState("");

  const filteredInward = useMemo(() => {
    if (!inwardSearch.trim()) return recentInward;
    const q = inwardSearch.toLowerCase();
    return recentInward.filter(
      (item) =>
        item.inumber.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q) ||
        item.item.toLowerCase().includes(q)
    );
  }, [recentInward, inwardSearch]);

  const filteredOutward = useMemo(() => {
    if (!outwardSearch.trim()) return recentOutward;
    const q = outwardSearch.toLowerCase();
    return recentOutward.filter(
      (item) =>
        item.onumber.toLowerCase().includes(q) ||
        item.inumber.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q) ||
        item.item.toLowerCase().includes(q)
    );
  }, [recentOutward, outwardSearch]);

  const actionDotColor: Record<string, string> = {
    create: "bg-green-500",
    update: "bg-yellow-500",
    delete: "bg-red-500",
  };

  const actionVerb: Record<string, string> = {
    create: "created",
    update: "updated",
    delete: "deleted",
  };

  const ViewAllLink = ({ href }: { href: string }) => (
    <Link
      href={href}
      className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      View all <ArrowRight className="h-3 w-3" />
    </Link>
  );

  return (
    <>
      {/* Activity Summary Bar */}
      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="px-4 py-2.5 border-b bg-muted/50 flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-500" />
          <h3 className="text-sm font-semibold text-foreground">
            Activity Summary
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x">
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-foreground">{recentLogs.length}</p>
            <p className="text-[11px] text-muted-foreground">Recent Logs</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              {recentLogs.filter((l) => l.action === "create").length}
            </p>
            <p className="text-[11px] text-muted-foreground">Creates</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {recentLogs.filter((l) => l.action === "update").length}
            </p>
            <p className="text-[11px] text-muted-foreground">Updates</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              {recentLogs.filter((l) => l.action === "delete").length}
            </p>
            <p className="text-[11px] text-muted-foreground">Deletes</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <CollapsibleSection
        title="Recent Activity"
        icon={<ClipboardList className="h-4 w-4" />}
        badge={<ViewAllLink href="/dashboard/logs" />}
      >
        <div className="divide-y max-h-80 overflow-y-auto">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="px-4 py-2.5 flex items-center gap-3 hover:bg-muted/30 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${actionDotColor[log.action] || ""}`} />
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${actionColors[log.action] || ""}`}>
                  {log.action}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    <span className="font-medium">{log.userName}</span>{" "}
                    {actionVerb[log.action] || log.action}{" "}
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
            <p className="text-muted-foreground text-sm text-center py-8">
              No recent activity
            </p>
          )}
        </div>
      </CollapsibleSection>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Inward */}
        <CollapsibleSection
          title="Recent Inward"
          icon={<MonitorDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          badge={<ViewAllLink href="/dashboard/inward" />}
        >
          <div className="px-4 py-2 border-b bg-muted/30">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search inward..."
                value={inwardSearch}
                onChange={(e) => setInwardSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
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
                {filteredInward.length > 0 ? (
                  filteredInward.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.inumber}</TableCell>
                      <TableCell>{formatDate(item.addDate)}</TableCell>
                      <TableCell>{item.customer}</TableCell>
                      <TableCell>{item.item}</TableCell>
                      <TableCell className="text-right">
                        {parseInt(item.quantity || "0").toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      {inwardSearch ? "No matching records." : "No inward records found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CollapsibleSection>

        {/* Recent Outward */}
        <CollapsibleSection
          title="Recent Outward"
          icon={<MonitorUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
          badge={<ViewAllLink href="/dashboard/outward" />}
        >
          <div className="px-4 py-2 border-b bg-muted/30">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search outward..."
                value={outwardSearch}
                onChange={(e) => setOutwardSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
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
                {filteredOutward.length > 0 ? (
                  filteredOutward.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.onumber}</TableCell>
                      <TableCell>{item.inumber}</TableCell>
                      <TableCell>{formatDate(item.outDate)}</TableCell>
                      <TableCell>{item.customer}</TableCell>
                      <TableCell>{item.item}</TableCell>
                      <TableCell className="text-right">
                        {parseInt(item.quantity || "0").toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      {outwardSearch ? "No matching records." : "No outward records found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CollapsibleSection>
      </div>
    </>
  );
};

export default ActivityTab;