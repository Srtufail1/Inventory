import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "../../../../auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Check authentication and super admin status
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { isSuperAdmin: true },
    });

    if (!user?.isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const customer = searchParams.get("customer");

    if (!customer) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      );
    }

    // Fetch inward and outward data for the customer (case-insensitive)
    const inwardData = await db.inward.findMany({
      where: {
        customer: {
          equals: customer,
          mode: "insensitive",
        },
      },
      orderBy: { addDate: "desc" },
    });

    const outwardData = await db.outward.findMany({
      where: {
        customer: {
          equals: customer,
          mode: "insensitive",
        },
      },
      orderBy: { outDate: "desc" },
    });

    return NextResponse.json({
      inwardData: inwardData.map((item) => ({
        ...item,
        addDate: item.addDate.toISOString(),
      })),
      outwardData: outwardData.map((item) => ({
        ...item,
        outDate: item.outDate.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Customer view API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}