import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export type DailyLabourSummary = {
  date: string;
  inwardTotal: number;
  outwardTotal: number;
  total: number;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  if (!startDateParam || !endDateParam) {
    return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 });
  }

  try {
    const startOfRange = new Date(startDateParam);
    startOfRange.setUTCHours(0, 0, 0, 0);

    const endOfRange = new Date(endDateParam);
    endOfRange.setUTCHours(23, 59, 59, 999);

    if (startOfRange > endOfRange) {
      return NextResponse.json({ error: 'startDate must be before endDate' }, { status: 400 });
    }

    // Fetch all inward records in the range
    const inwardRecords = await db.inward.findMany({
      where: {
        addDate: {
          gte: startOfRange,
          lte: endOfRange,
        },
      },
      orderBy: { addDate: 'asc' },
    });

    // Fetch all outward records in the range
    const outwardRecords = await db.outward.findMany({
      where: {
        outDate: {
          gte: startOfRange,
          lte: endOfRange,
        },
      },
      orderBy: { outDate: 'asc' },
    });

    // Get labour rates for outward records from their inward records
    const uniqueInumbers = Array.from(new Set(outwardRecords.map(o => o.inumber)));
    const relatedInwardRecords = await db.inward.findMany({
      where: { inumber: { in: uniqueInumbers } },
      select: { inumber: true, labour_rate: true },
    });
    const inwardLookup = new Map(relatedInwardRecords.map(r => [r.inumber, r]));

    // Group inward costs by date (YYYY-MM-DD)
    const inwardByDate = new Map<string, number>();
    for (const record of inwardRecords) {
      const dateKey = record.addDate.toISOString().slice(0, 10);
      const quantity = parseInt(record.quantity) || 0;
      const labourRate = parseFloat(record.labour_rate) || 0;
      const labourCost = (quantity * labourRate) / 2;
      inwardByDate.set(dateKey, (inwardByDate.get(dateKey) ?? 0) + labourCost);
    }

    // Group outward costs by date (YYYY-MM-DD)
    const outwardByDate = new Map<string, number>();
    for (const record of outwardRecords) {
      const dateKey = record.outDate.toISOString().slice(0, 10);
      const inwardRecord = inwardLookup.get(record.inumber);
      const quantity = parseInt(record.quantity) || 0;
      const labourRate = parseFloat(inwardRecord?.labour_rate ?? '0') || 0;
      const labourCost = (quantity * labourRate) / 2;
      outwardByDate.set(dateKey, (outwardByDate.get(dateKey) ?? 0) + labourCost);
    }

    // Collect all unique dates and build sorted summaries
    const allDates = new Set(Array.from(inwardByDate.keys()).concat(Array.from(outwardByDate.keys())));
    const dailySummaries: DailyLabourSummary[] = Array.from(allDates)
      .sort()
      .map((date) => {
        const inwardTotal = inwardByDate.get(date) ?? 0;
        const outwardTotal = outwardByDate.get(date) ?? 0;
        return {
          date,
          inwardTotal,
          outwardTotal,
          total: inwardTotal + outwardTotal,
        };
      });

    const grandInwardTotal = dailySummaries.reduce((s, d) => s + d.inwardTotal, 0);
    const grandOutwardTotal = dailySummaries.reduce((s, d) => s + d.outwardTotal, 0);
    const grandTotal = grandInwardTotal + grandOutwardTotal;

    return NextResponse.json({
      dailySummaries,
      grandInwardTotal,
      grandOutwardTotal,
      grandTotal,
      startDate: startDateParam,
      endDate: endDateParam,
    });
  } catch (error) {
    console.error('Error fetching labour range data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
