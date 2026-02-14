import React, { Suspense } from "react";
import AuditLogTable from "@/components/logs/AuditLogTable";
import { db } from "@/lib/db";
import { Skeleton } from "@/components/ui/skeleton";

async function AuditLogData() {
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
