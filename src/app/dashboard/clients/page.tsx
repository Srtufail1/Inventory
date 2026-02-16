import React, { Suspense } from "react";
import ClientsData from "@/components/ClientsData";
import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

async function ClientsPageData() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Check if current user is Super Admin
  const currentUser = await db.user.findUnique({
    where: { email: session.user.email },
    select: { isSuperAdmin: true },
  });

  if (!currentUser?.isSuperAdmin) {
    redirect("/dashboard/inward"); // redirect non-super-admins
  }

  const users = await db.user.findMany({});

  return <ClientsData data={users} />;
}

// Main page component with Suspense
const ClientsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      }
    >
      <ClientsPageData />
    </Suspense>
  );
};

export default ClientsPage;
