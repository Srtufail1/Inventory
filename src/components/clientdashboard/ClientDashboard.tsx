"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MonitorDown,
  MonitorUp,
  Package,
  WarehouseIcon,
  Search,
} from "lucide-react";
import { format } from "date-fns";

type InwardRecord = {
  id: string;
  inumber: string;
  addDate: string;
  customer: string;
  item: string;
  packing: string;
  weight: string;
  quantity: string;
  store_rate: string;
  labour_rate: string;
};

type OutwardRecord = {
  id: string;
  onumber: string;
  inumber: string;
  outDate: string;
  customer: string;
  item: string;
  quantity: string;
};

type Props = {
  userName: string;
  inwardData: InwardRecord[];
  outwardData: OutwardRecord[];
};

const ClientDashboard: React.FC<Props> = ({
  userName,
  inwardData,
  outwardData,
}) => {
  const [activeTab, setActiveTab] = useState<"inward" | "outward">("inward");
  const [searchTerm, setSearchTerm] = useState("");

  const totalInwardQty = inwardData.reduce(
    (sum, item) => sum + (parseInt(item.quantity) || 0),
    0
  );
  const totalOutwardQty = outwardData.reduce(
    (sum, item) => sum + (parseInt(item.quantity) || 0),
    0
  );
  const currentStock = totalInwardQty - totalOutwardQty;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return "N/A";
    }
  };

  const filteredInward = inwardData.filter(
    (item) =>
      item.inumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOutward = outwardData.filter(
    (item) =>
      item.onumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.inumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {userName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here is an overview of your cold storage records.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-500/10 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Inward
                </p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-400 mt-1">
                  {totalInwardQty.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {inwardData.length} record(s)
                </p>
              </div>
              <MonitorDown className="h-8 w-8 text-blue-800 dark:text-blue-400 opacity-80" />
            </div>
          </div>

          <div className="bg-orange-500/10 dark:bg-orange-500/5 border border-orange-200 dark:border-orange-800 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Outward
                </p>
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-400 mt-1">
                  {totalOutwardQty.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  {outwardData.length} record(s)
                </p>
              </div>
              <MonitorUp className="h-8 w-8 text-orange-800 dark:text-orange-400 opacity-80" />
            </div>
          </div>

          <div className="bg-teal-500/10 dark:bg-teal-500/5 border border-teal-200 dark:border-teal-800 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Current Stock
                </p>
                <p className="text-2xl font-bold text-teal-800 dark:text-teal-400 mt-1">
                  {currentStock.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-teal-600 mt-1">items in storage</p>
              </div>
              <WarehouseIcon className="h-8 w-8 text-teal-800 dark:text-teal-400 opacity-80" />
            </div>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="bg-card shadow rounded-lg overflow-hidden border">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("inward")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "inward"
                    ? "bg-blue-100 text-blue-800"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="flex items-center gap-2">
                  <MonitorDown className="h-4 w-4" />
                  Inward ({inwardData.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("outward")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "outward"
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-400"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="flex items-center gap-2">
                  <MonitorUp className="h-4 w-4" />
                  Outward ({outwardData.length})
                </span>
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>

          {/* Inward Table */}
          {activeTab === "inward" && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inward No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Packing</TableHead>
                    <TableHead>Weight (Kg)</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Store Rate</TableHead>
                    <TableHead className="text-right">Labour Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInward.length > 0 ? (
                    filteredInward.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.inumber}
                        </TableCell>
                        <TableCell>{formatDate(item.addDate)}</TableCell>
                        <TableCell>{item.item}</TableCell>
                        <TableCell>{item.packing}</TableCell>
                        <TableCell>{item.weight}</TableCell>
                        <TableCell className="text-right">
                          {parseInt(item.quantity || "0").toLocaleString(
                            "en-IN"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.store_rate}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.labour_rate}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        {searchTerm
                          ? "No matching inward records found."
                          : "No inward records found for your account."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Outward Table */}
          {activeTab === "outward" && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Outward No.</TableHead>
                    <TableHead>Inward No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOutward.length > 0 ? (
                    filteredOutward.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.onumber}
                        </TableCell>
                        <TableCell>{item.inumber}</TableCell>
                        <TableCell>{formatDate(item.outDate)}</TableCell>
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
                        {searchTerm
                          ? "No matching outward records found."
                          : "No outward records found for your account."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Info Note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Records are matched by your account name. If you don&apos;t see your
          data, please contact the administrator.
        </p>
      </div>
    </div>
  );
};

export default ClientDashboard;