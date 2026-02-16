import React, { Suspense } from "react";
import LedgerPage from "@/components/ledger/LedgerPage";
import { db } from "@/lib/db";
import { Skeleton } from "@/components/ui/skeleton";

async function LedgerData() {
  const [outwardData, inwardData, clients] = await Promise.all([
    db.outward.findMany(),
    db.inward.findMany(),
    db.user.findMany(),
  ]);

  const combinedData = [
    ...outwardData.map(item => ({ ...item, type: 'outward' })),
    ...inwardData.map(item => ({ ...item, type: 'inward' })),
  ];

  return <LedgerPage />;
}

// Main page component with Suspense
const Ledger = () => {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      }
    >
      <LedgerData />
    </Suspense>
  );
};

export default Ledger;
