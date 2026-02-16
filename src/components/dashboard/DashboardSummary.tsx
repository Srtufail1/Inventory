"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Activity,
  Shield,
} from "lucide-react";
import { signOut } from "next-auth/react";
import DarkModeToggle from "../DarkModeToggle";
import OverviewTab from "./OverviewTab";
import AnalyticsTab from "./AnalyticsTab";
import AlertsTab from "./AlertsTab";
import MonitoringTab from "./MonitoringTab";
import ActivityTab from "./ActivityTab";
import type { Props } from "./types";

const DashboardSummary: React.FC<Props> = ({
  stats,
  recentInward,
  recentOutward,
  topCustomers,
  recentLogs,
  monthlyTrends,
  topItems,
  todayActivity,
  monthChange,
  customerGrowth,
  orphanedOutward,
  duplicateAlerts,
  quantityMismatches,
  customerBalances,
  staleRecords,
  emptyQuantityFlags,
  userActivityScoreboard,
  quantityChangeLogs,
  dailyEntrySummary,
  recentlyDeleted,
  missingRateAlerts,
  rateChangeLogs,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "alerts" | "monitoring" | "activity">("overview");

  const totalAlerts = useMemo(() => {
    return (
      duplicateAlerts.length +
      quantityMismatches.length +
      orphanedOutward.length +
      staleRecords.length +
      emptyQuantityFlags.length +
      missingRateAlerts.length
    );
  }, [duplicateAlerts, quantityMismatches, orphanedOutward, staleRecords, emptyQuantityFlags, missingRateAlerts]);

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { key: "analytics" as const, label: "Analytics", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { key: "alerts" as const, label: "Alerts", icon: <AlertTriangle className="h-3.5 w-3.5" />, badge: totalAlerts },
    { key: "monitoring" as const, label: "Monitoring", icon: <Shield className="h-3.5 w-3.5" /> },
    { key: "activity" as const, label: "Activity", icon: <Activity className="h-3.5 w-3.5" /> },
  ];

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

      <div className="p-4 space-y-5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg border sticky top-0 z-10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <OverviewTab
            stats={stats}
            todayActivity={todayActivity}
            monthChange={monthChange}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab
            monthlyTrends={monthlyTrends}
            customerGrowth={customerGrowth}
            topCustomers={topCustomers}
            topItems={topItems}
            customerBalances={customerBalances}
          />
        )}

        {activeTab === "alerts" && (
          <AlertsTab
            totalAlerts={totalAlerts}
            duplicateAlerts={duplicateAlerts}
            quantityMismatches={quantityMismatches}
            orphanedOutward={orphanedOutward}
            staleRecords={staleRecords}
            emptyQuantityFlags={emptyQuantityFlags}
            missingRateAlerts={missingRateAlerts}
          />
        )}

        {activeTab === "monitoring" && (
          <MonitoringTab
            userActivityScoreboard={userActivityScoreboard}
            dailyEntrySummary={dailyEntrySummary}
            quantityChangeLogs={quantityChangeLogs}
            rateChangeLogs={rateChangeLogs}
            recentlyDeleted={recentlyDeleted}
          />
        )}

        {activeTab === "activity" && (
          <ActivityTab
            recentLogs={recentLogs}
            recentInward={recentInward}
            recentOutward={recentOutward}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardSummary;