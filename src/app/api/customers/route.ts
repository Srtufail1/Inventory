import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET() {
  try {
    const customers = await db.inward.groupBy({
      by: ['customer'],
      orderBy: {
        customer: 'asc'
      }
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}