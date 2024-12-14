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

    // Calculate totals from inward data
    const inwardTotals = inwardData.reduce((acc, item) => {
      acc.quantity += parseInt(item.quantity) || 0;
      acc.amount += (parseInt(item.quantity) || 0) * (parseFloat(item.store_rate) || 0);
      acc.labourAmount += (parseInt(item.quantity) || 0) * (parseFloat(item.labour_rate) || 0);
      return acc;
    }, { quantity: 0, amount: 0, labourAmount: 0 });

    // Function to format date as DD.MM.YY
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      }).replace(/\//g, '.');
    };

    // Get the initial date from inward data, or use current date if no inward data
    const initialDate = inwardData.length > 0 ? new Date(inwardData[0].addDate) : new Date();

    let remainingQuantity = inwardTotals.quantity;
    let outwardIndex = 0;
    let nextPeriodReduction = 0;

    // Combine inward and outward data
    const combinedData = outwardData.map((outItem, index) => {
      const inwardItem = inwardData.find(inItem => inItem.inumber === outItem.inumber) || inwardData[0] || {};
      
      // Calculate start and end dates for this entry
      const startDate = new Date(initialDate);
      startDate.setMonth(startDate.getMonth() + index);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(endDate.getDate());

      // Apply reduction from previous period
      remainingQuantity -= nextPeriodReduction;
      nextPeriodReduction = 0;

      // Calculate quantity for this period and reduction for next period
      let quantityForPeriod = remainingQuantity;
      while (outwardIndex < outwardData.length) {
        const currentOutwardItem = outwardData[outwardIndex];
        const outwardDate = new Date(currentOutwardItem.outDate);
        if (outwardDate >= startDate && outwardDate <= endDate) {
          nextPeriodReduction += parseInt(currentOutwardItem.quantity) || 0;
          outwardIndex++;
        } else if (outwardDate > endDate) {
          break;
        } else {
          outwardIndex++;
        }
      }

      return {
        inwardOut: `${parseInt(outItem.inumber) || 'N/A'}/${parseInt(outItem.onumber) || 'N/A'}`,
        dates: `${formatDate(startDate)} - ${formatDate(endDate)}`,
        quantity: quantityForPeriod.toString(),
        nextPeriodQuantity: (quantityForPeriod - nextPeriodReduction).toString(),
        storeRate: inwardItem.store_rate || '0',
        amount: quantityForPeriod*parseInt(inwardItem.store_rate),
        amountReceived: "pending",
        dateReceived: "pending",
        labourRate: inwardItem.labour_rate || '0',
        labourAmount: inwardTotals.labourAmount,
      };
    });

    const customerDetails = inwardData.length > 0 ? {
      customer: inwardData[0].customer,
      item: inwardData[0].item,
      packing: inwardData[0].packing,
      weight: inwardData[0].weight,
    } : null;

    return NextResponse.json({ combinedData, customerDetails });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}