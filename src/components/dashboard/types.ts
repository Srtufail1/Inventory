export type Stats = {
  totalInwardRecords: number;
  totalOutwardRecords: number;
  totalInwardQuantity: number;
  totalOutwardQuantity: number;
  currentStock: number;
  totalCustomers: number;
};

export type TopCustomer = {
  customer: string;
  quantity: number;
};

export type InwardStock = {
  id: string;
  inumber: string;
  item: string;
  addDate: string;
  inwardQty: number;
  remaining: number;
};

export type CustomerStock = {
  customer: string;
  totalRemaining: number;
  inwards: InwardStock[];
};

export type MonthlyTrend = {
  month: string;
  inwardCount: number;
  outwardCount: number;
  inwardQty: number;
  outwardQty: number;
};

export type TopItem = {
  item: string;
  quantity: number;
};

export type TodayActivity = {
  inwardCount: number;
  outwardCount: number;
  inwardQty: number;
  outwardQty: number;
};

export type MonthChange = {
  inwardCount: number;
  outwardCount: number;
  inwardQty: number;
  outwardQty: number;
};

export type CustomerGrowth = {
  month: string;
  newCustomers: number;
};

export type OrphanedOutward = {
  id: string;
  onumber: string;
  inumber: string;
  outDate: string;
  customer: string;
  item: string;
  quantity: string;
};

export type DuplicateAlert = {
  inumber: string;
  customers: string[];
  items: string[];
  count: number;
  hasDifferentCustomers: boolean;
  hasDifferentItems: boolean;
};

export type QuantityMismatch = {
  inumber: string;
  customer: string;
  item: string;
  totalInward: number;
  totalOutward: number;
  excess: number;
};

export type CustomerBalance = {
  customer: string;
  totalInward: number;
  totalOutward: number;
  remaining: number;
  dispatchPercent: number;
};

export type StaleRecord = {
  id: string;
  inumber: string;
  customer: string;
  item: string;
  addDate: string;
  quantity: number;
  dispatched: number;
  remaining: number;
  ageInDays: number;
};

export type EmptyQuantityFlag = {
  id: string;
  type: "inward" | "outward";
  number: string;
  customer: string;
  item: string;
  quantity: string;
  date: string;
};

export type UserActivity = {
  email: string;
  userName: string;
  creates: number;
  updates: number;
  deletes: number;
  total: number;
};

export type QuantityChangeLog = {
  id: string;
  entity: string;
  entityId: string;
  inumber: string;
  customer: string;
  item: string;
  userName: string;
  oldQty: string;
  newQty: string;
  createdAt: string;
};

export type DailyEntrySummary = {
  email: string;
  userName: string;
  inwardCreates: number;
  inwardUpdates: number;
  inwardDeletes: number;
  outwardCreates: number;
  outwardUpdates: number;
  outwardDeletes: number;
};

export type RecentlyDeletedRecord = {
  id: string;
  entity: string;
  entityId: string;
  inumber: string;
  customer: string;
  item: string;
  quantity: string;
  userName: string;
  userEmail: string;
  createdAt: string;
};

export type MissingRateAlert = {
  id: string;
  inumber: string;
  customer: string;
  item: string;
  addDate: string;
  store_rate: string;
  labour_rate: string;
  missingStore: boolean;
  missingLabour: boolean;
};

export type RateChangeLog = {
  id: string;
  entity: string;
  entityId: string;
  inumber: string;
  customer: string;
  item: string;
  userName: string;
  oldStoreRate: string;
  newStoreRate: string;
  oldLabourRate: string;
  newLabourRate: string;
  createdAt: string;
};

export type Props = {
  stats: Stats;
  topCustomers: TopCustomer[];
  monthlyTrends: MonthlyTrend[];
  topItems: TopItem[];
  todayActivity: TodayActivity;
  monthChange: MonthChange;
  customerGrowth: CustomerGrowth[];
  orphanedOutward: OrphanedOutward[];
  duplicateAlerts: DuplicateAlert[];
  quantityMismatches: QuantityMismatch[];
  customerBalances: CustomerBalance[];
  staleRecords: StaleRecord[];
  emptyQuantityFlags: EmptyQuantityFlag[];
  userActivityScoreboard: UserActivity[];
  quantityChangeLogs: QuantityChangeLog[];
  dailyEntrySummary: DailyEntrySummary[];
  recentlyDeleted: RecentlyDeletedRecord[];
  missingRateAlerts: MissingRateAlert[];
  rateChangeLogs: RateChangeLog[];
  customerStock: CustomerStock[];
};
