import React, { Suspense } from "react";
import { db } from "@/lib/db";
import StockTab from "@/components/dashboard/StockTab";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";

async function StockData() {
  const [inwardData, outwardData] = await Promise.all([
    db.inward.findMany({
      select: {
        id: true,
        inumber: true,
        customer: true,
        item: true,
        quantity: true,
        addDate: true,
      },
      orderBy: { addDate: "desc" },
    }),
    db.outward.findMany({
      select: {
        inumber: true,
        quantity: true,
      },
    }),
  ]);

  const outwardByInumber: Record<string, number> = {};
  outwardData.forEach((item) => {
    const qty = parseInt(item.quantity) || 0;
    outwardByInumber[item.inumber] = (outwardByInumber[item.inumber] || 0) + qty;
  });

  const customerStockMap: Record<
    string,
    {
      totalRemaining: number;
      inwards: Array<{
        id: string;
        inumber: string;
        item: string;
        addDate: string;
        inwardQty: number;
        remaining: number;
      }>;
    }
  > = {};

  inwardData.forEach((item) => {
    const inwardQty = parseInt(item.quantity) || 0;
    const outwardQty = outwardByInumber[item.inumber] || 0;
    const remaining = inwardQty - outwardQty;
    if (!customerStockMap[item.customer]) {
      customerStockMap[item.customer] = { totalRemaining: 0, inwards: [] };
    }
    customerStockMap[item.customer].totalRemaining += remaining;
    customerStockMap[item.customer].inwards.push({
      id: item.id,
      inumber: item.inumber,
      item: item.item,
      addDate: item.addDate.toISOString(),
      inwardQty,
      remaining,
    });
  });

  const customerStock = Object.entries(customerStockMap)
    .map(([customer, data]) => ({ customer, ...data }))
    .sort((a, b) => b.totalRemaining - a.totalRemaining);

  return <StockTab customerStock={customerStock} />;
}

const StockPage = () => {
  return (
    <div>
      <div className="flex h-14 lg:h-16 items-center gap-4 border-b bg-muted/40 px-6">
        <Package className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium text-foreground">Stock</span>
      </div>
      <div className="p-4 space-y-5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Stock</h1>
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-48 rounded-md" />
                ))}
              </div>
              <Skeleton className="h-[500px] w-full rounded-xl" />
            </div>
          }
        >
          <StockData />
        </Suspense>
      </div>
    </div>
  );
};

export default StockPage;
