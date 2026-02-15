import React from "react";
import {
  Shield,
  Eye,
  ClipboardList,
  RefreshCw,
  ArrowRight,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CollapsibleSection from "./CollapsibleSection";
import { formatDate } from "./dashboard-utils";
import type {
  UserActivity,
  DailyEntrySummary,
  QuantityChangeLog,
  RateChangeLog,
  RecentlyDeletedRecord,
} from "./types";

const MonitoringTab = ({
  userActivityScoreboard,
  dailyEntrySummary,
  quantityChangeLogs,
  rateChangeLogs,
  recentlyDeleted,
}: {
  userActivityScoreboard: UserActivity[];
  dailyEntrySummary: DailyEntrySummary[];
  quantityChangeLogs: QuantityChangeLog[];
  rateChangeLogs: RateChangeLog[];
  recentlyDeleted: RecentlyDeletedRecord[];
}) => {
  return (
    <>
      {/* Monitoring Summary */}
      <div className="border rounded-xl p-4 bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-foreground">Monitoring Overview</h3>
          <span className="ml-auto text-xs text-muted-foreground">Last 30 days</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="border rounded-lg p-3 text-center bg-blue-500/10 border-blue-500/30">
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{userActivityScoreboard.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Active Users Today</p>
          </div>
          <div className="border rounded-lg p-3 text-center bg-purple-500/10 border-purple-500/30">
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {userActivityScoreboard.reduce((s, u) => s + u.total, 0)}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Actions Today</p>
          </div>
          <div className="border rounded-lg p-3 text-center bg-amber-500/10 border-amber-500/30">
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{quantityChangeLogs.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Qty Changes</p>
          </div>
          <div className="border rounded-lg p-3 text-center bg-purple-500/10 border-purple-500/30">
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{rateChangeLogs.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Rate Changes</p>
          </div>
          <div className="border rounded-lg p-3 text-center bg-red-500/10 border-red-500/30">
            <p className="text-xl font-bold text-red-600 dark:text-red-400">{recentlyDeleted.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Deletions</p>
          </div>
        </div>
      </div>

      {/* Today's Activity — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Activity Scoreboard */}
        <CollapsibleSection
          title="User Activity Scoreboard — Today"
          icon={<Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          badge={
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 px-2 py-0.5 rounded-full">
              {userActivityScoreboard.length} users
            </span>
          }
        >
          {userActivityScoreboard.length > 0 ? (
            <div className="p-3 space-y-2">
              {userActivityScoreboard.map((user, i) => (
                <div
                  key={user.email}
                  className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    i === 0 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" : "bg-muted text-muted-foreground"
                  }`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400">
                      +{user.creates}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400">
                      ~{user.updates}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">
                      -{user.deletes}
                    </span>
                    <span className="text-xs font-semibold text-foreground ml-1">
                      {user.total} total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No user activity today.</p>
            </div>
          )}
        </CollapsibleSection>

        {/* Daily Entry Summary by User */}
        <CollapsibleSection
          title="Daily Entry Summary — Today"
          icon={<ClipboardList className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
          badge={
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              Who did what today
            </span>
          }
        >
          {dailyEntrySummary.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-center" colSpan={3}>
                      <span className="text-blue-600 dark:text-blue-400">Inward</span>
                    </TableHead>
                    <TableHead className="text-center" colSpan={3}>
                      <span className="text-orange-600 dark:text-orange-400">Outward</span>
                    </TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead className="text-center text-xs">Create</TableHead>
                    <TableHead className="text-center text-xs">Edit</TableHead>
                    <TableHead className="text-center text-xs">Delete</TableHead>
                    <TableHead className="text-center text-xs">Create</TableHead>
                    <TableHead className="text-center text-xs">Edit</TableHead>
                    <TableHead className="text-center text-xs">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyEntrySummary.map((entry) => {
                    return (
                      <TableRow key={entry.email}>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{entry.userName}</p>
                            <p className="text-[10px] text-muted-foreground">{entry.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.inwardCreates > 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400">{entry.inwardCreates}</span>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.inwardUpdates > 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400">{entry.inwardUpdates}</span>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.inwardDeletes > 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">{entry.inwardDeletes}</span>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.outwardCreates > 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400">{entry.outwardCreates}</span>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.outwardUpdates > 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400">{entry.outwardUpdates}</span>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.outwardDeletes > 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">{entry.outwardDeletes}</span>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No entries today.</p>
            </div>
          )}
        </CollapsibleSection>
      </div>

      {/* Changes — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quantity Changed After Creation */}
        <CollapsibleSection
          title="Quantity Changed After Creation"
          icon={<RefreshCw className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          badge={
            <span className="ml-2 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-0.5 rounded-full">
              {quantityChangeLogs.length}
            </span>
          }
          wrapperClassName={quantityChangeLogs.length > 0 ? "border-amber-500/30 bg-amber-500/5" : ""}
          headerClassName={quantityChangeLogs.length > 0 ? "border-amber-500/20 bg-amber-500/10" : ""}
        >
          {quantityChangeLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Inward No.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead className="text-right">Old Qty</TableHead>
                    <TableHead className="text-center"></TableHead>
                    <TableHead className="text-right">New Qty</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quantityChangeLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          log.entity === "inward"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400"
                            : "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400"
                        }`}>
                          {log.entity}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{log.inumber || "—"}</TableCell>
                      <TableCell>{log.customer || "—"}</TableCell>
                      <TableCell>
                        <span className="text-sm">{log.userName}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        {log.oldQty ? (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 line-through">
                            {log.oldQty}
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <ArrowRight className="h-3 w-3 text-muted-foreground mx-auto" />
                      </TableCell>
                      <TableCell className="text-right">
                        {log.newQty ? (
                          <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400">
                            {log.newQty}
                          </span>
                        ) : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No quantity changes detected in the last 30 days.</p>
            </div>
          )}
        </CollapsibleSection>

        {/* Rate Changed After Creation */}
        <CollapsibleSection
          title="Rate Changed After Creation"
          icon={<RefreshCw className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
          badge={
            <span className="ml-2 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400 px-2 py-0.5 rounded-full">
              {rateChangeLogs.length}
            </span>
          }
          wrapperClassName={rateChangeLogs.length > 0 ? "border-purple-500/30 bg-purple-500/5" : ""}
          headerClassName={rateChangeLogs.length > 0 ? "border-purple-500/20 bg-purple-500/10" : ""}
        >
          {rateChangeLogs.length > 0 ? (
            <div className="max-h-96 overflow-y-auto overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inward No.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead className="text-center">Store Rate</TableHead>
                    <TableHead className="text-center">Labour Rate</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rateChangeLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.inumber || "—"}</TableCell>
                      <TableCell>{log.customer || "—"}</TableCell>
                      <TableCell>
                        <span className="text-sm">{log.userName}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {(log.oldStoreRate || log.newStoreRate) ? (
                          <div className="flex items-center justify-center gap-1">
                            {log.oldStoreRate ? (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 line-through">
                                {log.oldStoreRate}
                              </span>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            {log.newStoreRate ? (
                              <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400">
                                {log.newStoreRate}
                              </span>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </div>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        {(log.oldLabourRate || log.newLabourRate) ? (
                          <div className="flex items-center justify-center gap-1">
                            {log.oldLabourRate ? (
                              <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 line-through">
                                {log.oldLabourRate}
                              </span>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            {log.newLabourRate ? (
                              <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400">
                                {log.newLabourRate}
                              </span>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </div>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No rate changes detected in the last 30 days.</p>
            </div>
          )}
        </CollapsibleSection>
      </div>

      {/* Recently Deleted Records */}
      <CollapsibleSection
        title="Recently Deleted Records"
        icon={<Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />}
        badge={
          <span className="ml-2 text-xs bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 px-2 py-0.5 rounded-full">
            {recentlyDeleted.length}
          </span>
        }
        wrapperClassName={recentlyDeleted.length > 0 ? "border-red-500/30 bg-red-500/5" : ""}
        headerClassName={recentlyDeleted.length > 0 ? "border-red-500/20 bg-red-500/10" : ""}
      >
        {recentlyDeleted.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Inward No.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Deleted By</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentlyDeleted.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        record.entity === "inward"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400"
                          : "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400"
                      }`}>
                        {record.entity}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{record.inumber || "—"}</TableCell>
                    <TableCell>{record.customer || "—"}</TableCell>
                    <TableCell>{record.item || "—"}</TableCell>
                    <TableCell className="text-right">
                      {record.quantity ? (
                        <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">
                          {parseInt(record.quantity || "0").toLocaleString("en-IN")}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{record.userName}</p>
                        <p className="text-[10px] text-muted-foreground">{record.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(record.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <Trash2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No deletions in the last 30 days.</p>
          </div>
        )}
      </CollapsibleSection>
    </>
  );
};

export default MonitoringTab;
