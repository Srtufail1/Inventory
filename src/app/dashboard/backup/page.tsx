import React from "react";
import BackupPage from "@/components/backup/BackupPage";
import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const Backup = async () => {
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
};

export default Backup;