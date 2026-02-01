import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dateParam = searchParams.get('date');

  if (!dateParam) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  try {
    // Parse the date and create start/end of day
    const searchDate = new Date(dateParam);
    const startOfDay = new Date(searchDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Fetch inward records for the given date
    const inwardData = await db.inward.findMany({
      where: {
        addDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        inumber: 'asc',
      },
    });

    // Fetch outward records for the given date
    const outwardData = await db.outward.findMany({
      where: {
        outDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        onumber: 'asc',
      },
    });

    // For outward records, we need to get the labour_rate from the corresponding inward record
    const outwardWithLabourRate = await Promise.all(
      outwardData.map(async (outward) => {
        const inwardRecord = await db.inward.findFirst({
          where: {
            inumber: outward.inumber,
          },
          select: {
            labour_rate: true,
            customer: true,
            item: true,
          },
        });
        return {
          ...outward,
          labour_rate: inwardRecord?.labour_rate || '0',
          inwardCustomer: inwardRecord?.customer || outward.customer,
          inwardItem: inwardRecord?.item || outward.item,
        };
      })
    );

    // Calculate labour costs for inward (quantity * labour_rate / 2)
    const inwardLabourData = inwardData.map((record) => {
      const quantity = parseInt(record.quantity) || 0;
      const labourRate = parseFloat(record.labour_rate) || 0;
      const labourCost = (quantity * labourRate) / 2;

      return {
        id: record.id,
        type: 'inward' as const,
        number: record.inumber,
        date: record.addDate,
        customer: record.customer,
        item: record.item,
        packing: record.packing,
        weight: record.weight,
        quantity: quantity,
        labourRate: labourRate,
        labourCost: labourCost,
      };
    });

    // Calculate labour costs for outward (quantity * labour_rate / 2)
    const outwardLabourData = outwardWithLabourRate.map((record) => {
      const quantity = parseInt(record.quantity) || 0;
      const labourRate = parseFloat(record.labour_rate) || 0;
      const labourCost = (quantity * labourRate) / 2;

      return {
        id: record.id,
        type: 'outward' as const,
        number: record.onumber,
        inwardNumber: record.inumber,
        date: record.outDate,
        customer: record.customer,
        item: record.item,
        quantity: quantity,
        labourRate: labourRate,
        labourCost: labourCost,
      };
    });

    // Calculate totals
    const inwardTotal = inwardLabourData.reduce((sum, record) => sum + record.labourCost, 0);
    const outwardTotal = outwardLabourData.reduce((sum, record) => sum + record.labourCost, 0);
    const grandTotal = inwardTotal + outwardTotal;

    return NextResponse.json({
      inwardData: inwardLabourData,
      outwardData: outwardLabourData,
      inwardTotal,
      outwardTotal,
      grandTotal,
      searchDate: dateParam,
    });
  } catch (error) {
    console.error('Error fetching labour data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}