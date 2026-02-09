import React from "react";
import { db } from "@/lib/db";
import DashboardSummary from "@/components/dashboard/DashboardSummary";

const Dashboard = async () => {
  const [inwardData, outwardData] = await Promise.all([
    db.inward.findMany({
      select: {
        id: true,
        addDate: true,
        inumber: true,
        customer: true,
        item: true,
        quantity: true,
        store_rate: true,
        labour_rate: true,
      },
      orderBy: { addDate: "desc" },
    }),
    db.outward.findMany({
      select: {
        id: true,
        outDate: true,
        onumber: true,
        inumber: true,
        customer: true,
        item: true,
        quantity: true,
      },
      orderBy: { outDate: "desc" },
    }),
  ]);

  const totalInwardRecords = inwardData.length;
  const totalOutwardRecords = outwardData.length;

  const totalInwardQuantity = inwardData.reduce(
    (sum, item) => sum + (parseInt(item.quantity) || 0),
    0
  );
  const totalOutwardQuantity = outwardData.reduce(
    (sum, item) => sum + (parseInt(item.quantity) || 0),
    0
  );
  const currentStock = totalInwardQuantity - totalOutwardQuantity;

  // Unique customers from inward
  const uniqueCustomers = new Set(inwardData.map((item) => item.customer));

  // Recent 10 inward records
  const recentInward = inwardData.slice(0, 10).map((item) => ({
    id: item.id,
    inumber: item.inumber,
    addDate: item.addDate.toISOString(),
    customer: item.customer,
    item: item.item,
    quantity: item.quantity,
  }));

  // Recent 10 outward records
  const recentOutward = outwardData.slice(0, 10).map((item) => ({
    id: item.id,
    onumber: item.onumber,
    inumber: item.inumber,
    outDate: item.outDate.toISOString(),
    customer: item.customer,
    item: item.item,
    quantity: item.quantity,
  }));

  return (
    <DashboardSummary
      stats={{
        totalInwardRecords,
        totalOutwardRecords,
        totalInwardQuantity,
        totalOutwardQuantity,
        currentStock,
        totalCustomers: uniqueCustomers.size,
      }}
      recentInward={recentInward}
      recentOutward={recentOutward}
    />
  );
};

export default Dashboard;