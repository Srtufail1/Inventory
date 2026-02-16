import React, { Suspense } from "react";
import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import CustomerViewPage from "@/components/customerview/CustomerViewPage";
import { Skeleton } from "@/components/ui/skeleton";

async function CustomerViewData() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { isSuperAdmin: true },
  });

  if (!user?.isSuperAdmin) {
    redirect("/dashboard/inward");
  }

  return <CustomerViewPage />;
}

// Main page component with Suspense
const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      }
    >
      <CustomerViewData />
    </Suspense>
  );
};

export default Page;
