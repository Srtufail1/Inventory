"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Printer, FileDown } from "lucide-react";
import DarkModeToggle from '../DarkModeToggle';
import { signOut } from "next-auth/react";
import { useCustomers } from '@/context/CustomersContext';
import { generateCustomerPdf, generateMonthlyPrint } from './billPdfGenerator';

export type BillItemEntry = {
  inwardNumber: string;
  storeCost: number;
  labourCost: number;
  sum: number;
  dateRange?: string;
  itemName?: string;
  storedQuantity?: number;
  rate?: number;
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
    <label htmlFor="month-select" className="block text-sm font-medium text-foreground mb-2">Select Month</label>
    <select
      id="month-select"
      value={selectedMonth || ''}
      onChange={(e) => onSelectMonth(e.target.value || null)}
      className="block w-full px-3 py-2 text-foreground bg-background border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
      <div className="flex justify-between text-sm text-muted-foreground mb-1">
        <span>{label || 'Progress'}</span>
        <span>{current} / {total} customers ({percentage}%)</span>
      </div>
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
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
  const { customers, loading } = useCustomers();
  const [filteredCustomers, setFilteredCustomers] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [hasSelected, setHasSelected] = useState(false);
  const [detailedBillData, setDetailedBillData] = useState<Map<string, BillItemEntry[]>>(new Map());

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
    if (!searchTerm || loading || hasSelected) {
      setFilteredCustomers([]);
      return;
    }
    const filtered = customers.filter(customer =>
      customer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers, loading, hasSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHasSelected(false);
  };

  const handleCustomerSelect = (customer: string) => {
    setSearchTerm(customer);
    setHasSelected(true);
    setFilteredCustomers([]);
  };

  // Process bill data for a single customer
  const processBillData = (result: any): { entries: BillEntry[], detailedData: Map<string, BillItemEntry[]> } => {
    const billEntries: BillEntry[] = [];
    const detailedData = new Map<string, BillItemEntry[]>();

    // Process ledger data
    result.ledgerDataSets.forEach((dataset: any) => {
      dataset.ledgerData.forEach((entry: any) => {
        const [, endDate] = entry.dates.split(' - ');
        const [day, month, year] = endDate.split('.');
        const dueMonth = new Date(parseInt(`20${year}`), parseInt(month), 1);
        
        const dueMonthString = dueMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        let billEntry = billEntries.find(e => e.dueMonth === dueMonthString);
        if (!billEntry) {
          billEntry = { dueMonth: dueMonthString, totalAmount: 0, items: [] };
          billEntries.push(billEntry);
        }

        const customerDetail = result.customerDetails.find((d: any) => d.inumber === dataset.inumber);
        const itemName = customerDetail?.item || 'N/A';

        const billItem: BillItemEntry = {
          inwardNumber: dataset.inumber,
          storeCost: entry.amount,
          labourCost: 0,
          sum: entry.amount,
          dateRange: entry.dates,
          itemName: itemName,
          storedQuantity: parseInt(entry.quantity) || 0,
          rate: parseFloat(entry.storeRate) || 0,
        };

        billEntry.items.push(billItem);
        billEntry.totalAmount += entry.amount;

        if (!detailedData.has(dueMonthString)) {
          detailedData.set(dueMonthString, []);
        }
        detailedData.get(dueMonthString)!.push(billItem);
      });
    });

    result.laborTable.forEach((labor: any) => {
      const [day, month, year] = labor.dueDate.split('.');
      const dueMonth = new Date(parseInt(`20${year}`), parseInt(month), 1);
      const dueMonthString = dueMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      let billEntry = billEntries.find(e => e.dueMonth === dueMonthString);
      if (!billEntry) {
        billEntry = { dueMonth: dueMonthString, totalAmount: 0, items: [] };
        billEntries.push(billEntry);
      }

      const customerDetail = result.customerDetails.find((d: any) => d.inumber === labor.inumber);
      const itemName = customerDetail?.item || 'N/A';

      let item = billEntry.items.find(i => i.inwardNumber === labor.inumber);
      if (item) {
        if (item.labourCost === 0) {
          item.labourCost = labor.labourAmount;
          item.sum += labor.labourAmount;
          billEntry.totalAmount += labor.labourAmount;
        }
      } else {
        const newItem: BillItemEntry = {
          inwardNumber: labor.inumber,
          storeCost: 0,
          labourCost: labor.labourAmount,
          sum: labor.labourAmount,
          dateRange: `${labor.addDate} - ${labor.dueDate}`,
          itemName: itemName,
          storedQuantity: parseInt(labor.quantity) || 0,
          rate: 0,
        };
        billEntry.items.push(newItem);
        billEntry.totalAmount += labor.labourAmount;
      }

      if (!detailedData.has(dueMonthString)) {
        detailedData.set(dueMonthString, []);
      }
      const existingDetailedItem = detailedData.get(dueMonthString)!.find(i => i.inwardNumber === labor.inumber);
      if (existingDetailedItem) {
        if (existingDetailedItem.labourCost === 0) {
          existingDetailedItem.labourCost = labor.labourAmount;
          existingDetailedItem.sum += labor.labourAmount;
        }
      } else {
        detailedData.get(dueMonthString)!.push({
          inwardNumber: labor.inumber,
          storeCost: 0,
          labourCost: labor.labourAmount,
          sum: labor.labourAmount,
          dateRange: `${labor.addDate} - ${labor.dueDate}`,
          itemName: itemName,
          storedQuantity: parseInt(labor.quantity) || 0,
          rate: 0,
        });
      }
    });

    return { entries: billEntries, detailedData };
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
      
      const { entries, detailedData } = processBillData(result);
      setBillData(entries.sort((a, b) => new Date(a.dueMonth).getTime() - new Date(b.dueMonth).getTime()));
      setDetailedBillData(detailedData);
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
          const { entries } = processBillData(result);
          const monthEntry = entries.find(entry => entry.dueMonth === selectedSearchMonth);
          
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
        const batchResults = await Promise.all(batch.map(customer => fetchCustomerBill(customer)));
        
        // Process batch results
        batchResults.forEach(result => {
          if (result) {
            customerBills.push(result);
            total += result.totalAmount;
          }
        });
        
        processedCount += batch.length;
        setSearchProgress({ current: processedCount, total: validCustomers.length });
      }

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

  const handleGeneratePdf = (month: string) => {
    const items = detailedBillData.get(month);
    const billEntry = billData.find(e => e.dueMonth === month);
    
    if (items && billEntry) {
      generateCustomerPdf(items, billEntry.totalAmount, customerName, month);
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      generateMonthlyPrint(printRef.current, searchedMonth);
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
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-muted/40 px-6">
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
          <div className="p-4 bg-muted/50 rounded-lg h-fit">
            <h3 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search by Customer
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  placeholder="Search customer name..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  className="pl-10 pr-4 py-2 w-full"
                />
                {filteredCustomers.length > 0 && (
                  <ul className="absolute z-10 w-full bg-popover border mt-1 max-h-60 overflow-auto rounded-md shadow-lg">
                    {filteredCustomers.map((customer, index) => (
                      <li 
                        key={index}
                        className="px-4 py-2 hover:bg-muted cursor-pointer text-popover-foreground"
                        onClick={() => handleCustomerSelect(customer)}
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
            <div className="p-4 bg-blue-500/10 dark:bg-blue-500/5 rounded-lg">
              <h3 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Search by Month (All Customers)
              </h3>
              <div className="space-y-3">
                <select
                  value={selectedSearchMonth}
                  onChange={(e) => setSelectedSearchMonth(e.target.value)}
                  className="block w-full px-3 py-2 text-foreground bg-background border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
              <h2 className="text-3xl font-bold text-foreground">Customer: {customerName}</h2>
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
                    <div key={index} className="bg-card shadow rounded-lg overflow-hidden border">
                      <div className="px-6 py-4 border-b">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold text-foreground">{entry.dueMonth}</h3>
                          <div className="flex items-center space-x-4">
                            <p className="text-l text-foreground">Total Amount:</p>
                            <p className="text-xl font-bold text-foreground">{entry.totalAmount.toLocaleString('en-IN')}</p>
                            <Button
                              onClick={() => toggleMonthExpansion(entry.dueMonth)}
                              variant="outline"
                              size="sm"
                            >
                              {expandedMonths.has(entry.dueMonth) ? 'Hide Details' : 'Show Details'}
                            </Button>
                            <Button
                              onClick={() => handleGeneratePdf(entry.dueMonth)}
                              variant="default"
                              size="sm"
                              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            >
                              <FileDown className="h-4 w-4" />
                              Print Bill
                            </Button>
                          </div>
                        </div>
                      </div>
                      {expandedMonths.has(entry.dueMonth) && (
                        <div className="px-6 py-4 overflow-x-auto">
                          <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted/50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Inward Number</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date (From - To)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Item Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stored Qty</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Rate</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Labour Cost</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {entry.items.map((item, itemIndex) => (
                                <tr key={itemIndex} className={itemIndex % 2 === 0 ? 'bg-muted/30' : ''}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{item.inwardNumber}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{item.dateRange || '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{item.itemName || '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{(item.storedQuantity || 0).toLocaleString('en-IN')}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{(item.rate || 0).toLocaleString('en-IN')}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{item.labourCost.toLocaleString('en-IN')}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{item.sum.toLocaleString('en-IN')}</td>
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
              <p className="text-center text-muted-foreground mt-8">No bill data found for this customer.</p>
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
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print Summary
                </Button>
              </div>
            )}
            {/* Printable Content */}
            <div ref={printRef}>
              <h1 className="text-2xl font-bold text-center text-foreground mb-2">Monthly Bill Summary</h1>
              <p className="text-center text-muted-foreground mb-6">{searchedMonth} - {monthBillData.length} customer(s)</p>
              
              {monthBillData.length > 0 && (
                <>
                  {/* Monthly Total Summary */}
                  <div className="bg-green-500/10 dark:bg-green-500/5 border-2 border-green-500 dark:border-green-600 rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold text-green-700 dark:text-green-400">{searchedMonth} - Total Bill</h3>
                        <p className="text-green-600 dark:text-green-500 text-sm mt-1">Sum of all {monthBillData.length} customer bills</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-700 dark:text-green-400">{monthTotal.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Table */}
                  <div className="bg-card shadow rounded-lg overflow-hidden mb-6 border">
                    <div className="px-6 py-4 bg-muted/50 border-b">
                      <h3 className="text-lg font-semibold text-foreground">Customer Bills - {searchedMonth}</h3>
                    </div>
                    <div className="px-6 py-4 overflow-x-auto">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">S.No</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer Name</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Bill Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {monthBillData.map((customerBill, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{index + 1}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{customerBill.customerName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-right">{customerBill.totalAmount.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                          <tr className="bg-green-500/10 dark:bg-green-500/5 font-bold">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground" colSpan={2}>TOTAL</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 dark:text-green-400 text-right">{monthTotal.toLocaleString('en-IN')}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            
            {monthBillData.length === 0 && (
              <p className="text-center text-muted-foreground mt-8">No bill data found for {searchedMonth}.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default BillPage;