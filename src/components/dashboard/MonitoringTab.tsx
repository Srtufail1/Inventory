import React from "react";
import {
  Shield,
  Eye,
  ClipboardList,
  RefreshCw,
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
import { formatDate, Badge, EntityBadge, ChangeArrow } from "./dashboard-utils";
import type {
  UserActivity,
  DailyEntrySummary,
  QuantityChangeLog,
  RateChangeLog,
  RecentlyDeletedRecord,
} from "./types";

// ── Small helper: render a count or dash ────────────────────────────

const CountCell = ({
  value,
  color,
}: {
  value: number;
  color: "green" | "yellow" | "red";
}) =>
  value > 0 ? (
    <Badge color={color}>{value}</Badge>
  ) : (
    <span className="text-xs text-muted-foreground">—</span>
  );

// ── Main Component ──────────────────────────────────────────────────

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
          <h3 className="text-sm font-semibold text-foreground">
            Monitoring Overview
          </h3>
          <span className="ml-auto text-xs text-muted-foreground">
            Last 30 days
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { label: "Active Users Today", value: userActivityScoreboard.length, color: "blue" },
            { label: "Actions Today", value: userActivityScoreboard.reduce((s, u) => s + u.total, 0), color: "purple" },
            { label: "Qty Changes", value: quantityChangeLogs.length, color: "amber" },
            { label: "Rate Changes", value: rateChangeLogs.length, color: "purple" },
            { label: "Deletions", value: recentlyDeleted.length, color: "red" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`border rounded-lg p-3 text-center bg-${stat.color}-500/10 border-${stat.color}-500/30`}
            >
              <p className={`text-xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}>
                {stat.value}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Activity — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Activity Scoreboard */}
        <CollapsibleSection
          title="User Activity Scoreboard — Today"
          icon={<Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          badge={<Badge color="blue" className="ml-2">{userActivityScoreboard.length} users</Badge>}
        >
          {userActivityScoreboard.length > 0 ? (
            <div className="p-3 space-y-2">
              {userActivityScoreboard.map((user, i) => (
                <div
                  key={user.email}
                  className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      i === 0
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.userName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color="green">+{user.creates}</Badge>
                    <Badge color="yellow">~{user.updates}</Badge>
                    <Badge color="red">-{user.deletes}</Badge>
                    <span className="text-xs font-semibold text-foreground ml-1">
                      {user.total} total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No user activity today.
              </p>
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
                  {dailyEntrySummary.map((entry) => (
                    <TableRow key={entry.email}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{entry.userName}</p>
                          <p className="text-[10px] text-muted-foreground">{entry.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center"><CountCell value={entry.inwardCreates} color="green" /></TableCell>
                      <TableCell className="text-center"><CountCell value={entry.inwardUpdates} color="yellow" /></TableCell>
                      <TableCell className="text-center"><CountCell value={entry.inwardDeletes} color="red" /></TableCell>
                      <TableCell className="text-center"><CountCell value={entry.outwardCreates} color="green" /></TableCell>
                      <TableCell className="text-center"><CountCell value={entry.outwardUpdates} color="yellow" /></TableCell>
                      <TableCell className="text-center"><CountCell value={entry.outwardDeletes} color="red" /></TableCell>
                    </TableRow>
                  ))}
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
          badge={<Badge color="amber" className="ml-2">{quantityChangeLogs.length}</Badge>}
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
                    <TableHead className="text-center">Qty Change</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quantityChangeLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell><EntityBadge entity={log.entity} /></TableCell>
                      <TableCell className="font-medium">{log.inumber || "—"}</TableCell>
                      <TableCell>{log.customer || "—"}</TableCell>
                      <TableCell><span className="text-sm">{log.userName}</span></TableCell>
                      <TableCell>
                        <ChangeArrow oldVal={log.oldQty} newVal={log.newQty} />
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
              <p className="text-sm text-muted-foreground">
                No quantity changes detected in the last 30 days.
              </p>
            </div>
          )}
        </CollapsibleSection>

        {/* Rate Changed After Creation */}
        <CollapsibleSection
          title="Rate Changed After Creation"
          icon={<RefreshCw className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
          badge={<Badge color="purple" className="ml-2">{rateChangeLogs.length}</Badge>}
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
                      <TableCell><span className="text-sm">{log.userName}</span></TableCell>
                      <TableCell>
                        {log.oldStoreRate || log.newStoreRate ? (
                          <ChangeArrow oldVal={log.oldStoreRate} newVal={log.newStoreRate} />
                        ) : (
                          <span className="text-xs text-muted-foreground text-center block">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.oldLabourRate || log.newLabourRate ? (
                          <ChangeArrow oldVal={log.oldLabourRate} newVal={log.newLabourRate} />
                        ) : (
                          <span className="text-xs text-muted-foreground text-center block">—</span>
                        )}
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
              <p className="text-sm text-muted-foreground">
                No rate changes detected in the last 30 days.
              </p>
            </div>
          )}
        </CollapsibleSection>
      </div>

      {/* Recently Deleted Records */}
      <CollapsibleSection
        title="Recently Deleted Records"
        icon={<Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />}
        badge={<Badge color="red" className="ml-2">{recentlyDeleted.length}</Badge>}
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
                    <TableCell><EntityBadge entity={record.entity} /></TableCell>
                    <TableCell className="font-medium">{record.inumber || "—"}</TableCell>
                    <TableCell>{record.customer || "—"}</TableCell>
                    <TableCell>{record.item || "—"}</TableCell>
                    <TableCell className="text-right">
                      {record.quantity ? (
                        <Badge color="red">
                          {parseInt(record.quantity || "0").toLocaleString("en-IN")}
                        </Badge>
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
            <p className="text-sm text-muted-foreground">
              No deletions in the last 30 days.
            </p>
          </div>
        )}
      </CollapsibleSection>
    </>
  );
};

export default MonitoringTab;