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
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronUp, Phone, PhoneOff, Plus, Search, Trash2 } from "lucide-react";

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
  contacts: Contact[];
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
  const [directoryData, setDirectoryData] = React.useState(data);
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
      const response = await fetch("/api/customer-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: expandedCustomer, contacts: filled }),
      });
      if (!response.ok) throw new Error("Failed to save contacts");
      setDirectoryData((current) => current.map((customer) =>
        customer.customer === expandedCustomer
          ? { ...customer, contacts: filled }
          : customer
      ));
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
        const validContacts = row.original.contacts.filter((contact) => contact.phone.length === 11);
        return (
          <button
            className="group flex min-w-[220px] items-center gap-3 text-left transition-colors"
            onClick={() => handleRowClick(name)}
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${validContacts.length ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"}`}>
              {validContacts.length ? <Phone className="h-4 w-4" /> : <PhoneOff className="h-4 w-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 font-semibold capitalize group-hover:text-primary">
                <span className="truncate">{name}</span>
                {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
              </span>
              {validContacts.length ? (
                <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="tabular-nums">{validContacts[0].phone}</span>
                  {validContacts.length > 1 && <span className="rounded bg-muted px-1.5 py-0.5 font-semibold">+{validContacts.length - 1}</span>}
                </span>
              ) : (
                <span className="mt-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">Missing number</span>
              )}
            </span>
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
    data: directoryData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
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
      <div className="app-toolbar">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Customer..."
              value={(table?.getColumn("customer")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table?.getColumn("customer")?.setFilterValue(event?.target?.value)}
              className="w-full pl-8 outline-none focus:outline-none"
            />
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto px-3">
                  <span className="hidden sm:inline">Columns</span><ChevronDown className="h-4 w-4 sm:ml-2" />
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
        <Button onClick={() => signOut()} type="submit" className="hidden sm:inline-flex">
          Sign Out
        </Button>
      </div>
      <div className="page-shell">
        <div className="flex items-center justify-between gap-4">
          <div className="section-heading">
            <h1 className="text-xl font-bold">Customer list</h1>
            <p className="text-sm text-muted-foreground">Review inward activity and maintain contact details.</p>
          </div>
          <div className="flex shrink-0 items-center space-x-2 rounded-md border bg-card px-3 py-2 text-sm font-medium shadow-sm">
            <span className="text-muted-foreground">Total Customers:</span>
            <span className="text-green-600 font-bold">{data.length}</span>
          </div>
        </div>
        <div>
          <div className="data-panel">
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
          <div className="py-3 text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} Customer(s)
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;
