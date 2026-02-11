import React, { Suspense } from "react";
import NotesTable from "@/components/notes/NotesTable";
import NotesTableSkeleton from "@/components/notes/NotesTableSkeleton";
import { db } from "@/lib/db";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";

async function NotesData() {
  const notes = await db.note.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <NotesTable data={notes} />;
}

const NotesPage = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    redirect("/");
  }

  return (
    <Suspense fallback={<NotesTableSkeleton />}>
      <NotesData />
    </Suspense>
  );
};

export default NotesPage;