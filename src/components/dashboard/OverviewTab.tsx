import React from "react";
import {
  CalendarDays,
  MonitorDown,
  MonitorUp,
  Users,
  Package,
  WarehouseIcon,
} from "lucide-react";
import { format } from "date-fns";
import StatCard from "./StatCard";
import type { Stats, TodayActivity, MonthChange } from "./types";

const OverviewTab = ({
  stats,
  todayActivity,
  monthChange,
}: {
  stats: Stats;
  todayActivity: TodayActivity;
  monthChange: MonthChange;
}) => {
  return (
    <>
      {/* Today's Highlight Banner */}
      <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
        <div className="px-5 py-3 border-b bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-orange-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-orange-500/10 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Today&apos;s Activity</h3>
          <span className="text-xs text-muted-foreground ml-auto font-medium">{format(new Date(), "EEEE, dd MMMM yyyy")}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0">
          <div className="p-4 text-center group hover:bg-muted/30 transition-colors">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">{todayActivity.inwardCount}</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Inward Entries</p>
          </div>
          <div className="p-4 text-center group hover:bg-muted/30 transition-colors">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform">{todayActivity.outwardCount}</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Outward Entries</p>
          </div>
          <div className="p-4 text-center group hover:bg-muted/30 transition-colors">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 group-hover:scale-105 transition-transform">{todayActivity.inwardQty.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Qty Received</p>
          </div>
          <div className="p-4 text-center group hover:bg-muted/30 transition-colors">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 group-hover:scale-105 transition-transform">{todayActivity.outwardQty.toLocaleString("en-IN")}</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Qty Dispatched</p>
          </div>
        </div>
      </div>

      {/* Stats Grid — compact 2x3 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard title="Inward Records" value={stats.totalInwardRecords} icon={<MonitorDown className="h-6 w-6" />} color="blue" change={monthChange.inwardCount} />
        <StatCard title="Outward Records" value={stats.totalOutwardRecords} icon={<MonitorUp className="h-6 w-6" />} color="orange" change={monthChange.outwardCount} />
        <StatCard title="Customers" value={stats.totalCustomers} icon={<Users className="h-6 w-6" />} color="purple" />
        <StatCard title="Inward Quantity" value={stats.totalInwardQuantity} icon={<Package className="h-6 w-6" />} color="green" change={monthChange.inwardQty} />
        <StatCard title="Outward Quantity" value={stats.totalOutwardQuantity} icon={<Package className="h-6 w-6" />} color="red" change={monthChange.outwardQty} />
        <StatCard title="Current Stock" value={stats.currentStock} icon={<WarehouseIcon className="h-6 w-6" />} color="teal" />
      </div>
    </>
  );
};

export default OverviewTab;
