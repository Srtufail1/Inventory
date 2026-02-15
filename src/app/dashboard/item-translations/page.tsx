import React from "react";
import ItemTranslationsPage from "@/components/item-translations/ItemTranslationsPage";
import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const ItemTranslations = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { isSuperAdmin: true },
  });

  if (!user?.isSuperAdmin) {
    redirect("/dashboard/inward");
  }

  return <ItemTranslationsPage />;
};

export default ItemTranslations;