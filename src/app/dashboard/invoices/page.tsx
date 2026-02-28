import React, { Suspense } from "react";
import InvoicePage from "@/components/invoices/InvoicePage";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

async function InvoiceData() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  return <InvoicePage />;
}

const Invoices = () => {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      }
    >
      <InvoiceData />
    </Suspense>
  );
};

export default Invoices;
