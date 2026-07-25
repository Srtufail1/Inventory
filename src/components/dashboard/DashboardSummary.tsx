"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { ToolbarActions } from "@/components/PageToolbar";
import OverviewTab from "./OverviewTab";
import AnalyticsTab from "./AnalyticsTab";
import AlertsTab from "./AlertsTab";
import MonitoringTab from "./MonitoringTab";
import type { Props } from "./types";

const DashboardSummary: React.FC<Props> = ({
  stats,
  topCustomers,
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
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "alerts" | "monitoring">("overview");

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
    { key: "overview" as const, label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
    { key: "analytics" as const, label: "Analytics", icon: <TrendingUp className="h-4 w-4" /> },
    { key: "alerts" as const, label: "Alerts", icon: <AlertTriangle className="h-4 w-4" />, badge: totalAlerts },
    { key: "monitoring" as const, label: "Monitoring", icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="app-toolbar">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">Dashboard</span>
        </div>
        <ToolbarActions />
      </div>

      <div className="page-shell">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your inventory, track trends, and manage alerts.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="sticky top-14 z-10 grid grid-cols-4 gap-1 rounded-md border bg-card/90 p-1 shadow-sm backdrop-blur-sm lg:top-16">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors sm:px-4 ${
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.key
                    ? "bg-red-500 text-white"
                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
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
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;