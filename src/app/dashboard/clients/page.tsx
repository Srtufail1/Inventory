import { db } from "@/lib/db";
import React from "react";
import { auth } from "../../../../auth";
import ClientsData from "@/components/ClientsData";
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
    redirect("/dashboard"); // or wherever you want to redirect non-super-admins
  }

  const users = await db.user.findMany({});
  
  return <ClientsData data={users} />;
};

export default ClientsPage;