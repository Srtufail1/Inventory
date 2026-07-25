"use client";
import { sidebar } from "@/lib/data";
import { Home, LogsIcon, Menu, MonitorDown, MonitorUp, PanelLeftClose, PanelLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface SidebarProps {
  isSuperAdmin?: boolean;
}

const navigationGroups = [
  { label: "Overview", links: ["/dashboard"] },
  { label: "Operations", links: ["/dashboard/inward", "/dashboard/outward", "/dashboard/stock", "/dashboard/ledger"] },
  { label: "Finance", links: ["/dashboard/bill", "/dashboard/updatedbill", "/dashboard/invoices", "/dashboard/labour"] },
  { label: "Records", links: ["/dashboard/customer", "/dashboard/notes", "/dashboard/logs", "/dashboard/customerview"] },
  { label: "Administration", links: ["/dashboard/item-translations", "/dashboard/clients", "/dashboard/backup"] },
];

const Sidebar = ({ isSuperAdmin = false }: SidebarProps) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  // Filter sidebar items based on user role
  const filteredSidebar = sidebar.filter((item) => {
    // Hide super-admin-only links for non-super-admins
    if (
      (item.link === "/dashboard" ||
       item.link === "/dashboard/logs" ||
       item.link === "/dashboard/clients" || 
       item.link === "/dashboard/backup" ||
       item.link === "/dashboard/customerview" ||
       item.link === "/dashboard/item-translations") && 
      !isSuperAdmin
    ) {
      return false;
    }
    return true;
  });

  if (!mounted) return null;

  const navigation = (mobile = false) => (
    <nav className={`grid items-start ${mobile ? "gap-4 px-1" : collapsed ? "gap-2 px-2" : "gap-4 px-3"}`}>
      {navigationGroups.map((group) => {
        const items = filteredSidebar.filter((item) => group.links.includes(item.link));
        if (!items.length) return null;

        return (
          <section key={group.label} className={collapsed && !mobile ? "border-t pt-2 first:border-0 first:pt-0" : "space-y-1"}>
            {(mobile || !collapsed) && (
              <p className="px-3 pb-1 text-[10px] font-bold uppercase text-muted-foreground/70">
                {group.label}
              </p>
            )}
            <div className="grid gap-1">
              {items.map((item) => {
                const isActive = pathname === item.link;
                const link = (
                  <Link
                    href={item.link}
                    key={item.link}
                    title={!mobile && collapsed ? item.title : undefined}
                    className={`group relative flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors
                      ${!mobile && collapsed ? "justify-center px-2" : ""}
                      ${isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                  >
                    <span className="h-4 w-4 shrink-0 [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>
                    {(mobile || !collapsed) && <span className="truncate">{item.title}</span>}
                  </Link>
                );

                return mobile ? <SheetClose asChild key={item.link}>{link}</SheetClose> : link;
              })}
            </div>
          </section>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className={`hidden lg:block lg:sticky lg:top-0 lg:h-screen transition-all duration-300 ${collapsed ? 'lg:w-[68px]' : 'lg:w-[260px]'}`}>
      <div className="flex h-full max-h-screen flex-col">
        {/* Logo Header */}
        <div className={`relative flex h-16 items-center border-b px-4 ${collapsed ? 'justify-center' : 'justify-start'}`}>
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-foreground overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-foreground text-[10px] font-black text-background">
              ZZ
            </div>
            {!collapsed && (
              <span className="text-sm font-bold tracking-tight whitespace-nowrap animate-fade-in">
                ZamZam
              </span>
            )}
          </Link>
          <button
            onClick={toggleCollapse}
            className="absolute -right-3 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground lg:flex"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">{navigation()}</div>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t p-4">
            <div className="text-[10px] text-muted-foreground text-center">
              ZamZam Cold Storage v2.0
            </div>
          </div>
        )}
      </div>
      </div>

      <div className="fixed inset-x-3 bottom-3 z-40 flex h-16 items-center justify-around rounded-lg border bg-card/95 px-2 shadow-[0_16px_50px_rgba(15,23,42,0.22)] backdrop-blur-xl lg:hidden pb-safe">
        <Link href="/dashboard" className={`mobile-nav-link ${pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"}`}>
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link href="/dashboard/inward" className={`mobile-nav-link ${pathname === "/dashboard/inward" ? "text-primary" : "text-muted-foreground"}`}>
          <MonitorDown className="h-5 w-5" />
          <span>Inward</span>
        </Link>
        <Link href="/dashboard/outward" className={`mobile-nav-link ${pathname === "/dashboard/outward" ? "text-primary" : "text-muted-foreground"}`}>
          <MonitorUp className="h-5 w-5" />
          <span>Outward</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <button className="mobile-nav-link text-muted-foreground" aria-label="Open navigation menu">
              <Menu className="h-5 w-5" />
              <span>Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <SheetHeader className="border-b px-5 py-5 text-left">
              <SheetTitle className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground text-[11px] font-black text-background">
                  ZZ
                </span>
                ZamZam Cold Storage
              </SheetTitle>
              <SheetDescription>Inventory and operations</SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-3 py-4">{navigation(true)}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default Sidebar;