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
import { ArrowUpDown, ChevronDown, ChevronRight, Search, StickyNote, MonitorDown, SlidersHorizontal } from "lucide-react";
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
import InwardData from "../inward/InwardData";
import InwardUpdate from "../inward/InwardUpdate";
import ExpandableNoteRow from "./ExpandableNoteRow";
import { format, isWithinInterval } from 'date-fns';
import DarkModeToggle from '../DarkModeToggle';
import { ToolbarActions, SignOutButton } from '@/components/PageToolbar';
import { FaCalendarAlt } from 'react-icons/fa';
import { useCustomers } from '@/context/CustomersContext';
import { useItems } from '@/context/ItemsContext';
import { usePackings } from '@/context/PackingsContext';

// Extended type to include notes
type InwardRowData = InwardDataProps[number] & {
  notes?: string | null;
  clients?: any[];
};

const dateRangeFilter: FilterFn<InwardRowData> = (row, columnId, filterValue) => {
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

export const columns: ColumnDef<InwardRowData>[] = [
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
    cell: ({ row }) => <div className="text-center tabular-nums">{row.getValue("inumber")}</div>,
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
    accessorKey: "packing",
    header: "Packing",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("packing")}</div>
    ),
  },
  {
    accessorKey: "weight",
    header: "Weight (Kg)",
    cell: ({ row }) => <div className="text-center tabular-nums">{row.getValue("weight")}</div>,
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
    cell: ({ row }) => <div className="text-center tabular-nums">{row.getValue("quantity")}</div>,
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
    cell: ({ row }) => <div className="text-center tabular-nums">{row.getValue("store_rate")}</div>,
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
    cell: ({ row }) => <div className="text-center tabular-nums">{row.getValue("labour_rate")}</div>,
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
    cell: ({ row }) => <InwardUpdate row={row} />,
  },
];

const InwardTable = ({ data }: any) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  // Autocomplete for search filters
  const { customers } = useCustomers();
  const { items: allItems } = useItems();
  const { packings: allPackings } = usePackings();

  const [customerFilterValue, setCustomerFilterValue] = React.useState('');
  const [customerSuggestions, setCustomerSuggestions] = React.useState<string[]>([]);
  const [customerSelected, setCustomerSelected] = React.useState(false);

  const [itemFilterValue, setItemFilterValue] = React.useState('');
  const [itemSuggestions, setItemSuggestions] = React.useState<string[]>([]);
  const [itemSelected, setItemSelected] = React.useState(false);

  const [packingFilterValue, setPackingFilterValue] = React.useState('');
  const [packingSuggestions, setPackingSuggestions] = React.useState<string[]>([]);
  const [packingSelected, setPackingSelected] = React.useState(false);

  // Local state to track notes updates without full page reload
  const [localData, setLocalData] = React.useState<InwardRowData[]>(data);
  React.useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleNotesSaved = (id: string, notes: string | null) => {
    setLocalData((prev: InwardRowData[]) =>
      prev.map((item: InwardRowData) =>
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
      table.getColumn('addDate')?.setFilterValue({ startDate, endDate });
    } else {
      table.getColumn('addDate')?.setFilterValue(undefined);
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

  React.useEffect(() => {
    if (!packingFilterValue || packingSelected) { setPackingSuggestions([]); return; }
    setPackingSuggestions(allPackings.filter(p => p.toLowerCase().includes(packingFilterValue.toLowerCase())));
  }, [packingFilterValue, allPackings, packingSelected]);

  return (
    <div>
      <div className="app-filterbar">
        <div className="flex w-full items-center justify-between md:hidden">
          <div>
            <p className="text-sm font-semibold">Inward records</p>
            <p className="text-xs text-muted-foreground">{table.getFilteredRowModel().rows.length} results</p>
          </div>
          <div className="flex items-center gap-1">
            <DarkModeToggle />
            <SignOutButton />
            <Button
              variant={showMobileFilters ? "secondary" : "outline"}
              size="sm"
              className="h-10 gap-2"
              onClick={() => setShowMobileFilters((visible) => !visible)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
        <div className={`${showMobileFilters ? "flex" : "hidden"} w-full min-w-0 flex-col gap-2 md:flex md:w-auto md:flex-1 md:flex-row md:flex-wrap md:items-center`}>
          <div className="relative shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Inward No."
              value={(table?.getColumn("inumber")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table?.getColumn("inumber")?.setFilterValue(event?.target?.value)}
              className="h-10 w-full pl-8 text-sm md:h-9 md:w-36"
            />
          </div>
          <div className="relative shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Customer..."
              value={customerFilterValue}
              onChange={(event) => {
                const val = event.target.value;
                setCustomerFilterValue(val);
                setCustomerSelected(false);
                table?.getColumn("customer")?.setFilterValue(val);
              }}
              className="h-10 w-full pl-8 text-sm md:h-9 md:w-36"
            />
            {customerSuggestions.length > 0 && (
              <ul className="absolute z-20 w-44 bg-popover border mt-1 max-h-48 overflow-auto rounded-md shadow-md">
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
          <div className="relative shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Item..."
              value={itemFilterValue}
              onChange={(event) => {
                const val = event.target.value;
                setItemFilterValue(val);
                setItemSelected(false);
                table?.getColumn("item")?.setFilterValue(val);
              }}
              className="h-10 w-full pl-8 text-sm md:h-9 md:w-36"
            />
            {itemSuggestions.length > 0 && (
              <ul className="absolute z-20 w-44 bg-popover border mt-1 max-h-48 overflow-auto rounded-md shadow-md">
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
          <div className="relative shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Packing..."
              value={packingFilterValue}
              onChange={(event) => {
                const val = event.target.value;
                setPackingFilterValue(val);
                setPackingSelected(false);
                table?.getColumn("packing")?.setFilterValue(val);
              }}
              className="h-10 w-full pl-8 text-sm md:h-9 md:w-36"
            />
            {packingSuggestions.length > 0 && (
              <ul className="absolute z-20 w-44 bg-popover border mt-1 max-h-48 overflow-auto rounded-md shadow-md">
                {packingSuggestions.map((packing, index) => (
                  <li
                    key={index}
                    className="px-3 py-1.5 hover:bg-muted cursor-pointer text-popover-foreground text-sm"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setPackingFilterValue(packing);
                      setPackingSelected(true);
                      table?.getColumn("packing")?.setFilterValue(packing);
                    }}
                  >
                    {packing}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative shrink-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Weight..."
              value={(table?.getColumn("weight")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table?.getColumn("weight")?.setFilterValue(event?.target?.value)}
              className="h-10 w-full pl-8 text-sm md:h-9 md:w-32"
            />
          </div>
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update: [Date | null, Date | null]) => {
              setDateRange(update);
            }}
            placeholderText="Date range..."
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none md:h-9 md:w-40"
            dateFormat="dd MMM yyyy"
            isClearable={true}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 w-full shrink-0 md:h-9 md:w-auto">
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
        <ToolbarActions className="hidden md:flex" />
      </div>
      <div className="gate-pass-shell page-shell animate-fade-in">
        <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/40">
              <MonitorDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Inward Gate Pass
              </h1>
              <p className="text-sm text-muted-foreground">Manage incoming inventory records</p>
            </div>
          </div>
          <InwardData title="Add Inward Data" data={{}} />
        </div>
        <div>
          <div className="hidden shadow-sm md:block">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-muted/50">
                    {headerGroup.headers.map((header) => {
                      const isCentered = ["inumber", "weight", "quantity", "store_rate", "labour_rate", "select", "notes", "actions"].includes(header.column.id);
                      const isCenteredSortable = ["inumber", "quantity", "store_rate", "labour_rate"].includes(header.column.id);
                      return (
                        <TableHead
                          key={header.id}
                          className={`whitespace-nowrap px-2 ${isCentered ? "text-center" : ""} ${isCenteredSortable ? "[&>button]:relative [&>button]:w-full [&>button]:justify-center [&>button]:px-5 [&>button>svg]:absolute [&>button>svg]:right-1" : ""}`}
                        >
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
                          <TableCell
                            key={cell.id}
                            className={`px-2 py-2.5 ${["inumber", "weight", "quantity", "store_rate", "labour_rate", "select", "notes", "actions"].includes(cell.column.id) ? "text-center" : ""}`}
                          >
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
                            inwardId={row.original.id}
                            inumber={row.original.inumber}
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
          <div className="space-y-3 md:hidden">
            {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => {
              const record = row.original;
              return (
                <article key={row.id} className="overflow-hidden rounded-md border bg-card shadow-sm">
                  <div className="flex items-start gap-2.5 border-b bg-muted/30 p-3">
                    <Checkbox
                      checked={row.getIsSelected()}
                      onCheckedChange={(value) => row.toggleSelected(!!value)}
                      aria-label={`Select inward ${record.inumber}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground">Inward pass</p>
                          <h2 className="font-bold text-primary">#{record.inumber}</h2>
                        </div>
                        <time className="text-xs font-medium text-muted-foreground">
                          {format(new Date(record.addDate), "dd MMM yyyy")}
                        </time>
                      </div>
                      <p className="mt-1.5 truncate text-sm font-semibold">{record.customer}</p>
                      <p className="truncate text-sm text-muted-foreground">{record.item}</p>
                    </div>
                  </div>
                  <dl className="grid grid-cols-2 gap-px bg-border">
                    <div className="bg-card p-2.5">
                      <dt className="text-[11px] uppercase text-muted-foreground">Quantity</dt>
                      <dd className="mt-1 font-semibold">{record.quantity}</dd>
                    </div>
                    <div className="bg-card p-2.5">
                      <dt className="text-[11px] uppercase text-muted-foreground">Packing / weight</dt>
                      <dd className="mt-1 truncate font-semibold">{record.packing} · {record.weight} kg</dd>
                    </div>
                    <div className="bg-card p-2.5">
                      <dt className="text-[11px] uppercase text-muted-foreground">Store rate</dt>
                      <dd className="mt-1 font-semibold">Rs. {record.store_rate || "—"}</dd>
                    </div>
                    <div className="bg-card p-2.5">
                      <dt className="text-[11px] uppercase text-muted-foreground">Labour rate</dt>
                      <dd className="mt-1 font-semibold">Rs. {record.labour_rate || "—"}</dd>
                    </div>
                  </dl>
                  <div className="flex items-center justify-between gap-2 p-2.5">
                    <button
                      className="flex min-h-10 items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                      onClick={() => row.toggleExpanded()}
                    >
                      <StickyNote className={`h-4 w-4 ${record.notes ? "text-amber-500" : ""}`} />
                      {record.notes ? "View note" : "Add note"}
                    </button>
                    <InwardUpdate row={row} />
                  </div>
                  {row.getIsExpanded() && (
                    <ExpandableNoteRow
                      inwardId={record.id}
                      inumber={record.inumber}
                      notes={record.notes || null}
                      colSpan={1}
                      asCard
                      onNotesSaved={handleNotesSaved}
                      onCollapse={() => row.toggleExpanded()}
                    />
                  )}
                </article>
              );
            }) : (
              <div className="rounded-md border bg-card p-8 text-center text-sm text-muted-foreground">No results.</div>
            )}
          </div>
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{table.getFilteredRowModel().rows.length} row(s) total</span>
              {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {table.getFilteredSelectedRowModel().rows.length} selected
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end sm:gap-6">
              <div className="hidden items-center gap-2 md:flex">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <select
                  value={pageSize === data.length ? 100000000 : pageSize}
                  onChange={e => {
                    const newSize = Number(e.target.value);
                    setPageSize(newSize === 100000000 ? data.length : newSize);
                    setPageIndex(0);
                  }}
                  className="h-8 rounded-xl border shadow-sm px-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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

export default InwardTable;