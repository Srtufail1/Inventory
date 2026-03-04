import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const inumber = searchParams.get('inumber');

  if (!inumber) {
    return NextResponse.json({ error: 'Inward number is required' }, { status: 400 });
  }

  try {
    const inwardRecord = await db.inward.findFirst({
      where: { inumber },
      select: {
        customer: true,
        item: true,
        quantity: true,
      },
    });

    if (!inwardRecord) {
      return NextResponse.json({ error: 'Inward record not found' }, { status: 404 });
    }

    const outwardRecords = await db.outward.findMany({
      where: { inumber },
      select: { quantity: true },
    });

    const totalOutward = outwardRecords.reduce(
      (sum, r) => sum + (parseInt(r.quantity) || 0),
      0
    );
    const remainingQuantity = Math.max(0, (parseInt(inwardRecord.quantity) || 0) - totalOutward);

    return NextResponse.json({ ...inwardRecord, remainingQuantity });
  } catch (error) {
    console.error('Error fetching inward record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}