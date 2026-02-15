import React from "react";
import {
  AlertTriangle,
  Copy,
  Scale,
  Unlink,
  Clock,
  Ban,
  Wallet,
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
  DuplicateAlert,
  QuantityMismatch,
  OrphanedOutward,
  StaleRecord,
  EmptyQuantityFlag,
  MissingRateAlert,
} from "./types";

const AlertsTab = ({
  totalAlerts,
  duplicateAlerts,
  quantityMismatches,
  orphanedOutward,
  staleRecords,
  emptyQuantityFlags,
  missingRateAlerts,
}: {
  totalAlerts: number;
  duplicateAlerts: DuplicateAlert[];
  quantityMismatches: QuantityMismatch[];
  orphanedOutward: OrphanedOutward[];
  staleRecords: StaleRecord[];
  emptyQuantityFlags: EmptyQuantityFlag[];
  missingRateAlerts: MissingRateAlert[];
}) => {
  return (
    <>
      {/* Alert Summary */}
      {totalAlerts > 0 && (
        <div className="border rounded-xl p-4 bg-card">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-semibold text-foreground">Alert Summary</h3>
            <span className="ml-auto text-xs text-muted-foreground">{totalAlerts} total issues found</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { icon: <Copy className="h-4 w-4" />, label: "Duplicates", count: duplicateAlerts.length, bg: "bg-orange-500/10 border-orange-500/30", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500" },
              { icon: <Scale className="h-4 w-4" />, label: "Qty Mismatch", count: quantityMismatches.length, bg: "bg-red-500/10 border-red-500/30", text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
              { icon: <Unlink className="h-4 w-4" />, label: "Orphaned", count: orphanedOutward.length, bg: "bg-red-500/10 border-red-500/30", text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
              { icon: <Clock className="h-4 w-4" />, label: "Stale Records", count: staleRecords.length, bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
              { icon: <Ban className="h-4 w-4" />, label: "Empty Qty", count: emptyQuantityFlags.length, bg: "bg-red-500/10 border-red-500/30", text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
              { icon: <Wallet className="h-4 w-4" />, label: "Missing Rates", count: missingRateAlerts.length, bg: "bg-orange-500/10 border-orange-500/30", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500" },
            ].map((a) => (
              <div
                key={a.label}
                className={`border rounded-lg p-3 text-center transition-colors ${
                  a.count > 0 ? a.bg : "bg-muted/30 border-border"
                }`}
              >
                <div className={`mx-auto mb-1.5 flex justify-center ${a.count > 0 ? a.text : "text-muted-foreground"}`}>
                  {a.icon}
                </div>
                <p className={`text-xl font-bold ${a.count > 0 ? a.text : "text-muted-foreground"}`}>
                  {a.count}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Duplicate Inward Alerts */}
      {duplicateAlerts.length > 0 && (
        <CollapsibleSection
          title="Duplicate Inward Alerts"
          icon={<Copy className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
          defaultOpen={false}
          badge={
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400">
              {duplicateAlerts.length}
            </span>
          }
          wrapperClassName="border-orange-500/30 bg-orange-500/5"
          headerClassName="border-orange-500/20 bg-orange-500/10"
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inward No.</TableHead>
                  <TableHead>Occurrences</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Issue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {duplicateAlerts.map((dup) => (
                  <TableRow key={dup.inumber}>
                    <TableCell className="font-medium">
                      {dup.inumber}
                    </TableCell>
                    <TableCell>{dup.count}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {dup.customers.map((c, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[11px] bg-muted"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {dup.items.map((it, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[11px] bg-muted"
                          >
                            {it}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {dup.hasDifferentCustomers && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">
                            Different Customers
                          </span>
                        )}
                        {dup.hasDifferentItems && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400">
                            Different Items
                          </span>
                        )}
                        {!dup.hasDifferentCustomers && !dup.hasDifferentItems && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400">
                            Duplicate Entry
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CollapsibleSection>
      )}

      {/* Quantity Mismatch Alerts */}
      {quantityMismatches.length > 0 && (
        <CollapsibleSection
          title="Quantity Mismatch Alerts"
          icon={<Scale className="h-4 w-4 text-red-600 dark:text-red-400" />}
          defaultOpen={false}
          badge={
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">
              {quantityMismatches.length}
            </span>
          }
          wrapperClassName="border-red-500/30 bg-red-500/5"
          headerClassName="border-red-500/20 bg-red-500/10"
        >
          <div className="max-h-96 overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inward No.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Inward Qty</TableHead>
                  <TableHead className="text-right">Outward Qty</TableHead>
                  <TableHead className="text-right">Over-dispatched</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quantityMismatches.map((mm) => (
                  <TableRow key={mm.inumber}>
                    <TableCell className="font-medium">
                      {mm.inumber}
                    </TableCell>
                    <TableCell>{mm.customer}</TableCell>
                    <TableCell>{mm.item}</TableCell>
                    <TableCell className="text-right">
                      {mm.totalInward.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      {mm.totalOutward.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">
                        +{mm.excess.toLocaleString("en-IN")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CollapsibleSection>
      )}

      {/* Orphaned Outward Records */}
      {orphanedOutward.length > 0 && (
        <CollapsibleSection
          title="Orphaned Outward Records"
          icon={<Unlink className="h-4 w-4 text-red-600 dark:text-red-400" />}
          defaultOpen={false}
          badge={
            <span className="ml-2 text-xs text-red-600/80 dark:text-red-400/80 font-normal">
              Outward entries referencing missing inward numbers
            </span>
          }
          wrapperClassName="border-red-500/30 bg-red-500/5"
          headerClassName="border-red-500/20 bg-red-500/10"
        >
          <div className="max-h-96 overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Outward No.</TableHead>
                  <TableHead>Inward No. (Missing)</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orphanedOutward.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.onumber}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">
                        {item.inumber}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(item.outDate)}</TableCell>
                    <TableCell>{item.customer}</TableCell>
                    <TableCell>{item.item}</TableCell>
                    <TableCell className="text-right">
                      {parseInt(item.quantity || "0").toLocaleString(
                        "en-IN"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CollapsibleSection>
      )}

      {/* Stale Records Detector */}
      {staleRecords.length > 0 && (
        <CollapsibleSection
          title="Stale Records"
          icon={<Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          badge={
            <span className="ml-2 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 px-2 py-0.5 rounded-full">
              {staleRecords.length}
            </span>
          }
          defaultOpen={false}
        >
          <div className="p-3">
            <p className="text-xs text-muted-foreground mb-2">
              Inward records older than 1 year with remaining stock
            </p>
            <div className="max-h-96 overflow-y-auto overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inward No.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead className="text-right">Age</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staleRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.inumber}</TableCell>
                      <TableCell>{record.customer}</TableCell>
                      <TableCell>{record.item}</TableCell>
                      <TableCell>{formatDate(record.addDate)}</TableCell>
                      <TableCell className="text-right">
                        {record.remaining.toLocaleString("en-IN")}
                        <span className="text-xs text-muted-foreground ml-1">
                          / {record.quantity.toLocaleString("en-IN")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          record.ageInDays > 730
                            ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400"
                            : record.ageInDays > 547
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400"
                        }`}>
                          {record.ageInDays > 365
                            ? `${Math.floor(record.ageInDays / 365)}y ${Math.floor((record.ageInDays % 365) / 30)}m`
                            : `${record.ageInDays}d`}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Empty/Zero Quantity Flags */}
      {emptyQuantityFlags.length > 0 && (
        <CollapsibleSection
          title="Empty/Zero Quantity Records"
          icon={<Ban className="h-4 w-4 text-red-600 dark:text-red-400" />}
          badge={
            <span className="ml-2 text-xs bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 px-2 py-0.5 rounded-full">
              {emptyQuantityFlags.length}
            </span>
          }
          defaultOpen={false}
        >
          <div className="p-3">
            <p className="text-xs text-muted-foreground mb-2">
              Records with missing, zero, or invalid quantity values — these affect calculations
            </p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emptyQuantityFlags.map((flag) => (
                    <TableRow key={flag.id}>
                      <TableCell>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          flag.type === "inward"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400"
                            : "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400"
                        }`}>
                          {flag.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{flag.number}</TableCell>
                      <TableCell>{flag.customer}</TableCell>
                      <TableCell>{flag.item}</TableCell>
                      <TableCell>
                        <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">
                          {flag.quantity || "empty"}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(flag.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Missing Rate Alerts */}
      {missingRateAlerts.length > 0 && (
        <CollapsibleSection
          title="Missing Rate Alerts"
          icon={<Wallet className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
          badge={
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400">
              {missingRateAlerts.length}
            </span>
          }
          wrapperClassName="border-orange-500/30 bg-orange-500/5"
          headerClassName="border-orange-500/20 bg-orange-500/10"
          defaultOpen={false}
        >
          <div className="p-3">
            <p className="text-xs text-muted-foreground mb-2">
              Inward records with missing or zero store rate / labour rate — these affect billing
            </p>
            <div className="max-h-96 overflow-y-auto overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inward No.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Store Rate</TableHead>
                    <TableHead className="text-center">Labour Rate</TableHead>
                    <TableHead>Issue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missingRateAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.inumber}</TableCell>
                      <TableCell>{alert.customer}</TableCell>
                      <TableCell>{alert.item}</TableCell>
                      <TableCell>{formatDate(alert.addDate)}</TableCell>
                      <TableCell className="text-center">
                        {alert.missingStore ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">
                            {alert.store_rate || "empty"}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{alert.store_rate}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {alert.missingLabour ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">
                            {alert.labour_rate || "empty"}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{alert.labour_rate}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {alert.missingStore && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400">
                              No Store Rate
                            </span>
                          )}
                          {alert.missingLabour && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400">
                              No Labour Rate
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {totalAlerts === 0 && (
        <div className="border rounded-xl p-8 bg-card text-center">
          <AlertTriangle className="h-8 w-8 text-green-500 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">All Clear</p>
          <p className="text-xs text-muted-foreground mt-1">No data integrity issues found.</p>
        </div>
      )}
    </>
  );
};

export default AlertsTab;
