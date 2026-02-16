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
import { formatDate, Badge, EntityBadge } from "./dashboard-utils";
import type {
  DuplicateAlert,
  QuantityMismatch,
  OrphanedOutward,
  StaleRecord,
  EmptyQuantityFlag,
  MissingRateAlert,
} from "./types";

// ── Alert summary card config ───────────────────────────────────────

type AlertCardConfig = {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
};

const buildAlertCards = (
  duplicateAlerts: DuplicateAlert[],
  quantityMismatches: QuantityMismatch[],
  orphanedOutward: OrphanedOutward[],
  staleRecords: StaleRecord[],
  emptyQuantityFlags: EmptyQuantityFlag[],
  missingRateAlerts: MissingRateAlert[]
): AlertCardConfig[] => [
  { icon: <Copy className="h-4 w-4" />, label: "Duplicates", count: duplicateAlerts.length, color: "orange" },
  { icon: <Scale className="h-4 w-4" />, label: "Qty Mismatch", count: quantityMismatches.length, color: "red" },
  { icon: <Unlink className="h-4 w-4" />, label: "Orphaned", count: orphanedOutward.length, color: "red" },
  { icon: <Clock className="h-4 w-4" />, label: "Stale Records", count: staleRecords.length, color: "amber" },
  { icon: <Ban className="h-4 w-4" />, label: "Empty Qty", count: emptyQuantityFlags.length, color: "red" },
  { icon: <Wallet className="h-4 w-4" />, label: "Missing Rates", count: missingRateAlerts.length, color: "orange" },
];

// ── Stale record age display ────────────────────────────────────────

const AgeDisplay = ({ days }: { days: number }) => {
  const color =
    days > 730 ? "red" : days > 547 ? "orange" : "amber";
  const label =
    days > 365
      ? `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}m`
      : `${days}d`;
  return <Badge color={color as any}>{label}</Badge>;
};

// ── Main Component ──────────────────────────────────────────────────

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
  const alertCards = buildAlertCards(
    duplicateAlerts,
    quantityMismatches,
    orphanedOutward,
    staleRecords,
    emptyQuantityFlags,
    missingRateAlerts
  );

  return (
    <>
      {/* Alert Summary */}
      {totalAlerts > 0 && (
        <div className="border rounded-xl p-4 bg-card">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h3 className="text-sm font-semibold text-foreground">
              Alert Summary
            </h3>
            <span className="ml-auto text-xs text-muted-foreground">
              {totalAlerts} total issues found
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {alertCards.map((a) => (
              <div
                key={a.label}
                className={`border rounded-lg p-3 text-center transition-colors ${
                  a.count > 0
                    ? `bg-${a.color}-500/10 border-${a.color}-500/30`
                    : "bg-muted/30 border-border"
                }`}
              >
                <div
                  className={`mx-auto mb-1.5 flex justify-center ${
                    a.count > 0
                      ? `text-${a.color}-600 dark:text-${a.color}-400`
                      : "text-muted-foreground"
                  }`}
                >
                  {a.icon}
                </div>
                <p
                  className={`text-xl font-bold ${
                    a.count > 0
                      ? `text-${a.color}-600 dark:text-${a.color}-400`
                      : "text-muted-foreground"
                  }`}
                >
                  {a.count}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {a.label}
                </p>
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
          badge={<Badge color="orange" className="ml-2">{duplicateAlerts.length}</Badge>}
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
                    <TableCell className="font-medium">{dup.inumber}</TableCell>
                    <TableCell>{dup.count}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {dup.customers.map((c, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[11px] bg-muted">{c}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {dup.items.map((it, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-[11px] bg-muted">{it}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {dup.hasDifferentCustomers && <Badge color="red">Different Customers</Badge>}
                        {dup.hasDifferentItems && <Badge color="amber">Different Items</Badge>}
                        {!dup.hasDifferentCustomers && !dup.hasDifferentItems && (
                          <Badge color="yellow">Duplicate Entry</Badge>
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
          badge={<Badge color="red" className="ml-2">{quantityMismatches.length}</Badge>}
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
                    <TableCell className="font-medium">{mm.inumber}</TableCell>
                    <TableCell>{mm.customer}</TableCell>
                    <TableCell>{mm.item}</TableCell>
                    <TableCell className="text-right">{mm.totalInward.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right">{mm.totalOutward.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-right">
                      <Badge color="red">+{mm.excess.toLocaleString("en-IN")}</Badge>
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
                    <TableCell className="font-medium">{item.onumber}</TableCell>
                    <TableCell><Badge color="red">{item.inumber}</Badge></TableCell>
                    <TableCell>{formatDate(item.outDate)}</TableCell>
                    <TableCell>{item.customer}</TableCell>
                    <TableCell>{item.item}</TableCell>
                    <TableCell className="text-right">
                      {parseInt(item.quantity || "0").toLocaleString("en-IN")}
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
          badge={<Badge color="amber" className="ml-2">{staleRecords.length}</Badge>}
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
                        <AgeDisplay days={record.ageInDays} />
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
          badge={<Badge color="red" className="ml-2">{emptyQuantityFlags.length}</Badge>}
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
                      <TableCell><EntityBadge entity={flag.type} /></TableCell>
                      <TableCell className="font-medium">{flag.number}</TableCell>
                      <TableCell>{flag.customer}</TableCell>
                      <TableCell>{flag.item}</TableCell>
                      <TableCell><Badge color="red">{flag.quantity || "empty"}</Badge></TableCell>
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
          badge={<Badge color="orange" className="ml-2">{missingRateAlerts.length}</Badge>}
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
                          <Badge color="red">{alert.store_rate || "empty"}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">{alert.store_rate}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {alert.missingLabour ? (
                          <Badge color="red">{alert.labour_rate || "empty"}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">{alert.labour_rate}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {alert.missingStore && <Badge color="orange">No Store Rate</Badge>}
                          {alert.missingLabour && <Badge color="orange">No Labour Rate</Badge>}
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
          <p className="text-xs text-muted-foreground mt-1">
            No data integrity issues found.
          </p>
        </div>
      )}
    </>
  );
};

export default AlertsTab;