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
} from "lucide-react";
import { signOut } from "next-auth/react";
import DarkModeToggle from "../DarkModeToggle";
import { format } from "date-fns";

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

type Props = {
  stats: Stats;
  recentInward: RecentInward[];
  recentOutward: RecentOutward[];
};

const StatCard = ({
  title,
  value,
  icon,
  bgColor,
  textColor,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
}) => (
  <div className={`${bgColor} border rounded-lg p-5`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${textColor}`}>
          {typeof value === "number" ? value.toLocaleString("en-IN") : value}
        </p>
      </div>
      <div className={`${textColor} opacity-80`}>{icon}</div>
    </div>
  </div>
);

const DashboardSummary: React.FC<Props> = ({
  stats,
  recentInward,
  recentOutward,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return "N/A";
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-gray-100/40 px-6">
        <div className="flex items-center gap-3 w-full">
          <BarChart3 className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-700">Dashboard</span>
        </div>
        <DarkModeToggle />
        <Button onClick={() => signOut()} type="submit">
          Sign Out
        </Button>
      </div>

      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Inward Records"
            value={stats.totalInwardRecords}
            icon={<MonitorDown className="h-8 w-8" />}
            bgColor="bg-blue-50 border-blue-200"
            textColor="text-blue-800"
          />
          <StatCard
            title="Total Outward Records"
            value={stats.totalOutwardRecords}
            icon={<MonitorUp className="h-8 w-8" />}
            bgColor="bg-orange-50 border-orange-200"
            textColor="text-orange-800"
          />
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={<Users className="h-8 w-8" />}
            bgColor="bg-purple-50 border-purple-200"
            textColor="text-purple-800"
          />
          <StatCard
            title="Total Inward Quantity"
            value={stats.totalInwardQuantity}
            icon={<Package className="h-8 w-8" />}
            bgColor="bg-green-50 border-green-200"
            textColor="text-green-800"
          />
          <StatCard
            title="Total Outward Quantity"
            value={stats.totalOutwardQuantity}
            icon={<Package className="h-8 w-8" />}
            bgColor="bg-red-50 border-red-200"
            textColor="text-red-800"
          />
          <StatCard
            title="Current Stock (Qty)"
            value={stats.currentStock}
            icon={<WarehouseIcon className="h-8 w-8" />}
            bgColor="bg-teal-50 border-teal-200"
            textColor="text-teal-800"
          />
        </div>

        {/* Recent Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Inward */}
          <div className="bg-white shadow rounded-lg overflow-hidden border">
            <div className="px-6 py-4 border-b bg-blue-50">
              <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                <MonitorDown className="h-5 w-5" />
                Recent Inward
              </h3>
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
                      <TableCell colSpan={5} className="h-24 text-center">
                        No inward records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Recent Outward */}
          <div className="bg-white shadow rounded-lg overflow-hidden border">
            <div className="px-6 py-4 border-b bg-orange-50">
              <h3 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
                <MonitorUp className="h-5 w-5" />
                Recent Outward
              </h3>
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
                      <TableCell colSpan={6} className="h-24 text-center">
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