import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const customer = searchParams.get('customer');
  const inward = searchParams.get('inward');

  if (!customer) {
    return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
  }

  try {
    let inwardQuery: Prisma.InwardWhereInput = {
      customer: {
        contains: customer,
        mode: 'insensitive',
      },
    };

    if (inward) {
      inwardQuery = {
        AND: [
          { customer: { contains: customer, mode: 'insensitive' } },
          { inumber: inward }
        ]
      };
    }

    const inwardData = await db.inward.findMany({
      where: inwardQuery,
      orderBy: {
        addDate: 'asc',
      },
    });

    let outwardQuery: Prisma.OutwardWhereInput = {
      customer: {
        contains: customer,
        mode: 'insensitive',
      },
    };

    if (inward) {
      outwardQuery = {
        AND: [
          { customer: { contains: customer, mode: 'insensitive' } },
          { inumber: inward }
        ]
      };
    }

    const outwardData = await db.outward.findMany({
      where: outwardQuery,
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

  // Function to generate ledger data for a single inward record
  const generateLedgerData = (inwardRecord: any, relatedOutwardData: any[]) => {
    let currentDate = new Date(inwardRecord.addDate);
    let currentDateInitial = new Date(inwardRecord.addDate);
    const today = new Date(); // Get current date
    let remainingQuantity = parseInt(inwardRecord.quantity) || 0;
    const combinedData = [];

    while (currentDate <= today && remainingQuantity > 0) {
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + 1);
      // Check if the month overflowed
      if (endDate.getMonth() !== (startDate.getMonth() + 1) % 12) {
        // If it did, set to the last day of the intended month
        endDate.setDate(0);
      }
      const outwardInRange = relatedOutwardData.filter(item => {
        const outDate = new Date(item.outDate);
        if (currentDate.getTime() === currentDateInitial.getTime()) {return outDate >= startDate && outDate <= endDate;}
        else {return outDate > startDate && outDate <= endDate;}
      });

      const quantityOut = outwardInRange.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
      const inwardOutNumbers = outwardInRange.map(item => `${item.inumber}/${item.onumber}`).join('\n');
      const outDate_table = outwardInRange.map(item => `${formatDate(new Date(item.outDate))} - ${item.quantity}`).join('\n');

      combinedData.push({
        inwardOut: inwardOutNumbers || '',
          // inwardOut: inwardOutNumbers || inwardRecord.inumber,
        outDate_table: outDate_table,
        outQuantity: quantityOut,
        dates: `${formatDate(startDate)} - ${formatDate(endDate)}`,
        quantity: remainingQuantity.toString(),
        nextPeriodQuantity: Math.max(remainingQuantity - quantityOut, 0).toString(),
        storeRate: inwardRecord.store_rate || '0',
        amount: remainingQuantity * parseFloat(inwardRecord.store_rate || '0'),
        amountReceived: "pending",
        dateReceived: "pending",
      });

      remainingQuantity = Math.max(remainingQuantity - quantityOut, 0);
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      // Check if the month overflowed
      if (nextMonth.getMonth() !== (currentDate.getMonth() + 1) % 12) {
          // If it did, set to the last day of the intended month
          nextMonth.setDate(0);
      }
      // Now assign the corrected date back to currentDate
      currentDate = nextMonth;
    }

    return combinedData;
  };

    // Generate ledger data for each inward record
    const ledgerDataSets = inwardData.map(inwardRecord => {
      const relatedOutwardData = outwardData.filter(item => item.inumber === inwardRecord.inumber);
      return {
        inumber: inwardRecord.inumber,
        ledgerData: generateLedgerData(inwardRecord, relatedOutwardData),
      };
    });

    // Function to generate labor table data
    const generateLaborTable = (inwardData: any[]) => {
      return inwardData.map(item => {
        const addDate = new Date(item.addDate);
        const dueDate = new Date(addDate);
        dueDate.setMonth(dueDate.getMonth() + 1);

        return {
          addDate: formatDate(addDate),
          dueDate: formatDate(dueDate),
          inumber: item.inumber,
          quantity: item.quantity,
          labourRate: item.labour_rate,
          labourAmount: (parseInt(item.quantity) || 0) * (parseFloat(item.labour_rate) || 0),
          amountReceived: "pending",
          dateReceived: "pending",
        };
      });
    };

    const laborTable = generateLaborTable(inwardData);



    const outwardTotals = new Map();
    outwardData.forEach(item => {
      const currentTotal = outwardTotals.get(item.inumber) || 0;
      outwardTotals.set(item.inumber, currentTotal + (parseInt(item.quantity) || 0));
    });

    // Update the customerDetails to include all inward entries
    const customerDetails = inwardData.map(entry => {
      const totalOutward = outwardTotals.get(entry.inumber) || 0;
      return {
        inumber: entry.inumber,
        addDate: formatDate(new Date(entry.addDate)),
        customer: entry.customer,
        item: entry.item,
        packing: entry.packing,
        weight: entry.weight,
        quantity: entry.quantity,
        remaining_quantity: Math.max(0, (parseInt(entry.quantity) || 0) - totalOutward),
      };
    });

    return NextResponse.json({ ledgerDataSets, customerDetails, laborTable });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}