import React, { Suspense } from "react";
import BackupPage from "@/components/backup/BackupPage";
import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

async function BackupData() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Check if user is super admin
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { isSuperAdmin: true },
  });

  // Not a super admin - redirect to dashboard
  if (!user?.isSuperAdmin) {
    redirect("/dashboard/inward");
  }

  return <BackupPage />;
}

// Main page component with Suspense
const Backup = () => {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      }
    >
      <BackupData />
    </Suspense>
  );
};

export default Backup;
