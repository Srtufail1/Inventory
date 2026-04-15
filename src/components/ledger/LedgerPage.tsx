"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { ArrowUpDown, Search, Printer } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DarkModeToggle from '../DarkModeToggle';
import LaborTable, { LaborEntry } from './LaborTable';
import { useCustomers } from '@/context/CustomersContext';

type LedgerEntry = {
  inwardOut: string;
  outDate_table: string;
  outQuantity: string;
  dates: string;
  quantity: string;
  nextPeriodQuantity: string;
  storeRate: string;
  amount: number;
  amountReceived: string;
  dateReceived: string;
};

type LedgerDataSet = {
  inumber: string;
  ledgerData: LedgerEntry[];
};

const columns: ColumnDef<LedgerEntry>[] = [
  {
    accessorKey: "inwardOut",
    header: "Inward/Out",
    cell: ({ row }) => {
      const inwardOut = row.getValue("inwardOut") as string;
      return (
        <div style={{ whiteSpace: 'pre-line' }}>
          {inwardOut}
        </div>
      );
    },
  },
  {
    accessorKey: "outDate_table",
    header: "Out Date - Out Quantity",
    cell: ({ row }) => {
      const outDateQuantity = row.getValue("outDate_table") as string;
      return (
        <div style={{ whiteSpace: 'pre-line' }}>
          {outDateQuantity}
        </div>
      );
    },

  },
  {
    accessorKey: "outQuantity",
    header: "Total Out Quantity",
  },
  {
    accessorKey: "dates",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dates (From - To)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "quantity",
    header: "Stored Quantity",
  },
  {
    accessorKey: "storeRate",
    header: "Store Rate",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return <div style={{ color: amount < 0 ? 'red' : 'green' }}>{amount}</div>;
    },
  },
  // {
  //   accessorKey: "amountReceived",
  //   header: "Amount Received",
  // },
  // {
  //   accessorKey: "dateReceived",
  //   header: "Date Received",
  // },
];

type CustomerDetail = {
  inumber: string;
  addDate: string;
  customer: string;
  item: string;
  packing: string;
  weight: string;
  quantity: string;
  remaining_quantity: string;
};

const CustomerDetailsTable = ({ details }: { details: CustomerDetail[] }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold mb-2">Customer Details</h2>
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Inward Number</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Packing</TableHead>
            <TableHead>Weight (Kg)</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Remaining Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {details.map((detail, index) => (
            <TableRow key={index}>
              <TableCell>{detail.customer}</TableCell>
              <TableCell>{detail.inumber}</TableCell>
              <TableCell>{detail.item}</TableCell>
              <TableCell>{detail.packing}</TableCell>
              <TableCell>{detail.weight}</TableCell>
              <TableCell>{detail.quantity}</TableCell>
              <TableCell>{detail.remaining_quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

// New component for individual Ledger tables
const LedgerTable = ({
  data,
  inumber,
  customerName,
  customerDetails,
  laborData,
}: {
  data: LedgerEntry[];
  inumber: string;
  customerName: string;
  customerDetails: CustomerDetail[];
  laborData: LaborEntry[];
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [printFromDate, setPrintFromDate] = useState("");
  const [printToDate, setPrintToDate] = useState("");

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  // Parse "DD.MM.YY" into a Date for range comparison
  const parseDotDate = (dateStr: string): Date | null => {
    const parts = dateStr.trim().split(".");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    return new Date(`20${year}-${month}-${day}`);
  };

  // Filter rows by the selected date range (based on the start of the "dates" field)
  const filteredData = useMemo(() => data.filter((entry) => {
    if (!printFromDate && !printToDate) return true;
    const startStr = entry.dates.split(" - ")[0];
    const startDate = parseDotDate(startStr);
    if (!startDate) return true;
    if (printFromDate && startDate < new Date(printFromDate)) return false;
    if (printToDate && startDate > new Date(printToDate)) return false;
    return true;
  }), [data, printFromDate, printToDate]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  const handlePrint = () => {
    const allRows = table.getSortedRowModel().rows;
    const headers = columns
      .map((col) => {
        if (typeof col.header === "string") return col.header;
        const key = (col as { accessorKey?: string }).accessorKey;
        return key ?? "";
      })
      .filter(Boolean);

    const headerHTML = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");

    const rowsHTML = allRows
      .map((row) => {
        const cells = row.getVisibleCells().map((cell) => {
          const val = cell.getValue();
          const amount = cell.column.id === "amount" ? Number(val) : null;
          const style =
            amount !== null
              ? `style="color:${amount < 0 ? "red" : "green"}"`
              : "";
          const text =
            val !== null && val !== undefined
              ? escapeHtml(String(val)).replace(/\n/g, "<br/>")
              : "";
          return `<td ${style}>${text}</td>`;
        });
        return `<tr>${cells.join("")}</tr>`;
      })
      .join("");

    // Customer detail for this inward number
    const matchedCustomer = customerDetails.find((d) => d.inumber === inumber);
    const customerSectionHTML = matchedCustomer
      ? `
        <h3>Customer Details</h3>
        <table>
          <thead>
            <tr>
              <th>Customer</th><th>Inward Number</th><th>Item</th>
              <th>Packing</th><th>Weight (Kg)</th><th>Quantity</th><th>Remaining Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${escapeHtml(matchedCustomer.customer)}</td>
              <td>${escapeHtml(matchedCustomer.inumber)}</td>
              <td>${escapeHtml(matchedCustomer.item)}</td>
              <td>${escapeHtml(matchedCustomer.packing)}</td>
              <td>${escapeHtml(matchedCustomer.weight)}</td>
              <td>${escapeHtml(String(matchedCustomer.quantity))}</td>
              <td>${escapeHtml(String(matchedCustomer.remaining_quantity))}</td>
            </tr>
          </tbody>
        </table>`
      : "";

    // Labor entry for this inward number
    const matchedLabor = laborData.find((l) => l.inumber === inumber);
    const laborSectionHTML = matchedLabor
      ? `
        <h3>Labor Details</h3>
        <table>
          <thead>
            <tr>
              <th>Add Date</th><th>Inward Number</th><th>Quantity</th>
              <th>Labour Rate</th><th>Labour Amount</th><th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${escapeHtml(matchedLabor.addDate)}</td>
              <td>${escapeHtml(matchedLabor.inumber)}</td>
              <td>${escapeHtml(String(matchedLabor.quantity))}</td>
              <td>${escapeHtml(String(matchedLabor.labourRate))}</td>
              <td>${escapeHtml(String(matchedLabor.labourAmount))}</td>
              <td>${escapeHtml(matchedLabor.dueDate)}</td>
            </tr>
          </tbody>
        </table>`
      : "";

    const dateRangeLabel =
      printFromDate || printToDate
        ? `<p style="font-size:12px;color:#555;margin-bottom:8px;">
            Date range: ${printFromDate || "—"} to ${printToDate || "—"}
           </p>`
        : "";

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const safeCustomerName = escapeHtml(customerName);
    const safeInumber = escapeHtml(inumber);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ledger - ${safeCustomerName} (Inward: ${safeInumber})</title>
          <style>
            body { font-family: sans-serif; padding: 24px; color: #000; }
            h2 { font-size: 18px; margin-bottom: 8px; }
            h3 { font-size: 14px; margin: 16px 0 6px; color: #333; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }
            th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; vertical-align: top; }
            th { background: #f0f0f0; font-weight: 600; }
            tr:nth-child(even) td { background: #fafafa; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h2>Ledger — ${safeCustomerName} &nbsp;|&nbsp; Inward Number: ${safeInumber}</h2>
          ${dateRangeLabel}
          ${customerSectionHTML}
          ${laborSectionHTML}
          <h3>Ledger</h3>
          <table>
            <thead><tr>${headerHTML}</tr></thead>
            <tbody>${rowsHTML}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Ledger Table (Inward Number: {inumber})</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">Date range:</label>
          <input
            type="date"
            value={printFromDate}
            onChange={(e) => setPrintFromDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            title="From date"
          />
          <span className="text-sm text-muted-foreground">—</span>
          <input
            type="date"
            value={printToDate}
            onChange={(e) => setPrintToDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            title="To date"
          />
          <Button variant="outline" size="sm" onClick={handlePrint} title="Print as PDF">
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-5">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

const LedgerPage = () => {
  const [dataSets, setDataSets] = useState<LedgerDataSet[]>([]);
  const [laborData, setLaborData] = useState<LaborEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [inwardNumber, setInwardNumber] = useState(""); // New state for inward number
  const [isLoading, setIsLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetail[]>([]);
  const { customers, loading } = useCustomers();
  const [filteredCustomers, setFilteredCustomers] = useState<string[]>([]);
  const [hasSelected, setHasSelected] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

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

  const handleSearch = async () => {
    if (searchTerm.trim() === "") return;

    setIsLoading(true);
    try {
      let url = `/api/ledger?customer=${encodeURIComponent(searchTerm)}`;
      if (inwardNumber.trim() !== "") {
        url += `&inward=${encodeURIComponent(inwardNumber)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setDataSets(result.ledgerDataSets);
      setLaborData(result.laborTable);
      setCustomerDetails(result.customerDetails);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-muted/40 px-6">
        <div className="w-full"></div>
        <DarkModeToggle />
        <Button onClick={() => signOut()} type="submit">
          Sign Out
        </Button>
      </div>
      <div className="p-6">
        <div className="flex item justify-between pt-3 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Ledger
          </h1>
        </div>
        <div className="relative w-full flex items-center">
          <div className="relative w-1/4 mr-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              placeholder="Search customer name..."
              value={searchTerm}
              onChange={handleInputChange}
              className="pl-8"
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
          <Input
            placeholder="Inward number (optional)"
            value={inwardNumber}
            onChange={(e) => setInwardNumber(e.target.value)}
            className="w-1/4 mr-2"
          />
          <Button onClick={handleSearch} disabled={isLoading} className="ml-2">
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
        <div className="pb-6"></div>
        {customerDetails.length > 0 && <CustomerDetailsTable details={customerDetails} />}
        {laborData.length > 0 && <LaborTable data={laborData} />}
        {dataSets.map((dataSet) => (
          <LedgerTable key={dataSet.inumber} data={dataSet.ledgerData} inumber={dataSet.inumber} customerName={searchTerm} customerDetails={customerDetails} laborData={laborData} />
        ))}
      </div>
    </div>
  );
};

export default LedgerPage;