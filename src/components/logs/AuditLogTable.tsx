"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
} from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { signOut } from "next-auth/react";
import DarkModeToggle from "../DarkModeToggle";
import { deleteAuditLog, deleteAuditLogsByDate } from "@/actions/user";
import { toast } from "../ui/use-toast";

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

type DateGroup = {
  dateKey: string;
  displayDate: string;
  logs: AuditLog[];
  creates: number;
  updates: number;
  deletes: number;
};

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  update:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  delete: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

function ActionBadge({ action }: { action: string }) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
        actionColors[action] || ""
      }`}
    >
      {action}
    </span>
  );
}

function ChangesDisplay({ changesStr }: { changesStr: string | null }) {
  if (!changesStr) return <span className="text-muted-foreground">--</span>;
  try {
    const changes = JSON.parse(changesStr);
    const keys = Object.keys(changes);
    if (keys.length === 0)
      return <span className="text-muted-foreground">No changes</span>;
    return (
      <div className="text-xs space-y-1 max-w-[300px]">
        {keys.map((key) => (
          <div key={key}>
            <span className="font-semibold">{key}:</span>{" "}
            <span className="text-red-500 line-through">
              {String(changes[key].old ?? "--")}
            </span>{" "}
            &rarr;{" "}
            <span className="text-green-600">
              {String(changes[key].new ?? "--")}
            </span>
          </div>
        ))}
      </div>
    );
  } catch {
    return <span className="text-muted-foreground">--</span>;
  }
}

function DeleteLogButton({ logId }: { logId: string }) {
  const handleDelete = async () => {
    const response = await deleteAuditLog(logId);
    if (response?.error) {
      toast({ title: response.error });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-500 h-8 px-2">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this audit log?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this log
            entry.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteDayLogsButton({
  dateKey,
  displayDate,
  count,
}: {
  dateKey: string;
  displayDate: string;
  count: number;
}) {
  const handleDelete = async () => {
    const response = await deleteAuditLogsByDate(dateKey);
    if (response?.error) {
      toast({ title: response.error });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-500 h-8 px-2">
          <Trash2 className="h-4 w-4 mr-1" />
          Delete All
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete all logs for {displayDate}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all{" "}
            {count} log entries for this date.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500">
            Delete All ({count})
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AuditLogTable({ data }: { data: AuditLog[] }) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("all");
  const [entityFilter, setEntityFilter] = React.useState("all");
  const [expandedDates, setExpandedDates] = React.useState<
    Record<string, boolean>
  >({});

  // Filter data
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
          log.quantity?.toLowerCase().includes(search) ||
          log.entity?.toLowerCase().includes(search) ||
          log.action?.toLowerCase().includes(search)
      );
    }
    return result;
  }, [data, actionFilter, entityFilter, globalFilter]);

  // Group by date
  const dateGroups = React.useMemo(() => {
    const groups: Record<string, DateGroup> = {};

    filteredData.forEach((log) => {
      const date = new Date(log.createdAt);
      const dateKey = format(date, "yyyy-MM-dd");
      const displayDate = format(date, "dd MMM yyyy, EEEE");

      if (!groups[dateKey]) {
        groups[dateKey] = {
          dateKey,
          displayDate,
          logs: [],
          creates: 0,
          updates: 0,
          deletes: 0,
        };
      }

      groups[dateKey].logs.push(log);
      if (log.action === "create") groups[dateKey].creates++;
      else if (log.action === "update") groups[dateKey].updates++;
      else if (log.action === "delete") groups[dateKey].deletes++;
    });

    // Sort logs within each group by time descending
    Object.values(groups).forEach((group) => {
      group.logs.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    // Sort groups by date descending
    return Object.values(groups).sort(
      (a, b) => new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime()
    );
  }, [filteredData]);

  const toggleDate = (dateKey: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

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
      </div>

      {/* Summary */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
        <span>Total: {filteredData.length} logs</span>
        <span>Days: {dateGroups.length}</span>
        <span>
          Creates: {filteredData.filter((l) => l.action === "create").length}
        </span>
        <span>
          Updates: {filteredData.filter((l) => l.action === "update").length}
        </span>
        <span>
          Deletes: {filteredData.filter((l) => l.action === "delete").length}
        </span>
      </div>

      {/* Date Groups */}
      <div className="space-y-2">
        {dateGroups.length === 0 ? (
          <div className="rounded-md border p-8 text-center text-muted-foreground">
            No audit logs found.
          </div>
        ) : (
          dateGroups.map((group) => (
            <div key={group.dateKey} className="rounded-md border">
              {/* Date Row */}
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleDate(group.dateKey)}
              >
                <div className="flex items-center gap-3">
                  {expandedDates[group.dateKey] ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold text-base">
                    {group.displayDate}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    ({group.logs.length}{" "}
                    {group.logs.length === 1 ? "log" : "logs"})
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  {group.creates > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      {group.creates} created
                    </span>
                  )}
                  {group.updates > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                      {group.updates} updated
                    </span>
                  )}
                  {group.deletes > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                      {group.deletes} deleted
                    </span>
                  )}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 ml-2"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => toggleDate(group.dateKey)}
                    >
                      {expandedDates[group.dateKey] ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" /> Hide
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" /> Show Logs
                        </>
                      )}
                    </Button>
                    <DeleteDayLogsButton
                      dateKey={group.dateKey}
                      displayDate={group.displayDate}
                      count={group.logs.length}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Logs Table */}
              {expandedDates[group.dateKey] && (
                <div className="border-t overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Time</TableHead>
                        <TableHead className="w-[90px]">Action</TableHead>
                        <TableHead className="w-[90px]">Type</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Inward #</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="w-[60px]">Qty</TableHead>
                        <TableHead>Changes</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm font-medium">
                            {format(new Date(log.createdAt), "hh:mm:ss a")}
                          </TableCell>
                          <TableCell>
                            <ActionBadge action={log.action} />
                          </TableCell>
                          <TableCell>
                            <span className="capitalize font-medium text-sm">
                              {log.entity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">
                                {log.userName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {log.user}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.customer || "--"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.inumber || "--"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.item || "--"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.quantity || "--"}
                          </TableCell>
                          <TableCell>
                            {log.action === "update" ? (
                              <ChangesDisplay changesStr={log.changes} />
                            ) : (
                              <span className="text-muted-foreground">--</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <DeleteLogButton logId={log.id} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
