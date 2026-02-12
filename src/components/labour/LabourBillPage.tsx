"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Printer, FileDown, MonitorDown, MonitorUp } from "lucide-react";
import DarkModeToggle from '@/components/DarkModeToggle';
import { signOut } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type InwardLabourEntry = {
  id: string;
  type: 'inward';
  number: string;
  date: string;
  customer: string;
  item: string;
  packing: string;
  weight: string;
  quantity: number;
  labourRate: number;
  labourCost: number;
};

type OutwardLabourEntry = {
  id: string;
  type: 'outward';
  number: string;
  inwardNumber: string;
  date: string;
  customer: string;
  item: string;
  quantity: number;
  labourRate: number;
  labourCost: number;
};

type LabourData = {
  inwardData: InwardLabourEntry[];
  outwardData: OutwardLabourEntry[];
  inwardTotal: number;
  outwardTotal: number;
  grandTotal: number;
  searchDate: string;
};

const LabourBillPage = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [labourData, setLabourData] = useState<LabourData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/labour?date=${encodeURIComponent(selectedDate)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setLabourData(data);
    } catch (err) {
      console.error('Error fetching labour data:', err);
      setError('Failed to fetch labour bill data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    if (!labourData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formattedDate = formatDate(labourData.searchDate);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Labour Bill - ${formattedDate}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 900px;
              margin: 0 auto;
            }
            h1, h2, h3 {
              text-align: center;
              color: #1a1a1a;
            }
            .subtitle {
              text-align: center;
              color: #666;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              font-weight: 600;
              text-transform: uppercase;
              font-size: 11px;
              color: #6b7280;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .total-row {
              background-color: #e0f2fe !important;
              font-weight: bold;
            }
            .grand-total {
              background-color: #dcfce7 !important;
              font-weight: bold;
              font-size: 14px;
            }
            .section-title {
              background-color: #f0f9ff;
              padding: 10px;
              margin-top: 30px;
              border-radius: 5px;
            }
            .text-right {
              text-align: right;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>ZamZam Cold Storage</h1>
          <h2>Labour Bill</h2>
          <p class="subtitle">Date: ${formattedDate}</p>

          ${labourData.inwardData.length > 0 ? `
            <div class="section-title">
              <h3 style="margin: 0; text-align: left;">Inward Labour (Items Received)</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Inward No.</th>
                  <th>Customer</th>
                  <th>Item</th>
                  <th>Packing</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Labour Rate</th>
                  <th class="text-right">Labour Cost</th>
                </tr>
              </thead>
              <tbody>
                ${labourData.inwardData.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.number}</td>
                    <td>${item.customer}</td>
                    <td>${item.item}</td>
                    <td>${item.packing}</td>
                    <td class="text-right">${item.quantity.toLocaleString('en-IN')}</td>
                    <td class="text-right">${item.labourRate.toFixed(2)}</td>
                    <td class="text-right">${item.labourCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="7" class="text-right"><strong>Inward Labour Total:</strong></td>
                  <td class="text-right">${labourData.inwardTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          ` : '<p>No inward records for this date.</p>'}

          ${labourData.outwardData.length > 0 ? `
            <div class="section-title">
              <h3 style="margin: 0; text-align: left;">Outward Labour (Items Dispatched)</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Outward No.</th>
                  <th>Inward No.</th>
                  <th>Customer</th>
                  <th>Item</th>
                  <th class="text-right">Quantity</th>
                  <th class="text-right">Labour Rate</th>
                  <th class="text-right">Labour Cost</th>
                </tr>
              </thead>
              <tbody>
                ${labourData.outwardData.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.number}</td>
                    <td>${item.inwardNumber}</td>
                    <td>${item.customer}</td>
                    <td>${item.item}</td>
                    <td class="text-right">${item.quantity.toLocaleString('en-IN')}</td>
                    <td class="text-right">${item.labourRate.toFixed(2)}</td>
                    <td class="text-right">${item.labourCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="7" class="text-right"><strong>Outward Labour Total:</strong></td>
                  <td class="text-right">${labourData.outwardTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          ` : '<p>No outward records for this date.</p>'}

          <table>
            <tr class="grand-total">
              <td class="text-right" style="width: 85%;"><strong>GRAND TOTAL LABOUR COST:</strong></td>
              <td class="text-right" style="width: 15%;"><strong>Rs. ${labourData.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
            </tr>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-muted/40 px-6">
        <div className="flex items-center gap-3 w-full"></div>
        <DarkModeToggle />
        <Button onClick={() => signOut()} type="submit">
          Sign Out
        </Button>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="flex items-center justify-between pt-3 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Daily Labour Bill
          </h1>
        </div>

        {/* Search Section */}
        <div className="mb-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </h3>
          <div className="flex items-center gap-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-64"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
            {labourData && (
              <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print Bill
              </Button>
            )}
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {/* Results */}
        {labourData && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800 mb-2">
                  <MonitorDown className="h-5 w-5" />
                  <h4 className="font-semibold">Inward Labour</h4>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  Rs. {labourData.inwardTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-blue-600">{labourData.inwardData.length} record(s)</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-orange-800 mb-2">
                  <MonitorUp className="h-5 w-5" />
                  <h4 className="font-semibold">Outward Labour</h4>
                </div>
                <p className="text-2xl font-bold text-orange-900">
                  Rs. {labourData.outwardTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-orange-600">{labourData.outwardData.length} record(s)</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Grand Total</h4>
                <p className="text-2xl font-bold text-green-900">
                  Rs. {labourData.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-green-600">
                  {labourData.inwardData.length + labourData.outwardData.length} total record(s)
                </p>
              </div>
            </div>

            {/* Inward Table */}
            {labourData.inwardData.length > 0 && (
              <div className="bg-card shadow rounded-lg overflow-hidden border">
                <div className="px-6 py-4 border-b bg-blue-500/10 dark:bg-blue-500/5">
                  <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                    <MonitorDown className="h-5 w-5" />
                    Inward Labour - {formatDate(labourData.searchDate)}
                  </h3>
                  <p className="text-sm text-blue-600 mt-1">Items received on this date</p>
                </div>
                <div className="px-6 py-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>S.No</TableHead>
                        <TableHead>Inward No.</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Packing</TableHead>
                        <TableHead>Weight (Kg)</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Labour Rate</TableHead>
                        <TableHead className="text-right">Labour Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {labourData.inwardData.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{item.number}</TableCell>
                          <TableCell>{item.customer}</TableCell>
                          <TableCell>{item.item}</TableCell>
                          <TableCell>{item.packing}</TableCell>
                          <TableCell>{item.weight}</TableCell>
                          <TableCell className="text-right">{item.quantity.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right">{item.labourRate.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {item.labourCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-blue-100">
                        <TableCell colSpan={8} className="text-right font-bold">
                          Inward Total:
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-900">
                          Rs. {labourData.inwardTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Outward Table */}
            {labourData.outwardData.length > 0 && (
              <div className="bg-card shadow rounded-lg overflow-hidden border">
                <div className="px-6 py-4 border-b bg-orange-500/10 dark:bg-orange-500/5">
                  <h3 className="text-xl font-semibold text-orange-900 flex items-center gap-2">
                    <MonitorUp className="h-5 w-5" />
                    Outward Labour - {formatDate(labourData.searchDate)}
                  </h3>
                  <p className="text-sm text-orange-600 mt-1">Items dispatched on this date</p>
                </div>
                <div className="px-6 py-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>S.No</TableHead>
                        <TableHead>Outward No.</TableHead>
                        <TableHead>Inward No.</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Labour Rate</TableHead>
                        <TableHead className="text-right">Labour Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {labourData.outwardData.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{item.number}</TableCell>
                          <TableCell>{item.inwardNumber}</TableCell>
                          <TableCell>{item.customer}</TableCell>
                          <TableCell>{item.item}</TableCell>
                          <TableCell className="text-right">{item.quantity.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right">{item.labourRate.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {item.labourCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-orange-100">
                        <TableCell colSpan={7} className="text-right font-bold">
                          Outward Total:
                        </TableCell>
                        <TableCell className="text-right font-bold text-orange-900">
                          Rs. {labourData.outwardTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* No Data Messages */}
            {labourData.inwardData.length === 0 && labourData.outwardData.length === 0 && (
              <div className="text-center py-12 bg-muted/50 rounded-lg">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground">No Records Found</h3>
                <p className="text-muted-foreground mt-2">
                  No inward or outward records found for {formatDate(labourData.searchDate)}
                </p>
              </div>
            )}

            {/* Formula Note */}
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                <strong>Formula:</strong> Labour Cost = Quantity × (Labour Rate ÷ 2)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabourBillPage;