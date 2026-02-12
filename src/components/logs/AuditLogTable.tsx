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
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Search } from "lucide-react";
import { format } from "date-fns";

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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { signOut } from "next-auth/react";
import DarkModeToggle from "../DarkModeToggle";

type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  user: string;
  userName: string;
  customer: string | null;
  inumber: string | null;
  item: string | null;
  quantity: string | null;
  changes: string | null;
  createdAt: Date;
};

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  update: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  delete: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date & Time
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm">
          <div>{format(date, "dd MMM yyyy")}</div>
          <div className="text-muted-foreground text-xs">
            {format(date, "hh:mm:ss a")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
            actionColors[action] || ""
          }`}
        >
          {action}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      if (!value || value === "all") return true;
      return row.getValue(id) === value;
    },
  },
  {
    accessorKey: "entity",
    header: "Type",
    cell: ({ row }) => {
      const entity = row.getValue("entity") as string;
      return (
        <span className="capitalize font-medium">{entity}</span>
      );
    },
    filterFn: (row, id, value) => {
      if (!value || value === "all") return true;
      return row.getValue(id) === value;
    },
  },
  {
    accessorKey: "userName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        User
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("userName")}</div>
        <div className="text-xs text-muted-foreground">{row.original.user}</div>
      </div>
    ),
  },
  {
    accessorKey: "customer",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Customer
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("customer") || "—",
  },
  {
    accessorKey: "inumber",
    header: "Inward #",
    cell: ({ row }) => row.getValue("inumber") || "—",
  },
  {
    accessorKey: "item",
    header: "Item",
    cell: ({ row }) => row.getValue("item") || "—",
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => row.getValue("quantity") || "—",
  },
  {
    id: "changes",
    header: "Changes",
    cell: ({ row }) => {
      const changesStr = row.original.changes;
      if (!changesStr || row.original.action !== "update") return "—";
      try {
        const changes = JSON.parse(changesStr);
        const keys = Object.keys(changes);
        if (keys.length === 0) return "No changes";
        return (
          <div className="text-xs space-y-1 max-w-[250px]">
            {keys.map((key) => (
              <div key={key}>
                <span className="font-semibold">{key}:</span>{" "}
                <span className="text-red-500 line-through">
                  {changes[key].old}
                </span>{" "}
                →{" "}
                <span className="text-green-600">{changes[key].new}</span>
              </div>
            ))}
          </div>
        );
      } catch {
        return "—";
      }
    },
  },
];

export default function AuditLogTable({ data }: { data: AuditLog[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("all");
  const [entityFilter, setEntityFilter] = React.useState("all");

  const filteredData = React.useMemo(() => {
    let result = data;
    if (actionFilter !== "all") {
      result = result.filter((log) => log.action === actionFilter);
    }
    if (entityFilter !== "all") {
      result = result.filter((log) => log.entity === entityFilter);
    }
    if (globalFilter) {
      const search = globalFilter.toLowerCase();
      result = result.filter(
        (log) =>
          log.userName?.toLowerCase().includes(search) ||
          log.user?.toLowerCase().includes(search) ||
          log.customer?.toLowerCase().includes(search) ||
          log.inumber?.toLowerCase().includes(search) ||
          log.item?.toLowerCase().includes(search) ||
          log.quantity?.toLowerCase().includes(search)
      );
    }
    return result;
  }, [data, actionFilter, entityFilter, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  return (
    <div className="w-full p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Action filter */}
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>

        {/* Entity filter */}
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="all">All Types</option>
          <option value="inward">Inward</option>
          <option value="outward">Outward</option>
        </select>

        {/* Column visibility */}
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
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary */}
      <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
        <span>Total: {filteredData.length} logs</span>
        <span>
          Creates:{" "}
          {filteredData.filter((l) => l.action === "create").length}
        </span>
        <span>
          Updates:{" "}
          {filteredData.filter((l) => l.action === "update").length}
        </span>
        <span>
          Deletes:{" "}
          {filteredData.filter((l) => l.action === "delete").length}
        </span>
      </div>

      {/* Table */}
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
                <TableRow key={row.id}>
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
                  No audit logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex gap-2">
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
}
