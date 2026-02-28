import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customer = searchParams.get('customer');

  if (!customer) {
    return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
  }

  try {
    const invoices = await db.invoice.findMany({
      where: {
        customerName: {
          contains: customer,
          mode: 'insensitive',
        },
      },
      orderBy: { invoiceDate: 'desc' },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceNumber, customerName, invoiceDate, billingPeriod, totalAmount } = body;

    if (!invoiceNumber || !customerName || !invoiceDate || !billingPeriod || totalAmount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        customerName,
        invoiceDate: new Date(invoiceDate),
        billingPeriod,
        totalAmount,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Invoice number already exists' }, { status: 409 });
    }
    console.error('Error saving invoice:', error);
    return NextResponse.json({ error: 'Failed to save invoice' }, { status: 500 });
  }
}
