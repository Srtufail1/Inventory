import { LayoutDashboard, User, MonitorDown, MonitorUp, SquareLibrary, ReceiptText, Users, Hammer, DatabaseBackup, Eye } from "lucide-react";

export const sidebar = [
  { title: "Dashboard", link: "/dashboard", icon: <LayoutDashboard /> },
  { title: "Inward Gate Pass", link: "/dashboard/inward", icon: <MonitorDown /> },
  { title: "Outward Gate Pass", link: "/dashboard/outward", icon: <MonitorUp /> },
  { title: "Ledger", link: "/dashboard/ledger", icon: <SquareLibrary /> },
  { title: "Customers", link: "/dashboard/customer", icon: <Users /> },
  { title: "Bill", link: "/dashboard/bill", icon: <ReceiptText /> },
  { title: "Customer View", link: "/dashboard/customerview", icon: <Eye /> },
  { title: "Labour Bill", link: "/dashboard/labour", icon: <Hammer /> },
  { title: "Clients", link: "/dashboard/clients", icon: <User /> },
  { title: "Backup", link: "/dashboard/backup", icon: <DatabaseBackup /> },
];