import React from "react";
import BillPage from "@/components/bill/BillPage";
import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const Bill = async () => {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { isSuperAdmin: true }
  });

  return <BillPage isSuperAdmin={user?.isSuperAdmin === true} />;
};

export default Bill;