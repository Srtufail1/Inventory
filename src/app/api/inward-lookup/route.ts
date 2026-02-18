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
      },
    });

    if (!inwardRecord) {
      return NextResponse.json({ error: 'Inward record not found' }, { status: 404 });
    }

    return NextResponse.json(inwardRecord);
  } catch (error) {
    console.error('Error fetching inward record:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}