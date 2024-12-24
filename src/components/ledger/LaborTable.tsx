import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type LaborEntry = {
  addDate: string;
  inumber: string;
  dueDate: string;
  quantity: number;
  labourRate: number;
  labourAmount: number;
  amountReceived: string;
  dateReceived: string;
};

const columns: ColumnDef<LaborEntry>[] = [
  {
    accessorKey: "addDate",
    header: "Add Date",
  },
  {
    accessorKey: "inumber",
    header: "Inward Number",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "labourRate",
    header: "Labour Rate",
  },
  {
    accessorKey: "labourAmount",
    header: "Labour Amount",
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
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

interface LaborTableProps {
  data: LaborEntry[];
}

const LaborTable: React.FC<LaborTableProps> = ({ data }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Labor Table</h2>
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
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
  );
};

export default LaborTable;