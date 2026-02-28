"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Printer, FileDown } from "lucide-react";
import DarkModeToggle from '../DarkModeToggle';
import { signOut } from "next-auth/react";
import { useCustomers } from '@/context/CustomersContext';
import { generateCustomerPdf, generateMonthlyPrint, generateCombinedCustomerPdf, MonthBillSection } from '../bill/billPdfGenerator';

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

export type ItemTranslationMap = Map<string, string>;

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

const generateMonthOptions = (): { value: string; label: string }[] => {
  const options: { value: string; label: string }[] = [];
  const currentDate = new Date();
  
  for (let i = -24; i <= 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const value = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    options.push({ value, label: value });
  }
  
  return options;
};

type UpdatedBillPageProps = {
  isSuperAdmin?: boolean;
};

const UpdatedBillPage: React.FC<UpdatedBillPageProps> = ({ isSuperAdmin = false }) => { 
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

  const [searchMode, setSearchMode] = useState<'customer' | 'month'>('customer');
  const [selectedSearchMonth, setSelectedSearchMonth] = useState<string>('');
  const [monthBillData, setMonthBillData] = useState<CustomerBillEntry[]>([]);
  const [monthTotal, setMonthTotal] = useState<number>(0);
  const [searchedMonth, setSearchedMonth] = useState<string>('');
  
  const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0 });
  const [isMonthSearching, setIsMonthSearching] = useState(false);

  const [itemTranslations, setItemTranslations] = useState<ItemTranslationMap>(new Map());
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set());

  const monthOptions = generateMonthOptions();

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const res = await fetch('/api/item-translations');
        const data = await res.json();
        if (Array.isArray(data)) {
          const map = new Map<string, string>();
          data.forEach((item: { englishName: string; urduName: string }) => {
            map.set(item.englishName.toLowerCase().trim(), item.urduName);
          });
          setItemTranslations(map);
        }
      } catch (error) {
        console.error('Failed to fetch item translations:', error);
      }
    };
    fetchTranslations();
  }, []);

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

  /**
   * UPDATED BILL LOGIC:
   * 
   * When the stored quantity becomes 0 (nextPeriodQuantity === "0"),
   * AND the last out date is BEFORE the 1st of the end date's month,
   * the bill is pulled back by one month.
   * 
   * Example (pull back):
   * - Period 16.01.26 - 16.02.26, all out on 18.01.26 (before Feb 1st)
   * - Normally this bill would go into March 2026
   * - Since qty became 0 before Feb started, bill is pulled back to February 2026
   * 
   * Example (no pull back):
   * - Period 16.12.25 - 16.01.26, all out on 06.01.26 (after Jan 1st)
   * - Bill goes into February 2026 as normal (no pull back)
   */
  const processBillData = (result: any): { entries: BillEntry[], detailedData: Map<string, BillItemEntry[]> } => {
    const billEntries: BillEntry[] = [];
    const detailedData = new Map<string, BillItemEntry[]>();
    const inwardMonthMap = new Map<string, string>();

    // Process ledger data
    result.ledgerDataSets.forEach((dataset: any) => {
      const ledgerRows = dataset.ledgerData;

      ledgerRows.forEach((entry: any, rowIndex: number) => {
        const [, endDate] = entry.dates.split(' - ');
        const [day, month, year] = endDate.split('.');
        // Normal due month: month after the end date's month
        let dueMonth = new Date(parseInt(`20${year}`), parseInt(month), 1);

        // --- UPDATED LOGIC: Only pull back if stock went to 0 BEFORE the end date's month started ---
        const nextPeriodQty = parseInt(entry.nextPeriodQuantity) || 0;

        if (nextPeriodQty === 0 && entry.outDate_table) {
          // 1st of the end date's month
          const endMonthStart = new Date(parseInt(`20${year}`), parseInt(month) - 1, 1);

          // Parse the last out date from outDate_table
          // Format: "06.01.26 - 43" or multiple lines "06.01.26 - 20\n10.01.26 - 23"
          const outLines = entry.outDate_table.trim().split('\n');
          const lastOutLine = outLines[outLines.length - 1].trim();
          const outDateMatch = lastOutLine.match(/^(\d{2})\.(\d{2})\.(\d{2})/);

          if (outDateMatch) {
            const lastOutDate = new Date(
              parseInt(`20${outDateMatch[3]}`),
              parseInt(outDateMatch[2]) - 1,
              parseInt(outDateMatch[1])
            );

            // Only pull back if stock went to 0 BEFORE the end date's month started
            if (lastOutDate < endMonthStart) {
              dueMonth = new Date(dueMonth.getFullYear(), dueMonth.getMonth() - 1, 1);
            }
          }
        }
        // --- END UPDATED LOGIC ---

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
          dateRange: nextPeriodQty === 0 ? `${entry.dates} (NIL)` : entry.dates,
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

        // Track which month this inward number was FIRST assigned to (labour always goes in the first bill)
        if (!inwardMonthMap.has(dataset.inumber)) {
          inwardMonthMap.set(dataset.inumber, dueMonthString);
        }
      });
    });

    // Process labor table - use the same month as the store cost when available
    result.laborTable.forEach((labor: any) => {
      let dueMonthString: string;
      if (inwardMonthMap.has(labor.inumber)) {
        // Use the same month the store cost was assigned to
        dueMonthString = inwardMonthMap.get(labor.inumber)!;
      } else {
        const [day, month, year] = labor.dueDate.split('.');
        const dueMonth = new Date(parseInt(`20${year}`), parseInt(month), 1);
        dueMonthString = dueMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
      }
      
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
    setSelectedMonths(new Set());
    
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

      const BATCH_SIZE = 20;

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

      for (let i = 0; i < validCustomers.length; i += BATCH_SIZE) {
        const batch = validCustomers.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(batch.map(customer => fetchCustomerBill(customer)));
        
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

  const toggleMonthSelection = (month: string) => {
    setSelectedMonths(prev => {
      const next = new Set(prev);
      if (next.has(month)) {
        next.delete(month);
      } else {
        next.add(month);
      }
      return next;
    });
  };

  const combinedTotal = Array.from(selectedMonths).reduce((sum, month) => {
    const entry = billData.find(e => e.dueMonth === month);
    return sum + (entry?.totalAmount ?? 0);
  }, 0);

  const handleGenerateCombinedPdf = () => {
    const sortedMonths = Array.from(selectedMonths).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    const sections: MonthBillSection[] = sortedMonths.map(month => ({
      month,
      items: detailedBillData.get(month) ?? [],
      totalAmount: billData.find(e => e.dueMonth === month)?.totalAmount ?? 0,
    }));
    generateCombinedCustomerPdf(sections, combinedTotal, customerName, itemTranslations);
  };

  const handleGeneratePdf = (month: string) => {
    const items = detailedBillData.get(month);
    const billEntry = billData.find(e => e.dueMonth === month);
    
    if (items && billEntry) {
      generateCustomerPdf(items, billEntry.totalAmount, customerName, month, itemTranslations);
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Updated Bill
            </h1>
          </div>
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
                {selectedMonths.size >= 2 && (
                  <div className="flex items-center justify-between mb-4 px-5 py-3 bg-blue-500/10 border border-blue-500 rounded-lg">
                    <span className="text-sm font-medium text-foreground">
                      {selectedMonths.size} months selected &nbsp;·&nbsp; Combined Total:&nbsp;
                      <strong>{combinedTotal.toLocaleString('en-IN')}</strong>
                    </span>
                    <Button
                      onClick={handleGenerateCombinedPdf}
                      size="sm"
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <FileDown className="h-4 w-4" />
                      Generate Combined Bill
                    </Button>
                  </div>
                )}
                <div className="space-y-8">
                  {filteredBillData.map((entry, index) => (
                    <div key={index} className="bg-card shadow rounded-lg overflow-hidden border">
                      <div className="px-6 py-4 border-b">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedMonths.has(entry.dueMonth)}
                              onChange={() => toggleMonthSelection(entry.dueMonth)}
                              className="h-4 w-4 cursor-pointer accent-blue-600"
                              title="Select for combined bill"
                            />
                            <h3 className="text-xl font-semibold text-foreground">{entry.dueMonth}</h3>
                          </div>
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
            <div ref={printRef}>
              <h1 className="text-2xl font-bold text-center text-foreground mb-2">Monthly Bill Summary (Updated)</h1>
              <p className="text-center text-muted-foreground mb-6">{searchedMonth} - {monthBillData.length} customer(s)</p>
              
              {monthBillData.length > 0 && (
                <>
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

export default UpdatedBillPage;