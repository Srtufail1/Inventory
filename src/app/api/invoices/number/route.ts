import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const year = new Date().getFullYear();

    const result = await db.invoiceCounter.upsert({
      where: { year },
      create: { year, counter: 1 },
      update: { counter: { increment: 1 } },
    });

    const invoiceNumber = `INV-${year}-${String(result.counter).padStart(5, '0')}`;
    return NextResponse.json({ invoiceNumber });
  } catch (error) {
    console.error('Error generating invoice number:', error);
    return NextResponse.json({ error: 'Failed to generate invoice number' }, { status: 500 });
  }
}
