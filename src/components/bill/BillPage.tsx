"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Printer } from "lucide-react";
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

type CustomerBillEntry = {
  customerName: string;
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

// Progress Bar Component
type ProgressBarProps = {
  current: number;
  total: number;
  label?: string;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, label }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="mt-3">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{label || 'Progress'}</span>
        <span>{current} / {total} customers ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Generate month options for the search dropdown
const generateMonthOptions = (): { value: string; label: string }[] => {
  const options: { value: string; label: string }[] = [];
  const currentDate = new Date();
  
  // Generate options for the past 24 months and next 12 months
  for (let i = -24; i <= 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const value = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    options.push({ value, label: value });
  }
  
  return options;
};

type BillPageProps = {
  isSuperAdmin?: boolean;
};

const BillPage: React.FC<BillPageProps> = ({ isSuperAdmin = false }) => { 
  // Customer search state
  const [searchTerm, setSearchTerm] = useState('');
  const [billData, setBillData] = useState<BillEntry[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [customers, setCustomers] = useState<string[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Helper function to escape HTML special characters (prevents XSS)
  const escapeHtml = (value: string): string =>
    value.replace(/[&<>"'`]/g, (char) => {
      switch (char) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case "'":
          return '&#39;';
        case '`':
          return '&#96;';
        default:
          return char;
      }
    });

  // Month search state
  const [searchMode, setSearchMode] = useState<'customer' | 'month'>('customer');
  const [selectedSearchMonth, setSelectedSearchMonth] = useState<string>('');
  const [monthBillData, setMonthBillData] = useState<CustomerBillEntry[]>([]);
  const [monthTotal, setMonthTotal] = useState<number>(0);
  const [searchedMonth, setSearchedMonth] = useState<string>('');
  
  // Progress state
  const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0 });
  const [isMonthSearching, setIsMonthSearching] = useState(false);

  const monthOptions = generateMonthOptions();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        const data = await response.json();
        setCustomers(data.map((customer: any) => customer.customer || customer.name || ''));
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer => 
        customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers([]);
    }
  }, [searchTerm, customers]);

  // Process bill data for a single customer
  const processBillData = (result: any): BillEntry[] => {
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
          labourCost: 0,
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

    return billEntries;
  };

  const handleCustomerSearch = async () => {
    if (searchTerm.trim() === "") return;
  
    setIsLoading(true);
    setSearchMode('customer');
    setMonthBillData([]);
    setSearchedMonth('');
    
    try {
      const response = await fetch(`/api/ledger?customer=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      
      const billEntries = processBillData(result);
      setBillData(billEntries.sort((a, b) => new Date(a.dueMonth).getTime() - new Date(b.dueMonth).getTime()));
      setCustomerName(searchTerm);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthSearch = async () => {
    if (!selectedSearchMonth) return;

    setIsLoading(true);
    setIsMonthSearching(true);
    setSearchMode('month');
    setBillData([]);
    setCustomerName('');
    
    const validCustomers = customers.filter(c => c);
    setSearchProgress({ current: 0, total: validCustomers.length });
    
    try {
      const customerBills: CustomerBillEntry[] = [];
      let total = 0;
      let processedCount = 0;

      // Batch size - number of parallel requests at a time
      const BATCH_SIZE = 20;

      // Function to fetch a single customer's bill
      const fetchCustomerBill = async (customer: string): Promise<CustomerBillEntry | null> => {
        try {
          const response = await fetch(`/api/ledger?customer=${encodeURIComponent(customer)}`);
          if (!response.ok) return null;
          
          const result = await response.json();
          const billEntries = processBillData(result);
          const monthEntry = billEntries.find(entry => entry.dueMonth === selectedSearchMonth);
          
          if (monthEntry && monthEntry.totalAmount > 0) {
            return {
              customerName: customer,
              totalAmount: monthEntry.totalAmount,
              items: monthEntry.items
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching data for customer ${customer}:`, error);
          return null;
        }
      };

      // Process customers in parallel batches
      for (let i = 0; i < validCustomers.length; i += BATCH_SIZE) {
        const batch = validCustomers.slice(i, i + BATCH_SIZE);
        
        // Fetch all customers in this batch in parallel
        const batchResults = await Promise.all(
          batch.map(customer => fetchCustomerBill(customer))
        );
        
        // Process batch results
        batchResults.forEach(result => {
          if (result) {
            customerBills.push(result);
            total += result.totalAmount;
          }
        });
        
        // Update progress
        processedCount += batch.length;
        setSearchProgress({ current: processedCount, total: validCustomers.length });
      }

      // Sort by customer name
      customerBills.sort((a, b) => a.customerName.localeCompare(b.customerName));
      
      setMonthBillData(customerBills);
      setMonthTotal(total);
      setSearchedMonth(selectedSearchMonth);
    } catch (error) {
      console.error('Error fetching month data:', error);
    } finally {
      setIsLoading(false);
      setIsMonthSearching(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const safeSearchedMonth = escapeHtml(searchedMonth);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Monthly Bill Summary - ${safeSearchedMonth}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              text-align: center;
              color: #1a1a1a;
              margin-bottom: 10px;
            }
            .subtitle {
              text-align: center;
              color: #666;
              margin-bottom: 30px;
            }
            .total-box {
              background: #f0fdf4;
              border: 2px solid #22c55e;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .total-label {
              font-size: 18px;
              font-weight: bold;
              color: #166534;
            }
            .total-amount {
              font-size: 28px;
              font-weight: bold;
              color: #166534;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              font-weight: 600;
              text-transform: uppercase;
              font-size: 12px;
              color: #6b7280;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .amount-cell {
              text-align: right;
            }
            .total-row {
              background-color: #dcfce7 !important;
              font-weight: bold;
            }
            .total-row td {
              color: #166534;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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

      <main className="max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Search Section - Side by Side */}
        <div className={`mb-10 grid grid-cols-1 ${isSuperAdmin ? 'md:grid-cols-2' : ''} gap-6`}>
          {/* Customer Search */}
          <div className="p-4 bg-gray-50 rounded-lg h-fit">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search by Customer
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  ref={searchRef}
                  placeholder="Search customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
                {filteredCustomers.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 max-h-60 overflow-auto rounded-md shadow-lg">
                    {filteredCustomers.map((customer, index) => (
                      <li 
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSearchTerm(customer);
                          setFilteredCustomers([]);
                        }}
                      >
                        {customer}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button 
                onClick={handleCustomerSearch} 
                disabled={isLoading} 
                className="w-full px-4 py-2"
              >
                {isLoading && searchMode === 'customer' ? 'Searching...' : 'Search Customer'}
              </Button>
            </div>
          </div>

          {/* Month Search - Only visible to SuperAdmin */}
          {isSuperAdmin && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Search by Month (All Customers)
              </h3>
              <div className="space-y-3">
                <select
                  value={selectedSearchMonth}
                  onChange={(e) => setSelectedSearchMonth(e.target.value)}
                  className="block w-full px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a month...</option>
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button 
                  onClick={handleMonthSearch} 
                  disabled={isLoading || !selectedSearchMonth} 
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700"
                >
                  {isMonthSearching ? 'Searching...' : 'Search Month'}
                </Button>
                
                {/* Progress Bar */}
                {isMonthSearching && (
                  <ProgressBar 
                    current={searchProgress.current} 
                    total={searchProgress.total}
                    label="Fetching customer bills"
                  />
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Customer Search Results */}
        {searchMode === 'customer' && customerName && (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Customer: {customerName}</h2>
            </div>
            
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
            
            {billData.length === 0 && !isLoading && (
              <p className="text-center text-gray-500 mt-8">No bill data found for this customer.</p>
            )}
          </>
        )}

        {/* Month Search Results - Only visible to SuperAdmin */}
        {isSuperAdmin && searchMode === 'month' && searchedMonth && !isMonthSearching && (
          <>
          {/* Print Button - Outside printable area */}
              {monthBillData.length > 0 && (
                <div className="flex justify-end mb-8">
                  <Button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900"
                  >
                    <Printer className="h-4 w-4" />
                    Print Summary
                  </Button>
                </div>
              )}
            {/* Printable Content */}
            <div ref={printRef}>
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Monthly Bill Summary</h1>
              <p className="text-center text-gray-600 mb-6">{searchedMonth} - {monthBillData.length} customer(s)</p>
              
              {monthBillData.length > 0 && (
                <>
                  {/* Monthly Total Summary */}
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold text-green-800">{searchedMonth} - Total Bill</h3>
                        <p className="text-green-600 text-sm mt-1">Sum of all {monthBillData.length} customer bills</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-800">{monthTotal.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Table */}
                  <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                    <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Customer Bills - {searchedMonth}</h3>
                    </div>
                    <div className="px-6 py-4 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bill Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {monthBillData.map((customerBill, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customerBill.customerName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{customerBill.totalAmount.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                          <tr className="bg-green-100 font-bold">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" colSpan={2}>TOTAL</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-800 text-right">{monthTotal.toLocaleString('en-IN')}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            
            {monthBillData.length === 0 && (
              <p className="text-center text-gray-500 mt-8">No bill data found for {searchedMonth}.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default BillPage;