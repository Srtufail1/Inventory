import { LayoutDashboard, User, MonitorDown, MonitorUp } from "lucide-react";

export const sidebar = [
  { title: "Dashboard", link: "/dashboard", icon: <LayoutDashboard /> },
  { title: "Inward Gate Pass", link: "/dashboard/inward", icon: <MonitorDown /> },
  { title: "Outward Gate Pass", link: "/dashboard/outward", icon: <MonitorUp /> },
  // { title: "Clients", link: "/dashboard/clients", icon: <User /> },
];