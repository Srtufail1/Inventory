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

    // Function to generate ledger data for a single inward record
    const generateLedgerData = (inwardRecord: any, relatedOutwardData: any[]) => {
      let currentDate = new Date(inwardRecord.addDate);
      const lastOutwardDate = new Date(relatedOutwardData[relatedOutwardData.length - 1]?.outDate || currentDate);
      const combinedData = [];
      let remainingQuantity = parseInt(inwardRecord.quantity) || 0;

      while (currentDate <= lastOutwardDate) {
        const startDate = new Date(currentDate);
        const endDate = new Date(currentDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);

        const outwardInRange = relatedOutwardData.filter(item => {
          const outDate = new Date(item.outDate);
          return outDate >= startDate && outDate <= endDate;
        });

        const quantityOut = outwardInRange.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
        const inwardOutNumbers = outwardInRange.map(item => `${item.inumber}/${item.onumber}`).join('\n');
        const outDate_table = outwardInRange.map(item => formatDate(new Date(item.outDate))).join('\n');

        combinedData.push({
          inwardOut: inwardOutNumbers || '',
          // inwardOut: inwardOutNumbers || inwardRecord.inumber,
          outDate_table: outDate_table,
          outQuantity: quantityOut,
          dates: `${formatDate(startDate)} - ${formatDate(endDate)}`,
          quantity: remainingQuantity.toString(),
          nextPeriodQuantity: (remainingQuantity - quantityOut).toString(),
          storeRate: inwardRecord.store_rate || '0',
          amount: remainingQuantity * parseFloat(inwardRecord.store_rate || '0'),
          amountReceived: "pending",
          dateReceived: "pending",
        });

        remainingQuantity -= quantityOut;
        currentDate.setMonth(currentDate.getMonth() + 1);
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

    return NextResponse.json({ ledgerDataSets, customerDetails, laborTable });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}