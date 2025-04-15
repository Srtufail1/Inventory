"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { ArrowUpDown, Search } from "lucide-react";
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
    header: "Out Date",
    cell: ({ row }) => {
      const inwardOut = row.getValue("outDate_table") as string;
      return (
        <div style={{ whiteSpace: 'pre-line' }}>
          {inwardOut}
        </div>
      );
    },

  },
  {
    accessorKey: "outQuantity",
    header: "Out Quantity",
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
  {
    accessorKey: "amountReceived",
    header: "Amount Received",
  },
  {
    accessorKey: "dateReceived",
    header: "Date Received",
  },
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
const LedgerTable = ({ data, inumber }: { data: LedgerEntry[], inumber: string }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Ledger Table (Inward Number: {inumber})</h2>
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
  const [dataSets, setDataSets] = React.useState<LedgerDataSet[]>([]);
  const [laborData, setLaborData] = React.useState<LaborEntry[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [customerDetails, setCustomerDetails] = React.useState<CustomerDetail[]>([]);

  const handleSearch = async () => {
    if (searchTerm.trim() === "") return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/ledger?customer=${encodeURIComponent(searchTerm)}`);
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
            Ledger
          </h1>
        </div>
        <div className="relative max-w-sm w-full flex items-center">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 max-w-sm"
          />
          <Button onClick={handleSearch} disabled={isLoading} className="ml-2">
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      <div className="pb-6"></div>
      {customerDetails.length > 0 && <CustomerDetailsTable details={customerDetails} />}
      {laborData.length > 0 && <LaborTable data={laborData} />}
        {dataSets.map((dataSet) => (
          <LedgerTable key={dataSet.inumber} data={dataSet.ledgerData} inumber={dataSet.inumber} />
        ))}
      </div>
    </div>
  );
};

export default LedgerPage;