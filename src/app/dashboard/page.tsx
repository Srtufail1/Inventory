import React from "react";
import DashboardDataTable from "@/components/DashboardDataTable";
import { db } from "@/lib/db";

const Dashboard = async () => {
  const [inventoryData, clients, inwardData] = await db.$transaction([
    db.inventory.findMany(),
    db.user.findMany(),
    db.inward.findMany({
      select: {
        addDate: true,
        quantity: true,
        store_rate: true,
        labour_rate: true,
      },
    }),
  ]);

  const inventoryResponse = inventoryData?.map((inv) => {
    return { ...inv, clients };
  });

  // Process inward data for the chart
  const processedChartData = inwardData.map(item => {
    const date = new Date(item.addDate);
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const monthYear = `${month} ${year}`;
    const sales = 
      parseFloat(item.quantity || '0') * parseFloat(item.store_rate || '0') +
      parseFloat(item.labour_rate || '0') * parseFloat(item.quantity || '0');

    return { monthYear, sales };
  });

  // Aggregate sales by month and year
  const aggregatedChartData = processedChartData.reduce((acc, item) => {
    const existingMonth = acc.find(i => i.monthYear === item.monthYear);
    if (existingMonth) {
      existingMonth.sales += item.sales;
    } else {
      acc.push(item);
    }
    return acc;
  }, [] as { monthYear: string, sales: number }[]);

  // Sort the data by month and year
  const sortedChartData = aggregatedChartData.sort((a, b) => 
    new Date(b.monthYear).getTime() - new Date(a.monthYear).getTime()
  );

  return (
    <>
      <DashboardDataTable data={inventoryResponse} chartData={sortedChartData}/>
    </>
  );
};

export default Dashboard;