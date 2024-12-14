import React, { useState, useMemo } from 'react';
import { BarChart, BarChartProps } from '@mui/x-charts/BarChart';

type DataItem = {
  monthYear: string;
  sales: number;
};

interface SimpleBarChartProps {
  data: DataItem[];
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data }) => {
  const [monthsToShow, setMonthsToShow] = useState(12);

  const chartSetting: Partial<BarChartProps> = {
    width: 1200,
    height: 300,
  };

  const generateLastNMonths = (n: number) => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.unshift(`${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`);
    }
    return months;
  };

  const lastNMonths = useMemo(() => generateLastNMonths(monthsToShow), [monthsToShow]);

  const chartData = useMemo(() => {
    const dataMap = new Map(data.map(item => [item.monthYear, item.sales]));
    return lastNMonths.map(month => ({
      monthYear: month,
      sales: dataMap.get(month) || 0
    }));
  }, [data, lastNMonths]);

  return (
    <div>
      <div>
        <label htmlFor="monthsSelect">Show last:</label>
        <select 
          id="monthsSelect" 
          value={monthsToShow} 
          onChange={(e) => setMonthsToShow(Number(e.target.value))}
        >
          <option value={3}>3 months</option>
          <option value={6}>6 months</option>
          <option value={12}>12 months</option>
          <option value={24}>24 months</option>
          <option value={36}>36 months</option>
        </select>
      </div>
      <BarChart
        dataset={chartData}
        xAxis={[{ scaleType: 'band', dataKey: 'monthYear' }]}
        series={[{ dataKey: 'sales', label: 'Sales' }]}
        {...chartSetting}
      />
    </div>
  );
};

export default SimpleBarChart;