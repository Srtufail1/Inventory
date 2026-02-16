import React, { Suspense } from "react";
import { db } from "@/lib/db";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import { Skeleton } from "@/components/ui/skeleton";
import {
  startOfDay,
  endOfDay,
  subMonths,
  subDays,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";

async function DashboardData() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const [inwardData, outwardData, allAuditLogs] = await Promise.all([
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
      where: {
        createdAt: { gte: subDays(now, 30) },
      },
      orderBy: { createdAt: "desc" },
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
    customerQuantities[item.customer] =
      (customerQuantities[item.customer] || 0) + qty;
  });
  const allCustomersSorted = Object.entries(customerQuantities)
    .sort(([, a], [, b]) => b - a)
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

  // Serialize audit logs — take 5 most recent from the already-fetched 30-day logs
  const serializedLogs = allAuditLogs.slice(0, 5).map((log) => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
  }));

  // === Monthly Trends (last 6 months) ===
  const monthlyTrends = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthLabel = format(monthDate, "MMM yyyy");

    const monthInward = inwardData.filter(
      (item) => item.addDate >= monthStart && item.addDate <= monthEnd
    );
    const monthOutward = outwardData.filter(
      (item) => item.outDate >= monthStart && item.outDate <= monthEnd
    );

    monthlyTrends.push({
      month: monthLabel,
      inwardCount: monthInward.length,
      outwardCount: monthOutward.length,
      inwardQty: monthInward.reduce(
        (sum, item) => sum + (parseInt(item.quantity) || 0),
        0
      ),
      outwardQty: monthOutward.reduce(
        (sum, item) => sum + (parseInt(item.quantity) || 0),
        0
      ),
    });
  }

  // === Top Items by Quantity ===
  const itemQuantities: Record<string, number> = {};
  inwardData.forEach((item) => {
    const qty = parseInt(item.quantity) || 0;
    itemQuantities[item.item] = (itemQuantities[item.item] || 0) + qty;
  });
  const allItemsSorted = Object.entries(itemQuantities)
    .sort(([, a], [, b]) => b - a)
    .map(([item, quantity]) => ({ item, quantity }));

  // === Today's Activity ===
  const todayInward = inwardData.filter(
    (item) => item.addDate >= todayStart && item.addDate <= todayEnd
  );
  const todayOutward = outwardData.filter(
    (item) => item.outDate >= todayStart && item.outDate <= todayEnd
  );
  const todayActivity = {
    inwardCount: todayInward.length,
    outwardCount: todayOutward.length,
    inwardQty: todayInward.reduce(
      (sum, item) => sum + (parseInt(item.quantity) || 0),
      0
    ),
    outwardQty: todayOutward.reduce(
      (sum, item) => sum + (parseInt(item.quantity) || 0),
      0
    ),
  };

  // === Low Stock Alerts (inward numbers with >= 80% dispatched) ===
  const inwardByNumber: Record<
    string,
    { customer: string; item: string; totalQty: number }
  > = {};
  inwardData.forEach((item) => {
    const qty = parseInt(item.quantity) || 0;
    if (!inwardByNumber[item.inumber]) {
      inwardByNumber[item.inumber] = {
        customer: item.customer,
        item: item.item,
        totalQty: 0,
      };
    }
    inwardByNumber[item.inumber].totalQty += qty;
  });

  const outwardByInumber: Record<string, number> = {};
  outwardData.forEach((item) => {
    const qty = parseInt(item.quantity) || 0;
    outwardByInumber[item.inumber] =
      (outwardByInumber[item.inumber] || 0) + qty;
  });

  // === Missing Rate Alerts (inward records with missing store_rate or labour_rate) ===
  const missingRateAlerts = inwardData
    .filter((item) => {
      const sr = parseFloat(item.store_rate || "");
      const lr = parseFloat(item.labour_rate || "");
      return !item.store_rate || !item.labour_rate || isNaN(sr) || isNaN(lr) || sr <= 0 || lr <= 0;
    })
    .slice(0, 50)
    .map((item) => ({
      id: item.id,
      inumber: item.inumber,
      customer: item.customer,
      item: item.item,
      addDate: item.addDate.toISOString(),
      store_rate: item.store_rate || "",
      labour_rate: item.labour_rate || "",
      missingStore: !item.store_rate || isNaN(parseFloat(item.store_rate)) || parseFloat(item.store_rate) <= 0,
      missingLabour: !item.labour_rate || isNaN(parseFloat(item.labour_rate)) || parseFloat(item.labour_rate) <= 0,
    }));

  // === Customer Growth Over Time (last 12 months) ===
  const customerFirstSeen: Record<string, Date> = {};
  inwardData.forEach((item) => {
    if (
      !customerFirstSeen[item.customer] ||
      item.addDate < customerFirstSeen[item.customer]
    ) {
      customerFirstSeen[item.customer] = item.addDate;
    }
  });

  const customerGrowth = [];
  for (let i = 11; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthLabel = format(monthDate, "MMM yyyy");

    const newCustomers = Object.entries(customerFirstSeen).filter(
      ([, firstDate]) => firstDate >= monthStart && firstDate <= monthEnd
    ).length;

    customerGrowth.push({
      month: monthLabel,
      newCustomers,
    });
  }

  // === Duplicate Inward Detection ===
  // Group by inward number and check for different customers or items
  const inwardGrouped: Record<
    string,
    { customers: Set<string>; items: Set<string>; count: number }
  > = {};
  inwardData.forEach((item) => {
    if (!inwardGrouped[item.inumber]) {
      inwardGrouped[item.inumber] = {
        customers: new Set(),
        items: new Set(),
        count: 0,
      };
    }
    inwardGrouped[item.inumber].customers.add(item.customer);
    inwardGrouped[item.inumber].items.add(item.item);
    inwardGrouped[item.inumber].count++;
  });

  const duplicateAlerts = Object.entries(inwardGrouped)
    .filter(
      ([, data]) => data.customers.size > 1 || data.count > 1
    )
    .map(([inumber, data]) => ({
      inumber,
      customers: Array.from(data.customers),
      items: Array.from(data.items),
      count: data.count,
      hasDifferentCustomers: data.customers.size > 1,
      hasDifferentItems: data.items.size > 1,
    }))
    .sort((a, b) => {
      // Prioritize those with different customers first
      if (a.hasDifferentCustomers !== b.hasDifferentCustomers)
        return a.hasDifferentCustomers ? -1 : 1;
      return b.count - a.count;
    })
    .slice(0, 10);

  // === Quantity Mismatch Alerts (outward > inward) ===
  const quantityMismatches = Object.entries(inwardByNumber)
    .map(([inumber, data]) => {
      const totalOutward = outwardByInumber[inumber] || 0;
      const excess = totalOutward - data.totalQty;
      return {
        inumber,
        customer: data.customer,
        item: data.item,
        totalInward: data.totalQty,
        totalOutward,
        excess,
      };
    })
    .filter((item) => item.excess > 0)
    .sort((a, b) => b.excess - a.excess);

  // === Orphaned Outward Records (outward inward# not in inward table) ===
  const allInwardNumbers = new Set(inwardData.map((item) => item.inumber));
  const orphanedOutward = outwardData
    .filter((item) => !allInwardNumbers.has(item.inumber))
    .map((item) => ({
      id: item.id,
      onumber: item.onumber,
      inumber: item.inumber,
      outDate: item.outDate.toISOString(),
      customer: item.customer,
      item: item.item,
      quantity: item.quantity,
    }));

  // === Customer Balance Summary ===
  const customerBalances = Object.entries(customerQuantities)
    .map(([customer, totalInward]) => {
      const totalOutward = outwardData
        .filter((o) => o.customer === customer)
        .reduce((sum, o) => sum + (parseInt(o.quantity) || 0), 0);
      const remaining = totalInward - totalOutward;
      const dispatchPercent =
        totalInward > 0 ? Math.round((totalOutward / totalInward) * 100) : 0;
      return { customer, totalInward, totalOutward, remaining, dispatchPercent };
    })
    .sort((a, b) => b.remaining - a.remaining);

  // === Stale Records Detector (>1 year old with remaining stock) ===
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const staleRecords = inwardData
    .filter((item) => {
      if (item.addDate >= oneYearAgo) return false;
      const inwardQty = parseInt(item.quantity) || 0;
      const dispatched = outwardByInumber[item.inumber] || 0;
      return inwardQty - dispatched > 0;
    })
    .map((item) => {
      const inwardQty = parseInt(item.quantity) || 0;
      const dispatched = outwardByInumber[item.inumber] || 0;
      const ageInDays = Math.floor(
        (now.getTime() - item.addDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        id: item.id,
        inumber: item.inumber,
        customer: item.customer,
        item: item.item,
        addDate: item.addDate.toISOString(),
        quantity: inwardQty,
        dispatched,
        remaining: inwardQty - dispatched,
        ageInDays,
      };
    })
    .sort((a, b) => b.ageInDays - a.ageInDays);



  // === Empty/Zero Quantity Flags ===
  const emptyQtyInward = inwardData
    .filter((item) => {
      const qty = parseInt(item.quantity);
      return !item.quantity || isNaN(qty) || qty <= 0;
    })
    .slice(0, 10)
    .map((item) => ({
      id: item.id,
      type: "inward" as const,
      number: item.inumber,
      customer: item.customer,
      item: item.item,
      quantity: item.quantity,
      date: item.addDate.toISOString(),
    }));

  const emptyQtyOutward = outwardData
    .filter((item) => {
      const qty = parseInt(item.quantity);
      return !item.quantity || isNaN(qty) || qty <= 0;
    })
    .slice(0, 10)
    .map((item) => ({
      id: item.id,
      type: "outward" as const,
      number: item.onumber,
      customer: item.customer,
      item: item.item,
      quantity: item.quantity,
      date: item.outDate.toISOString(),
    }));

  const emptyQuantityFlags = [...emptyQtyInward, ...emptyQtyOutward];

  // === #1: User Activity Scoreboard ===
  const userActivityMap: Record<
    string,
    { userName: string; creates: number; updates: number; deletes: number; total: number }
  > = {};
  const todayLogs = allAuditLogs.filter(
    (log) => log.createdAt >= todayStart && log.createdAt <= todayEnd
  );
  todayLogs.forEach((log) => {
    if (!userActivityMap[log.user]) {
      userActivityMap[log.user] = {
        userName: log.userName,
        creates: 0,
        updates: 0,
        deletes: 0,
        total: 0,
      };
    }
    const u = userActivityMap[log.user];
    if (log.action === "create") u.creates++;
    else if (log.action === "update") u.updates++;
    else if (log.action === "delete") u.deletes++;
    u.total++;
  });
  const userActivityScoreboard = Object.entries(userActivityMap)
    .map(([email, data]) => ({ email, ...data }))
    .sort((a, b) => b.total - a.total);

  // === #6: Quantity Changed After Creation ===
  const quantityChangeLogs = allAuditLogs
    .filter((log) => {
      if (log.action !== "update" || !log.changes) return false;
      try {
        const changes = JSON.parse(log.changes);
        return (
          changes.quantity !== undefined ||
          (typeof changes === "object" &&
            Object.keys(changes).some((k) => k.toLowerCase().includes("quantity")))
        );
      } catch {
        return false;
      }
    })
    .slice(0, 10)
    .map((log) => {
      let oldQty = "";
      let newQty = "";
      try {
        const changes = JSON.parse(log.changes || "{}");
        if (changes.quantity) {
          oldQty = changes.quantity.old || changes.quantity.from || "";
          newQty = changes.quantity.new || changes.quantity.to || "";
        }
      } catch { /* ignore */ }
      return {
        id: log.id,
        entity: log.entity,
        entityId: log.entityId,
        inumber: log.inumber || "",
        customer: log.customer || "",
        item: log.item || "",
        userName: log.userName,
        oldQty,
        newQty,
        createdAt: log.createdAt.toISOString(),
      };
    });

  // === #9: Daily Entry Summary by User ===
  const dailySummaryMap: Record<
    string,
    {
      userName: string;
      inwardCreates: number;
      inwardUpdates: number;
      inwardDeletes: number;
      outwardCreates: number;
      outwardUpdates: number;
      outwardDeletes: number;
    }
  > = {};
  todayLogs.forEach((log) => {
    if (!dailySummaryMap[log.user]) {
      dailySummaryMap[log.user] = {
        userName: log.userName,
        inwardCreates: 0,
        inwardUpdates: 0,
        inwardDeletes: 0,
        outwardCreates: 0,
        outwardUpdates: 0,
        outwardDeletes: 0,
      };
    }
    const d = dailySummaryMap[log.user];
    if (log.entity === "inward") {
      if (log.action === "create") d.inwardCreates++;
      else if (log.action === "update") d.inwardUpdates++;
      else if (log.action === "delete") d.inwardDeletes++;
    } else {
      if (log.action === "create") d.outwardCreates++;
      else if (log.action === "update") d.outwardUpdates++;
      else if (log.action === "delete") d.outwardDeletes++;
    }
  });
  const dailyEntrySummary = Object.entries(dailySummaryMap)
    .map(([email, data]) => ({ email, ...data }))
    .sort((a, b) => {
      const totalA =
        a.inwardCreates + a.inwardUpdates + a.inwardDeletes +
        a.outwardCreates + a.outwardUpdates + a.outwardDeletes;
      const totalB =
        b.inwardCreates + b.inwardUpdates + b.inwardDeletes +
        b.outwardCreates + b.outwardUpdates + b.outwardDeletes;
      return totalB - totalA;
    });

  // === #10: Recently Deleted Records ===
  const recentlyDeleted = allAuditLogs
    .filter((log) => log.action === "delete")
    .slice(0, 10)
    .map((log) => ({
      id: log.id,
      entity: log.entity,
      entityId: log.entityId,
      inumber: log.inumber || "",
      customer: log.customer || "",
      item: log.item || "",
      quantity: log.quantity || "",
      userName: log.userName,
      userEmail: log.user,
      createdAt: log.createdAt.toISOString(),
    }));

  // === Rate Changed After Creation ===
  const rateChangeLogs = allAuditLogs
    .filter((log) => {
      if (log.action !== "update" || !log.changes) return false;
      try {
        const changes = JSON.parse(log.changes);
        return (
          changes.store_rate !== undefined ||
          changes.labour_rate !== undefined ||
          (typeof changes === "object" &&
            Object.keys(changes).some((k) =>
              k.toLowerCase().includes("rate")
            ))
        );
      } catch {
        return false;
      }
    })
    .slice(0, 20)
    .map((log) => {
      let oldStoreRate = "";
      let newStoreRate = "";
      let oldLabourRate = "";
      let newLabourRate = "";
      try {
        const changes = JSON.parse(log.changes || "{}");
        if (changes.store_rate) {
          oldStoreRate = changes.store_rate.old || changes.store_rate.from || "";
          newStoreRate = changes.store_rate.new || changes.store_rate.to || "";
        }
        if (changes.labour_rate) {
          oldLabourRate = changes.labour_rate.old || changes.labour_rate.from || "";
          newLabourRate = changes.labour_rate.new || changes.labour_rate.to || "";
        }
      } catch { /* ignore */ }
      return {
        id: log.id,
        entity: log.entity,
        entityId: log.entityId,
        inumber: log.inumber || "",
        customer: log.customer || "",
        item: log.item || "",
        userName: log.userName,
        oldStoreRate,
        newStoreRate,
        oldLabourRate,
        newLabourRate,
        createdAt: log.createdAt.toISOString(),
      };
    });

  // === Month-over-month changes ===
  const thisMonth = monthlyTrends[monthlyTrends.length - 1];
  const lastMonth = monthlyTrends[monthlyTrends.length - 2];
  const monthChange = {
    inwardCount:
      lastMonth && lastMonth.inwardCount > 0
        ? Math.round(
            ((thisMonth.inwardCount - lastMonth.inwardCount) /
              lastMonth.inwardCount) *
              100
          )
        : 0,
    outwardCount:
      lastMonth && lastMonth.outwardCount > 0
        ? Math.round(
            ((thisMonth.outwardCount - lastMonth.outwardCount) /
              lastMonth.outwardCount) *
              100
          )
        : 0,
    inwardQty:
      lastMonth && lastMonth.inwardQty > 0
        ? Math.round(
            ((thisMonth.inwardQty - lastMonth.inwardQty) /
              lastMonth.inwardQty) *
              100
          )
        : 0,
    outwardQty:
      lastMonth && lastMonth.outwardQty > 0
        ? Math.round(
            ((thisMonth.outwardQty - lastMonth.outwardQty) /
              lastMonth.outwardQty) *
              100
          )
        : 0,
  };

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
      topCustomers={allCustomersSorted}
      recentLogs={serializedLogs}
      monthlyTrends={monthlyTrends}
      topItems={allItemsSorted}
      todayActivity={todayActivity}
      monthChange={monthChange}
      customerGrowth={customerGrowth}
      orphanedOutward={orphanedOutward}
      duplicateAlerts={duplicateAlerts}
      quantityMismatches={quantityMismatches}
      customerBalances={customerBalances}
      staleRecords={staleRecords}
      emptyQuantityFlags={emptyQuantityFlags}
      userActivityScoreboard={userActivityScoreboard}
      quantityChangeLogs={quantityChangeLogs}
      dailyEntrySummary={dailyEntrySummary}
      recentlyDeleted={recentlyDeleted}
      missingRateAlerts={missingRateAlerts}
      rateChangeLogs={rateChangeLogs}
    />
  );
}

// Main page component with Suspense
const Dashboard = () => {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-[300px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      }
    >
      <DashboardData />
    </Suspense>
  );
};

export default Dashboard;
