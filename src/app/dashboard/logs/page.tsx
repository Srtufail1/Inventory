import React, { Suspense } from "react";
import AuditLogTable from "@/components/logs/AuditLogTable";
import { db } from "@/lib/db";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

async function AuditLogData() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { isSuperAdmin: true },
  });

  if (!user?.isSuperAdmin) {
    redirect("/dashboard/inward");
  }

  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <AuditLogTable data={logs} />;
}

const LogsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      }
    >
      <AuditLogData />
    </Suspense>
  );
};

export default LogsPage;