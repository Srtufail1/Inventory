"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Search } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InwardDataProps } from "@/lib/interface";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { signOut } from "next-auth/react";
import InwardData from "../inward/InwardData";
import InwardUpdate from "../inward/InwardUpdate";
import { format, isWithinInterval } from 'date-fns';
import DarkModeToggle from '../DarkModeToggle'
import { FaCalendarAlt } from 'react-icons/fa';

const dateRangeFilter: FilterFn<InwardDataProps> = (row, columnId, filterValue) => {
  if (!filterValue.startDate || !filterValue.endDate) return true;
  const cellValue = row.getValue(columnId);
  
  let dateObject: Date;
  if (typeof cellValue === 'string') {
    dateObject = new Date(cellValue);
  } else if (cellValue instanceof Date) {
    dateObject = cellValue;
  } else {
    return false;
  }

  if (isNaN(dateObject.getTime())) {
    return false;
  }

  return isWithinInterval(dateObject, { start: filterValue.startDate, end: filterValue.endDate });
};

export const columns: ColumnDef<InwardDataProps>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "inumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          In Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="pl-8">
        {row.getValue("inumber")}
      </div>
    ),
  },
  {
    accessorKey: "addDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          In Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("addDate");
      
      // Check if date is valid
      if (!date || typeof date !== 'string' && !(date instanceof Date)) {
        return <div>Invalid Date</div>;
      }
      
      // Try to create a valid Date object
      const dateObject = typeof date === 'string' ? new Date(date) : date;
      
      // Check if the created Date object is valid
      if (isNaN(dateObject.getTime())) {
        return <div>Invalid Date</div>;
      }
      
      // Format the date
      const formattedDate = format(dateObject, 'dd MMM yyyy');
      
      return (
        <div className="flex items-center">
          <FaCalendarAlt className="mr-2 text-gray-500" />
          <div className="capitalize">{formattedDate}</div>
        </div>
      );
    },
    filterFn: dateRangeFilter,
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("customer")}</div>
    ),
  },
  {
    accessorKey: "item",
    header: "Item",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("item")}</div>
    ),
  },
  {
    accessorKey: "packing",
    header: "Packing",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("packing")}</div>
    ),
  },
  {
    accessorKey: "weight",
    header: "Weight (Kg)",
    cell: ({ row }) => (
      <div className="pl-4">{row.getValue("weight")}</div>
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="pl-8">{row.getValue("quantity")}</div>
    ),
  },
  {
    accessorKey: "store_rate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Store Rate (Rs.)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="pl-10">{row.getValue("store_rate")}</div>
    ),
  },
  {
    accessorKey: "labour_rate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Labour Rate (Rs.)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="pl-12">{row.getValue("labour_rate")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <InwardUpdate row={row} />,
  },
];

const InwardTable = ({ data }: any) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [pageSize, setPageSize] = React.useState(10);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageSize,
        pageIndex: 0,
      },
    },
    filterFns: {
      dateRange: dateRangeFilter,
    },
  });

  React.useEffect(() => {
    table.setPageSize(pageSize);
  }, [pageSize, table]);

  React.useEffect(() => {
    if (startDate && endDate) {
      table.getColumn('addDate')?.setFilterValue({ startDate, endDate });
    } else { 
      table.getColumn('addDate')?.setFilterValue(undefined);
    }
  }, [startDate, endDate]);

  return (
    <div>
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-gray-100/40 px-6">
        <div className="flex items-center gap-3 w-full">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Inward Number..."
              value={(table?.getColumn("inumber")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table?.getColumn("inumber")?.setFilterValue(event?.target?.value)}
              className="pl-8 max-w-sm outline-none focus:outline-none"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Customer..."
              value={(table?.getColumn("customer")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table?.getColumn("customer")?.setFilterValue(event?.target?.value)}
              className="pl-8 max-w-sm outline-none focus:outline-none"
            />
          </div>

          <div className="relative">
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update: [Date | null, Date | null]) => {
                setDateRange(update);
              }}
              placeholderText="Select date range"
              className="px-3 py-2 border rounded"
              dateFormat="dd MMM yyyy"
              isClearable={true}
            />
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <DarkModeToggle />
        <Button onClick={() => signOut()} type="submit">
          Sign Out
        </Button>
      </div>
      <div className="p-6">
        <div className="flex item justify-between pt-3 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Inward Gate Pass
          </h1>
          <InwardData title="Add Inward Data" data={{}} />
        </div>
        <div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
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
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select
                value={pageSize === data.length ? 100000000 : pageSize}
                onChange={e => {
                  const newSize = Number(e.target.value);
                  setPageSize(newSize === 100000000 ? data.length : newSize);
                }}
                className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                {[10, 20, 50, 100, 500, 1000, 100000000].map(size => (
                  <option key={size} value={size}>
                    {size === 100000000 ? 'All' : size}
                  </option>
                ))}
              </select>
            </div>
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
      </div>
    </div>
  );
};

export default InwardTable;