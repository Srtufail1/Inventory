import React from "react";
import UpdatedBillPage from "@/components/updatedbill/UpdatedBillPage";
import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const UpdatedBill = async () => {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { isSuperAdmin: true }
  });

  return <UpdatedBillPage isSuperAdmin={user?.isSuperAdmin === true} />;
};

export default UpdatedBill;