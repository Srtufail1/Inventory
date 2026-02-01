import React from "react";
import ClientsData from "@/components/ClientsData";
import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const ClientsPage = async () => {
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
};

export default ClientsPage;