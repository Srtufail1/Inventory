import React, { Suspense } from "react";
import InwardTable from "@/components/inward/InwardTable";
import InwardTableSkeleton from "@/components/inward/InwardTableSkeleton";
import { db } from "@/lib/db";

async function InwardData() {
  const [inwardData, clients] = await db.$transaction([
    db.inward.findMany(),
    db.user.findMany(),
  ]);

  const response = inwardData?.map((inv) => {
    return { ...inv, clients };
  });
  return <InwardTable data={response} />;
}

// Main page component with Suspense
const inward = () => {
  return (
    <Suspense fallback={<InwardTableSkeleton />}>
      <InwardData />
    </Suspense>
  );
};

export default inward;