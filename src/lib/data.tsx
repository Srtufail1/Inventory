import { LayoutDashboard, User, MonitorDown, MonitorUp, SquareLibrary } from "lucide-react";

export const sidebar = [
  { title: "Dashboard", link: "/dashboard", icon: <LayoutDashboard /> },
  { title: "Ledger", link: "/dashboard/ledger", icon: <SquareLibrary /> },
  { title: "Inward Gate Pass", link: "/dashboard/inward", icon: <MonitorDown /> },
  { title: "Outward Gate Pass", link: "/dashboard/outward", icon: <MonitorUp /> },
  // { title: "Clients", link: "/dashboard/clients", icon: <User /> },
];