"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import DarkModeToggle from '../DarkModeToggle';
import { signOut } from "next-auth/react";

type BillItemEntry = {
  inwardNumber: string;
  storeCost: number;
  labourCost: number;
  sum: number;
};

type BillEntry = {
  dueMonth: string;
  totalAmount: number;
  items: BillItemEntry[];
};

type MonthSelectorProps = {
  months: string[];
  selectedMonth: string | null;
  onSelectMonth: (month: string | null) => void;
};

const MonthSelector: React.FC<MonthSelectorProps> = ({ months, selectedMonth, onSelectMonth }) => (
  <div className="mb-6">
    <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
    <select
      id="month-select"
      value={selectedMonth || ''}
      onChange={(e) => onSelectMonth(e.target.value || null)}
      className="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
    >
      <option value="">All Months</option>
      {months.map((month) => (
        <option key={month} value={month}>{month}</option>
      ))}
    </select>
  </div>
);

const BillPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [billData, setBillData] = useState<BillEntry[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const handleSearch = async () => {
    if (searchTerm.trim() === "") return;
  
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ledger?customer=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      
      const billEntries: BillEntry[] = [];
  
      // Process ledger data
      result.ledgerDataSets.forEach((dataset: any) => {
        dataset.ledgerData.forEach((entry: any) => {
          const [startDate] = entry.dates.split(' - ');
          const [day, month, year] = startDate.split('.');
          const dueMonth = new Date(parseInt(`20${year}`), parseInt(month) - 1, parseInt(day));
          dueMonth.setMonth(dueMonth.getMonth() + 2);
          
          const dueMonthString = dueMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
          
          let billEntry = billEntries.find(e => e.dueMonth === dueMonthString);
          if (!billEntry) {
            billEntry = { dueMonth: dueMonthString, totalAmount: 0, items: [] };
            billEntries.push(billEntry);
          }
  
          billEntry.items.push({
            inwardNumber: dataset.inumber,
            storeCost: entry.amount,
            labourCost: 0, // We'll add this later from labor table
            sum: entry.amount
          });
          billEntry.totalAmount += entry.amount;
        });
      });
  
      // Process labor data
      result.laborTable.forEach((labor: any) => {
        const [day, month, year] = labor.dueDate.split('.');
        const dueMonth = new Date(parseInt(`20${year}`), parseInt(month) - 1, parseInt(day));
        dueMonth.setMonth(dueMonth.getMonth() + 1);
        const dueMonthString = dueMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        let billEntry = billEntries.find(e => e.dueMonth === dueMonthString);
        if (!billEntry) {
          billEntry = { dueMonth: dueMonthString, totalAmount: 0, items: [] };
          billEntries.push(billEntry);
        }
  
        let item = billEntry.items.find(i => i.inwardNumber === labor.inumber);
        if (item) {
          item.labourCost = labor.labourAmount;
          item.sum += labor.labourAmount;
        } else {
          billEntry.items.push({
            inwardNumber: labor.inumber,
            storeCost: 0,
            labourCost: labor.labourAmount,
            sum: labor.labourAmount
          });
        }
        billEntry.totalAmount += labor.labourAmount;
      });
  
      setBillData(billEntries.sort((a, b) => new Date(a.dueMonth).getTime() - new Date(b.dueMonth).getTime()));
      setCustomerName(searchTerm);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMonthExpansion = (month: string) => {
    setExpandedMonths(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(month)) {
        newExpanded.delete(month);
      } else {
        newExpanded.add(month);
      }
      return newExpanded;
    });
  };

  const getUniqueMonths = (data: BillEntry[]): string[] => {
    const monthSet = new Set(data.map(entry => entry.dueMonth));
    return Array.from(monthSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  };

  const uniqueMonths = getUniqueMonths(billData);

  const filteredBillData = selectedMonth
    ? billData.filter(entry => entry.dueMonth === selectedMonth)
    : billData;

  return (
    <div>
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-gray-100/40 px-6">
        <div className="flex items-center gap-3 w-full"></div>
        <DarkModeToggle />
        <Button onClick={() => signOut()} type="submit">
          Sign Out
        </Button>
      </div>
      <div className="p-6">
        <div className="flex item justify-between pt-3 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Customer Billing Records
          </h1>
        </div>
      </div>

      <main className="max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading} className="px-4 py-2">
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
        
        {customerName && (
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Customer: {customerName}</h2>
          </div>
        )}
        
        {billData.length > 0 && (
          <>
            <MonthSelector
              months={uniqueMonths}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />
            <div className="space-y-8">
              {filteredBillData.map((entry, index) => (
                <div key={index} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-900">{entry.dueMonth}</h3>
                      <div className="flex items-center space-x-4">
                        <p className="text-l text-gray-900">Total Amount:</p>
                        <p className="text-xl font-bold text-gray-900">{entry.totalAmount.toLocaleString('en-IN')}</p>
                        <Button
                          onClick={() => toggleMonthExpansion(entry.dueMonth)}
                          variant="outline"
                          size="sm"
                        >
                          {expandedMonths.has(entry.dueMonth) ? 'Hide Details' : 'Show Details'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  {expandedMonths.has(entry.dueMonth) && (
                    <div className="px-6 py-4 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inward Number</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Cost</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Labour Cost</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sum</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {entry.items.map((item, itemIndex) => (
                            <tr key={itemIndex} className={itemIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.inwardNumber}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.storeCost.toLocaleString('en-IN')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.labourCost.toLocaleString('en-IN')}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sum.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        
        {billData.length === 0 && !isLoading && customerName && (
          <p className="text-center text-gray-500 mt-8">No bill data found for this customer.</p>
        )}
      </main>
    </div>
  );
};

export default BillPage;