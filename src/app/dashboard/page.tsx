import React from "react";
import { db } from "@/lib/db";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import DashboardSummary from "@/components/dashboard/DashboardSummary";

const Dashboard = async () => {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { isSuperAdmin: true },
  });

  if (!user?.isSuperAdmin) {
    redirect("/dashboard/inward");
  }

  const [inwardData, outwardData, recentLogs] = await Promise.all([
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
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
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

  // Top 5 customers by inward quantity
  const customerQuantities: Record<string, number> = {};
  inwardData.forEach((item) => {
    const qty = parseInt(item.quantity) || 0;
    customerQuantities[item.customer] = (customerQuantities[item.customer] || 0) + qty;
  });
  const topCustomers = Object.entries(customerQuantities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([customer, quantity]) => ({ customer, quantity }));

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

  // Serialize audit logs
  const serializedLogs = recentLogs.map((log) => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
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
      topCustomers={topCustomers}
      recentLogs={serializedLogs}
    />
  );
};

export default Dashboard;