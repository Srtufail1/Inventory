import { auth } from "../../../../auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await db.user.update({
    where: { email: session.user.email },
    data: { lastSeen: new Date() },
  });

  return NextResponse.json({ ok: true });
}
