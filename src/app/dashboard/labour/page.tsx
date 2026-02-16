import React, { Suspense } from "react";
import LabourBillPage from "@/components/labour/LabourBillPage";
import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

async function LabourData() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Check if user is admin
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  });

  // Not an admin - redirect
  if (!user?.isAdmin) {
    redirect("/dashboard/inward");
  }

  return <LabourBillPage />;
}

// Main page component with Suspense
const Labour = () => {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      }
    >
      <LabourData />
    </Suspense>
  );
};

export default Labour;
