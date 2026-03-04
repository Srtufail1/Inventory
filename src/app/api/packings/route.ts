import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const packings = await db.inward.groupBy({
      by: ['packing'],
      orderBy: {
        packing: 'asc'
      }
    });

    return NextResponse.json(packings);
  } catch (error) {
    console.error('Failed to fetch packings:', error);
    return NextResponse.json({ error: 'Failed to fetch packings' }, { status: 500 });
  }
}
