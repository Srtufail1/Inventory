"use client";
import { sidebar } from "@/lib/data";
import { LogsIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface SidebarProps {
  isSuperAdmin?: boolean;
}

const Sidebar = ({ isSuperAdmin = false }: SidebarProps) => {
  const pathname = usePathname();
  
  // Filter sidebar items based on user role
  const filteredSidebar = sidebar.filter((item) => {
    // Hide super-admin-only links for non-super-admins
    if (
      (item.link === "/dashboard/clients" || 
       item.link === "/dashboard/labour" || 
       item.link === "/dashboard/backup" ||
       item.link === "/dashboard/customerview") && 
      !isSuperAdmin
    ) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <LogsIcon className="h-5 w-5" /> ZamZam Cold Storage
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-3 text-sm font-medium">
            {filteredSidebar.map((item, index) => (
              <Link
                href={item.link}
                key={index}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-muted-foreground hover:text-foreground hover:bg-muted ${
                  pathname === item.link
                    ? "bg-muted text-foreground font-semibold"
                    : ""
                }`}
              >
                <span className="h-4 w-4">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;