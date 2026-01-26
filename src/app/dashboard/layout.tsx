import Sidebar from "@/components/Siderbar";
import React, { ReactNode } from "react";
import { auth } from "../../../auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  console.log(session, "session");

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
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      <div className="w-full lg:w-[14%] border-b lg:border-r bg-gray-100/40">
        <Sidebar isSuperAdmin={user.isSuperAdmin ?? false} />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default DashboardLayout;