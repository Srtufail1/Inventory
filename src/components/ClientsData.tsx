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
import { ArrowUpDown, ChevronDown, Search, KeyRound, UserPlus } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ClientActions from "./ClientActions";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { signOut } from "next-auth/react";
import { toast } from "./ui/use-toast";
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loginToken: string | null;
}

// Separate component for the Access cell with Authorize button
const AccessCell = ({ loginToken }: { loginToken: string | null | boolean }) => {
  const isWorldWide = loginToken === "false" || loginToken === false;

  const handleAuthorize = () => {
    try {
      if (typeof loginToken === "string" && loginToken !== "false") {
        localStorage.setItem("zamzam_key", loginToken);
        toast({
          title: "Device Authorized",
          description: "This device has been authorized successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Authorization Failed",
        description: "Failed to authorize device. Please enable cookies and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          isWorldWide
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
        }`}
      >
        {isWorldWide ? "World Wide" : "Token Based"}
      </span>
      {!isWorldWide && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handleAuthorize}
        >
          <KeyRound className="h-3 w-3 mr-1" />
          Authorize
        </Button>
      )}
    </div>
  );
};

export const columns: ColumnDef<UserData>[] = [
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return (
        <div className="lowercase line-clamp-2">{row.getValue("email")}</div>
      );
    },
  },
  {
    accessorKey: "isAdmin",
    header: "Admin",
    cell: ({ row }) => {
      const isAdmin = row.getValue("isAdmin") as boolean;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isAdmin
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isAdmin ? "True" : "False"}
        </span>
      );
    },
  },
  {
    accessorKey: "isSuperAdmin",
    header: "Super Admin",
    cell: ({ row }) => {
      const isSuperAdmin = row.getValue("isSuperAdmin") as boolean;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isSuperAdmin
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isSuperAdmin ? "True" : "False"}
        </span>
      );
    },
  },
  {
    accessorKey: "loginToken",
    header: "Access",
    cell: ({ row }) => {
      const loginToken = row.getValue("loginToken") as string | null;
      return <AccessCell loginToken={loginToken} />;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ClientActions row={row} />,
  },
];

const ClientsData = ({ data }: { data: UserData[] }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
    },
  });

  return (
    <div className="w-full">
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-muted/40 px-6">
        <div className="flex items-center gap-3 w-full">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name..."
              value={
                (table?.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event: any) =>
                table?.getColumn("name")?.setFilterValue(event?.target?.value)
              }
              className="pl-8 max-w-sm outline-none focus:outline-none"
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
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Link href="/signup">
          <Button className="bg-green-600 hover:bg-green-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </Link>
        <DarkModeToggle />
        <Button
          onClick={(e) => {
            e.preventDefault();
            signOut();
          }}
          type="submit"
        >
          Sign Out
        </Button>
      </div>
      <div className="p-6">
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
                table.getRowModel().rows.map((row) => {
                  const isSuperAdmin = row.original.isSuperAdmin;
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={
                        isSuperAdmin
                          ? "bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-950/50"
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
                  );
                })
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
      </div>
    </div>
  );
};

export default ClientsData;