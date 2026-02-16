import React, { Suspense } from "react";
import { db } from "@/lib/db";
import CustomerPage from "@/components/customer/CustomerPage";
import { Skeleton } from "@/components/ui/skeleton";

async function CustomerData() {
  const customerData = await db.inward.groupBy({
    by: ['customer'],
    _count: {
      customer: true
    },
    orderBy: {
      customer: 'asc'
    }
  });

  const formattedData = customerData.map(item => ({
    customer: item.customer,
    totalInwards: item._count.customer,
  }));

  return <CustomerPage data={formattedData} />;
}

// Main page component with Suspense
const CustomersPage = () => {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      }
    >
      <CustomerData />
    </Suspense>
  );
};

export default CustomersPage;
