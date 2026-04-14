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
import { ArrowUpDown, ChevronDown, ChevronUp, Plus, Search, Trash2 } from "lucide-react";

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
import DarkModeToggle from '../DarkModeToggle';

interface CustomerData {
  customer: string;
  totalInwards: number;
}

interface Contact {
  name: string;
  phone: string;
}

interface ExpandedState {
  contacts: Contact[];
  loading: boolean;
  saving: boolean;
  saved: boolean;
}

const CustomerPage = ({ data }: { data: CustomerData[] }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [expandedCustomer, setExpandedCustomer] = React.useState<string | null>(null);
  const [expandedState, setExpandedState] = React.useState<ExpandedState>({
    contacts: [],
    loading: false,
    saving: false,
    saved: false,
  });

  const handleRowClick = async (customerName: string) => {
    if (expandedCustomer === customerName) {
      setExpandedCustomer(null);
      return;
    }

    setExpandedCustomer(customerName);
    setExpandedState({ contacts: [], loading: true, saving: false, saved: false });

    try {
      const res = await fetch(`/api/customer-details?customer=${encodeURIComponent(customerName)}`);
      const data = await res.json();
      const contacts: Contact[] = (data.contacts ?? []).length > 0
        ? data.contacts
        : [{ name: "", phone: "" }];
      setExpandedState({ contacts, loading: false, saving: false, saved: false });
    } catch {
      setExpandedState({ contacts: [{ name: "", phone: "" }], loading: false, saving: false, saved: false });
    }
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    if (field === "phone") {
      // Only allow digits, max 11
      const digits = value.replace(/\D/g, "").slice(0, 11);
      setExpandedState((prev) => {
        const contacts = [...prev.contacts];
        contacts[index] = { ...contacts[index], [field]: digits };
        return { ...prev, contacts, saved: false };
      });
    } else {
      setExpandedState((prev) => {
        const contacts = [...prev.contacts];
        contacts[index] = { ...contacts[index], [field]: value };
        return { ...prev, contacts, saved: false };
      });
    }
  };

  const addContact = () => {
    setExpandedState((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { name: "", phone: "" }],
      saved: false,
    }));
  };

  const removeContact = (index: number) => {
    setExpandedState((prev) => {
      const contacts = prev.contacts.filter((_, i) => i !== index);
      return { ...prev, contacts: contacts.length > 0 ? contacts : [{ name: "", phone: "" }], saved: false };
    });
  };

  const saveContacts = async () => {
    if (!expandedCustomer) return;

    // Validate: all filled entries must have 11-digit phone
    const filled = expandedState.contacts.filter((c) => c.name.trim() || c.phone.trim());
    for (const c of filled) {
      if (c.phone.length !== 11) {
        alert("Phone number must be exactly 11 digits.");
        return;
      }
    }

    setExpandedState((prev) => ({ ...prev, saving: true }));
    try {
      await fetch("/api/customer-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: expandedCustomer, contacts: filled }),
      });
      setExpandedState((prev) => ({ ...prev, saving: false, saved: true }));
    } catch {
      setExpandedState((prev) => ({ ...prev, saving: false }));
    }
  };

  const columns: ColumnDef<CustomerData>[] = React.useMemo(() => [
    {
      accessorKey: "customer",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const name = row.getValue("customer") as string;
        const isOpen = expandedCustomer === name;
        return (
          <button
            className="flex items-center gap-1 capitalize font-medium hover:text-blue-600 transition-colors cursor-pointer"
            onClick={() => handleRowClick(name)}
          >
            {name}
            {isOpen
              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground" />
            }
          </button>
        );
      },
    },
    {
      accessorKey: "totalInwards",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Inwards
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="pl-8">{row.getValue("totalInwards")}</div>,
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [expandedCustomer]);

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
    <div>
      <div className="flex justify-between w-full h-14 lg:h-16 items-center gap-4 border-b bg-muted/40 px-6">
        <div className="flex items-center gap-3 w-full">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Customer..."
              value={(table?.getColumn("customer")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table?.getColumn("customer")?.setFilterValue(event?.target?.value)}
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
        </div>
        <DarkModeToggle />
        <Button onClick={() => signOut()} type="submit">
          Sign Out
        </Button>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between pt-3 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">Customer List</h1>
          <div className="flex items-center space-x-2 text-sm font-medium bg-muted rounded-full px-4 py-2 shadow-sm">
            <span className="text-muted-foreground">Total Customers:</span>
            <span className="text-green-600 font-bold">{data.length}</span>
          </div>
        </div>
        <div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                    const customerName = row.getValue("customer") as string;
                    const isExpanded = expandedCustomer === customerName;
                    return (
                      <React.Fragment key={row.id}>
                        <TableRow data-state={row.getIsSelected() && "selected"}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>

                        {isExpanded && (
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableCell colSpan={columns.length} className="py-4 px-6">
                              {expandedState.loading ? (
                                <p className="text-sm text-muted-foreground">Loading...</p>
                              ) : (
                                <div className="space-y-3">
                                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Contact Numbers
                                  </p>

                                  {expandedState.contacts.map((contact, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                      <Input
                                        placeholder="Contact name"
                                        value={contact.name}
                                        onChange={(e) => updateContact(i, "name", e.target.value)}
                                        className="max-w-[180px]"
                                      />
                                      <Input
                                        placeholder="11-digit phone"
                                        value={contact.phone}
                                        onChange={(e) => updateContact(i, "phone", e.target.value)}
                                        className="max-w-[160px]"
                                        maxLength={11}
                                        inputMode="numeric"
                                      />
                                      <span className={`text-xs tabular-nums ${contact.phone.length === 11 ? "text-green-600" : "text-muted-foreground"}`}>
                                        {contact.phone.length}/11
                                      </span>
                                      <button
                                        onClick={() => removeContact(i)}
                                        className="text-muted-foreground hover:text-red-500 transition-colors"
                                        title="Remove"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}

                                  <div className="flex items-center gap-3 pt-1">
                                    <button
                                      onClick={addContact}
                                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                      <Plus className="h-4 w-4" />
                                      Add another
                                    </button>
                                    <Button
                                      size="sm"
                                      onClick={saveContacts}
                                      disabled={expandedState.saving}
                                    >
                                      {expandedState.saving ? "Saving..." : "Save"}
                                    </Button>
                                    {expandedState.saved && (
                                      <span className="text-sm text-green-600">Saved</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-5">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} Customer(s)
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

export default CustomerPage;
