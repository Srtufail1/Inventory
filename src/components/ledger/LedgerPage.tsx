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
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const doc = printWindow.document;

    // Title (textContent — never parsed as HTML)
    doc.title = `Ledger - ${customerName} (Inward: ${inumber})`;

    // Stylesheet (static — no user data)
    const style = doc.createElement("style");
    style.textContent = [
      "body { font-family: sans-serif; padding: 24px; color: #000; }",
      "h2 { font-size: 18px; margin-bottom: 8px; }",
      "h3 { font-size: 14px; margin: 16px 0 6px; color: #333; }",
      "table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }",
      "th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; vertical-align: top; }",
      "th { background: #f0f0f0; font-weight: 600; }",
      "tr:nth-child(even) td { background: #fafafa; }",
      "@media print { body { padding: 0; } }",
    ].join(" ");
    doc.head.appendChild(style);

    // Helper: append text that may contain \n → split into text nodes + <br>
    const appendText = (el: HTMLElement, text: string) => {
      text.split("\n").forEach((line, i, arr) => {
        el.appendChild(doc.createTextNode(line));
        if (i < arr.length - 1) el.appendChild(doc.createElement("br"));
      });
    };

    // Helper: build a <table> from headers + row data using only DOM APIs
    const makeTable = (headers: string[], rows: string[][]): HTMLTableElement => {
      const tbl = doc.createElement("table");
      const thead = tbl.createTHead();
      const hRow = thead.insertRow();
      headers.forEach((h) => {
        const th = doc.createElement("th");
        th.textContent = h;
        hRow.appendChild(th);
      });
      const tbody = tbl.createTBody();
      rows.forEach((rowData) => {
        const tr = tbody.insertRow();
        rowData.forEach((cell) => {
          const td = tr.insertCell();
          td.textContent = cell;
        });
      });
      return tbl;
    };

    // Page heading
    const h2 = doc.createElement("h2");
    h2.textContent = `Ledger — ${customerName} | Inward Number: ${inumber}`;
    doc.body.appendChild(h2);

    // Date range note
    if (printFromDate || printToDate) {
      const p = doc.createElement("p");
      p.style.cssText = "font-size:12px;color:#555;margin-bottom:8px;";
      p.textContent = `Date range: ${printFromDate || "—"} to ${printToDate || "—"}`;
      doc.body.appendChild(p);
    }

    // Customer details section
    const matchedCustomer = customerDetails.find((d) => d.inumber === inumber);
    if (matchedCustomer) {
      const h3 = doc.createElement("h3");
      h3.textContent = "Customer Details";
      doc.body.appendChild(h3);
      doc.body.appendChild(
        makeTable(
          ["Customer", "Inward Number", "Item", "Packing", "Weight (Kg)", "Quantity", "Remaining Quantity"],
          [[
            matchedCustomer.customer,
            matchedCustomer.inumber,
            matchedCustomer.item,
            matchedCustomer.packing,
            matchedCustomer.weight,
            String(matchedCustomer.quantity),
            String(matchedCustomer.remaining_quantity),
          ]]
        )
      );
    }

    // Labor section
    const matchedLabor = laborData.find((l) => l.inumber === inumber);
    if (matchedLabor) {
      const h3 = doc.createElement("h3");
      h3.textContent = "Labor Details";
      doc.body.appendChild(h3);
      doc.body.appendChild(
        makeTable(
          ["Add Date", "Inward Number", "Quantity", "Labour Rate", "Labour Amount", "Due Date"],
          [[
            matchedLabor.addDate,
            matchedLabor.inumber,
            String(matchedLabor.quantity),
            String(matchedLabor.labourRate),
            String(matchedLabor.labourAmount),
            matchedLabor.dueDate,
          ]]
        )
      );
    }

    // Ledger table
    const ledgerH3 = doc.createElement("h3");
    ledgerH3.textContent = "Ledger";
    doc.body.appendChild(ledgerH3);

    const headers = columns
      .map((col) => {
        if (typeof col.header === "string") return col.header;
        return (col as { accessorKey?: string }).accessorKey ?? "";
      })
      .filter(Boolean);

    const tbl = doc.createElement("table");
    const thead = tbl.createTHead();
    const hRow = thead.insertRow();
    headers.forEach((h) => {
      const th = doc.createElement("th");
      th.textContent = h;
      hRow.appendChild(th);
    });

    const tbody = tbl.createTBody();
    table.getSortedRowModel().rows.forEach((row) => {
      const tr = tbody.insertRow();
      row.getVisibleCells().forEach((cell) => {
        const td = tr.insertCell();
        const val = cell.getValue();
        if (cell.column.id === "amount") {
          const amount = Number(val);
          td.style.color = amount < 0 ? "red" : "green";
          td.textContent = String(val);
        } else {
          appendText(td, val !== null && val !== undefined ? String(val) : "");
        }
      });
    });

    doc.body.appendChild(tbl);

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