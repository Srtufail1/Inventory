import React, { Suspense } from "react";
import BillPage from "@/components/bill/BillPage";
import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

async function BillData() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { isSuperAdmin: true }
  });

  return <BillPage isSuperAdmin={user?.isSuperAdmin === true} />;
}

// Main page component with Suspense
const Bill = () => {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      }
    >
      <BillData />
    </Suspense>
  );
};

export default Bill;
