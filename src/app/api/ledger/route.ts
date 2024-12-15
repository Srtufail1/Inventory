import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const customer = searchParams.get('customer');

  if (!customer) {
    return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
  }

  try {
    const inwardData = await db.inward.findMany({
      where: {
        customer: {
          contains: customer,
          mode: 'insensitive',
        },
      },
      orderBy: {
        addDate: 'asc',
      },
    });

    const outwardData = await db.outward.findMany({
      where: {
        customer: {
          contains: customer,
          mode: 'insensitive',
        },
      },
      orderBy: {
        outDate: 'asc',
      },
    });

    if (inwardData.length === 0) {
      return NextResponse.json({ error: 'No inward data found for this customer' }, { status: 404 });
    }

    // Function to format date as DD.MM.YY
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      }).replace(/\//g, '.');
    };

    // Get the initial date from inward data
    const initialDate = new Date(inwardData[0].addDate);

    // Calculate totals from inward data
    const inwardTotals = inwardData.reduce((acc, item) => {
      acc.quantity += parseInt(item.quantity) || 0;
      acc.amount += (parseInt(item.quantity) || 0) * (parseFloat(item.store_rate) || 0);
      return acc;
    }, { quantity: 0, amount: 0 });

    let remainingQuantity = inwardTotals.quantity;
    let currentDate = new Date(initialDate);
    const lastOutwardDate = new Date(outwardData[outwardData.length - 1]?.outDate || currentDate);
    const combinedData = [];

    while (currentDate <= lastOutwardDate) {
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(endDate.getDate());

      const outwardInRange = outwardData.filter(item => {
        const outDate = new Date(item.outDate);
        return outDate >= startDate && outDate <= endDate;
      });

      const quantityOut = outwardInRange.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
      const inwardOutNumbers = outwardInRange.map(item => `${item.inumber}/${item.onumber}`).join(', ');
      const outDate_table = outwardInRange.map((item) => (formatDate(item.outDate)) );

      combinedData.push({
        inwardOut: inwardOutNumbers || '',
        outDate_table: outDate_table,
        outQuantity: quantityOut,
        dates: `${formatDate(startDate)} - ${formatDate(endDate)}`,
        quantity: remainingQuantity.toString(),
        nextPeriodQuantity: (remainingQuantity - quantityOut).toString(),
        storeRate: inwardData[0].store_rate || '0',
        amount: remainingQuantity * parseFloat(inwardData[0].store_rate || '0'),
        amountReceived: "pending",
        dateReceived: "pending",
      });

      remainingQuantity -= quantityOut;
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Function to generate labor table data
    const generateLaborTable = (inwardData: any[]) => {
      return inwardData.map(item => {
        const addDate = new Date(item.addDate);
        const dueDate = new Date(addDate);
        dueDate.setMonth(dueDate.getMonth() + 1);

        return {
          addDate: formatDate(addDate),
          dueDate: formatDate(dueDate),
          quantity: item.quantity,
          labourRate: item.labour_rate,
          labourAmount: (parseInt(item.quantity) || 0) * (parseFloat(item.labour_rate) || 0),
          amountReceived: "pending",
          dateReceived: "pending",
        };
      });
    };

    const laborTable = generateLaborTable(inwardData);

    const customerDetails = {
      customer: inwardData[0].customer,
      item: inwardData[0].item,
      packing: inwardData[0].packing,
      weight: inwardData[0].weight,
    };

    return NextResponse.json({ combinedData, customerDetails, laborTable });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}