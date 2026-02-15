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
      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="px-4 py-2.5 border-b bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-orange-500/5 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Today&apos;s Activity</h3>
          <span className="text-xs text-muted-foreground ml-auto">{format(new Date(), "EEEE, dd MMMM yyyy")}</span>
        </div>
        <div className="grid grid-cols-4 divide-x">
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{todayActivity.inwardCount}</p>
            <p className="text-[11px] text-muted-foreground">Inward Entries</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{todayActivity.outwardCount}</p>
            <p className="text-[11px] text-muted-foreground">Outward Entries</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{todayActivity.inwardQty.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-muted-foreground">Qty Received</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{todayActivity.outwardQty.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-muted-foreground">Qty Dispatched</p>
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
