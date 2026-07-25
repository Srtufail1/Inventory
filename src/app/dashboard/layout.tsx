import Sidebar from "@/components/Siderbar";
import HeartbeatProvider from "@/components/HeartbeatProvider";
import React, { ReactNode } from "react";
import { auth } from "../../../auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <HeartbeatProvider />
      <div className="relative z-40 shrink-0 border-r bg-card">
        <Sidebar isSuperAdmin={user.isSuperAdmin ?? false} />
      </div>
      <main className="min-w-0 flex-1 overflow-x-hidden pb-24 lg:pb-0">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;