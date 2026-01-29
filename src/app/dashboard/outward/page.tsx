import React, { Suspense } from "react";
import OutwardTable from "@/components/outward/OutwardTable";
import OutwardTableSkeleton from "@/components/outward/OutwardTableSkeleton";
import { db } from "@/lib/db";

async function OutwardData() {
  const [outwardData, clients] = await db.$transaction([
    db.outward.findMany(),
    db.user.findMany(),
  ]);

  const response = outwardData?.map((inv) => {
    return { ...inv, clients };
  });
  return <OutwardTable data={response} />;
}

// Main page component with Suspense
const outward = () => {
  return (
    <Suspense fallback={<OutwardTableSkeleton />}>
      <OutwardData />
    </Suspense>
  );
};

export default outward;