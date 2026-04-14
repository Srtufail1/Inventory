import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const customer = request.nextUrl.searchParams.get('customer');
  if (!customer) {
    return NextResponse.json({ error: 'customer param required' }, { status: 400 });
  }
  try {
    const detail = await db.customerDetail.findUnique({ where: { customer } });
    return NextResponse.json(detail ?? { customer, contacts: [] });
  } catch (error) {
    console.error('Failed to fetch customer detail:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, contacts } = body as {
      customer: string;
      contacts: { name: string; phone: string }[];
    };

    if (!customer) {
      return NextResponse.json({ error: 'customer required' }, { status: 400 });
    }

    const detail = await db.customerDetail.upsert({
      where: { customer },
      update: { contacts },
      create: { customer, contacts },
    });

    return NextResponse.json(detail);
  } catch (error) {
    console.error('Failed to save customer detail:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
