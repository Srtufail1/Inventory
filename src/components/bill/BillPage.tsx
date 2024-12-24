"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import DarkModeToggle from '../DarkModeToggle';
import { signOut } from "next-auth/react";

type BillEntry = {
  dueMonth: string;
  totalAmount: string;
};

const BillPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [billData, setBillData] = useState<BillEntry[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (searchTerm.trim() === "") return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/ledger?customer=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      
      // Process the data
      const billEntries: BillEntry[] = [];
      result.ledgerDataSets.forEach((dataset: any) => {
        dataset.ledgerData.forEach((entry: any) => {
          const [startDate] = entry.dates.split(' - ');
          const [day, month, year] = startDate.split('.');
          const dueMonth = new Date(parseInt(`20${year}`), parseInt(month) - 1, parseInt(day));
          dueMonth.setMonth(dueMonth.getMonth() + 2);
          
          const dueMonthString = dueMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
          
          const existingEntry = billEntries.find(e => e.dueMonth === dueMonthString);
          if (existingEntry) {
            existingEntry.totalAmount += entry.amount;
          } else {
            billEntries.push({
              dueMonth: dueMonthString,
              totalAmount: entry.amount,
            });
          }
        });
      });

      // Add labor amounts
      result.laborTable.forEach((labor: any) => {
        const [day, month, year] = labor.dueDate.split('.');
        const dueMonth = new Date(parseInt(`20${year}`), parseInt(month) - 1, parseInt(day));
        dueMonth.setMonth(dueMonth.getMonth() + 1);
        const dueMonthString = dueMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        const existingEntry = billEntries.find(e => e.dueMonth === dueMonthString);
        if (existingEntry) {
          existingEntry.totalAmount += labor.labourAmount;
        } else {
          billEntries.push({
            dueMonth: dueMonthString,
            totalAmount: labor.labourAmount,
          });
        }
      });

      setBillData(billEntries.sort((a, b) => new Date(a.dueMonth).getTime() - new Date(b.dueMonth).getTime()));
      setCustomerName(searchTerm);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-gray-100/40 px-6">
        <div className="w-full"></div>
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
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 max-w-sm"
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      
      {customerName && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Customer: {customerName}</h2>
        </div>
      )}
      
      {billData.length > 0 && (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Month</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {billData.map((entry, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{entry.dueMonth}</td>
                <td className="px-6 py-4 whitespace-nowrap">{entry.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {billData.length === 0 && !isLoading && customerName && (
        <p>No bill data found for this customer.</p>
      )}
    </div>
    </div>
  );
};

export default BillPage;