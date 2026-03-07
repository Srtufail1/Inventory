"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  ExpandedState,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronRight, Search, StickyNote } from "lucide-react";
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
import { OutwardDataProps } from "@/lib/interface";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { signOut } from "next-auth/react";
import OutwardData from "../outward/OutwardData";
import OutwardUpdate from "../outward/OutwardUpdate";
import ExpandableNoteRow from "./ExpandableNoteRow";
import { format, isWithinInterval } from 'date-fns';
import DarkModeToggle from '../DarkModeToggle';
import { FaCalendarAlt } from 'react-icons/fa';
import { useCustomers } from '@/context/CustomersContext';
import { useItems } from '@/context/ItemsContext';

// Extended type to include notes
type OutwardRowData = OutwardDataProps[number] & {
  notes?: string | null;
  clients?: any[];
};

const dateRangeFilter: FilterFn<OutwardRowData> = (row, columnId, filterValue) => {
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

export const columns: ColumnDef<OutwardRowData>[] = [
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
        onClick={(e) => e.stopPropagation()}
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
    accessorKey: "onumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Out Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="pl-8">
        {row.getValue("onumber")}
      </div>
    ),
  },
  {
    accessorKey: "outDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Out Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("outDate");

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
          <FaCalendarAlt className="mr-2 text-muted-foreground" />
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
      <div className="pl-8">
        {row.getValue("quantity")}
      </div>
    ),
  },
  {
    id: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const hasNotes = !!row.original.notes;
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            row.toggleExpanded();
          }}
          className="flex items-center gap-1 p-1 rounded hover:bg-muted transition-colors"
          title={hasNotes ? "View/edit notes" : "Add notes"}
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          {hasNotes && (
            <StickyNote className="h-3.5 w-3.5 text-amber-500 fill-amber-200 dark:fill-amber-800" />
          )}
        </button>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <OutwardUpdate row={row} />,
  },
];

const OutwardTable = ({ data }: any) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(0);

  // Autocomplete for search filters
  const { customers } = useCustomers();
  const { items: allItems } = useItems();

  const [customerFilterValue, setCustomerFilterValue] = React.useState('');
  const [customerSuggestions, setCustomerSuggestions] = React.useState<string[]>([]);
  const [customerSelected, setCustomerSelected] = React.useState(false);

  const [itemFilterValue, setItemFilterValue] = React.useState('');
  const [itemSuggestions, setItemSuggestions] = React.useState<string[]>([]);
  const [itemSelected, setItemSelected] = React.useState(false);

  // Local state to track notes updates without full page reload
  const [localData, setLocalData] = React.useState<OutwardRowData[]>(data);
  React.useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleNotesSaved = (id: string, notes: string | null) => {
    setLocalData((prev: OutwardRowData[]) =>
      prev.map((item: OutwardRowData) =>
        item.id === id ? { ...item, notes } : item
      )
    );
  };

  const table = useReactTable({
    data: localData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function'
        ? updater({ pageIndex, pageSize })
        : updater;
      setPageIndex(newPagination.pageIndex);
      setPageSize(newPagination.pageSize);
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      expanded,
      rowSelection,
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    filterFns: {
      dateRange: dateRangeFilter,
    },
  });

  React.useEffect(() => {
    if (startDate && endDate) {
      table.getColumn('outDate')?.setFilterValue({ startDate, endDate });
    } else {
      table.getColumn('outDate')?.setFilterValue(undefined);
    }
  }, [startDate, endDate, table]);

  React.useEffect(() => {
    if (!customerFilterValue || customerSelected) { setCustomerSuggestions([]); return; }
    setCustomerSuggestions(customers.filter(c => c.toLowerCase().includes(customerFilterValue.toLowerCase())));
  }, [customerFilterValue, customers, customerSelected]);

  React.useEffect(() => {
    if (!itemFilterValue || itemSelected) { setItemSuggestions([]); return; }
    setItemSuggestions(allItems.filter(i => i.toLowerCase().includes(itemFilterValue.toLowerCase())));
  }, [itemFilterValue, allItems, itemSelected]);

  return (
    <div>
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-muted/40 px-6">
        <div className="flex items-center gap-3 w-full">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Inward Number..."
              value={(table?.getColumn("inumber")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table?.getColumn("inumber")?.setFilterValue(event?.target?.value)}
              className="pl-8 h-10 w-52 text-sm"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Outward Number..."
              value={(table?.getColumn("onumber")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table?.getColumn("onumber")?.setFilterValue(event?.target?.value)}
              className="pl-8 h-10 w-52 text-sm"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Customer..."
              value={customerFilterValue}
              onChange={(event) => {
                const val = event.target.value;
                setCustomerFilterValue(val);
                setCustomerSelected(false);
                table?.getColumn("customer")?.setFilterValue(val);
              }}
              className="pl-8 h-10 w-52 text-sm"
            />
            {customerSuggestions.length > 0 && (
              <ul className="absolute z-20 w-48 bg-popover border mt-1 max-h-48 overflow-auto rounded-md shadow-md">
                {customerSuggestions.map((customer, index) => (
                  <li
                    key={index}
                    className="px-3 py-1.5 hover:bg-muted cursor-pointer text-popover-foreground text-sm"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setCustomerFilterValue(customer);
                      setCustomerSelected(true);
                      table?.getColumn("customer")?.setFilterValue(customer);
                    }}
                  >
                    {customer}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Item..."
              value={itemFilterValue}
              onChange={(event) => {
                const val = event.target.value;
                setItemFilterValue(val);
                setItemSelected(false);
                table?.getColumn("item")?.setFilterValue(val);
              }}
              className="pl-8 h-10 w-52 text-sm"
            />
            {itemSuggestions.length > 0 && (
              <ul className="absolute z-20 w-48 bg-popover border mt-1 max-h-48 overflow-auto rounded-md shadow-md">
                {itemSuggestions.map((item, index) => (
                  <li
                    key={index}
                    className="px-3 py-1.5 hover:bg-muted cursor-pointer text-popover-foreground text-sm"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setItemFilterValue(item);
                      setItemSelected(true);
                      table?.getColumn("item")?.setFilterValue(item);
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update: [Date | null, Date | null]) => {
              setDateRange(update);
            }}
            placeholderText="Select Date range..."
            className="h-10 w-44 rounded-md border border-input bg-background px-2.5 text-sm placeholder:text-muted-foreground focus:outline-none"
            dateFormat="dd MMM yyyy"
            isClearable={true}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 shrink-0">
                Columns <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
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
          <DarkModeToggle />
          <Button onClick={() => signOut()} type="submit">
            Sign Out
          </Button>
      </div>
      <div className="p-6">
        <div className="flex item justify-between pt-3 pb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Outward Gate Pass
            </h1>
          </div>
          <OutwardData title="Add Outward Data" data={{}} />
        </div>
        <div>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="whitespace-nowrap">
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
                    <React.Fragment key={row.id}>
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                        className={
                          row.getIsSelected()
                            ? "bg-blue-50 dark:bg-blue-950/40"
                            : row.getIsExpanded()
                              ? "border-b-0 bg-amber-50/30 dark:bg-amber-950/10"
                              : row.index % 2 === 1
                                ? "bg-muted/30"
                                : undefined
                        }
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
                      {/* Expanded note row */}
                      {row.getIsExpanded() && (
                        <TableRow className="hover:bg-transparent">
                          <ExpandableNoteRow
                            outwardId={row.original.id}
                            onumber={row.original.onumber}
                            notes={row.original.notes || null}
                            colSpan={row.getVisibleCells().length}
                            onNotesSaved={handleNotesSaved}
                            onCollapse={() => row.toggleExpanded()}
                          />
                        </TableRow>
                      )}
                    </React.Fragment>
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
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{table.getFilteredRowModel().rows.length} row(s) total</span>
              {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {table.getFilteredSelectedRowModel().rows.length} selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <select
                  value={pageSize === data.length ? 100000000 : pageSize}
                  onChange={e => {
                    const newSize = Number(e.target.value);
                    setPageSize(newSize === 100000000 ? data.length : newSize);
                    setPageIndex(0);
                  }}
                  className="h-8 rounded-md border px-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {[10, 20, 50, 100, 500, 1000, 100000000].map(size => (
                    <option key={size} value={size}>
                      {size === 100000000 ? 'All' : size}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-sm text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
              <div className="flex items-center gap-2">
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
    </div>
  );
};

export default OutwardTable;
