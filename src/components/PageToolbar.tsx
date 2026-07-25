"use client";

import React, { ReactNode } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import DarkModeToggle from "@/components/DarkModeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Single sign-out button used by every page toolbar. Kept muted (ghost) on
 * purpose so it never competes with the primary actions on the page.
 */
export const SignOutButton = () => (
  <Button
    variant="ghost"
    size="sm"
    onClick={() => signOut()}
    title="Sign out"
    className="h-9 shrink-0 gap-1.5 px-2.5 text-muted-foreground hover:text-foreground sm:px-3"
  >
    <LogOut className="h-4 w-4" />
    <span className="hidden sm:inline">Sign Out</span>
  </Button>
);

/** Right-hand action cluster: page extras, theme toggle, sign out. */
export const ToolbarActions = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => (
  <div className={cn("ml-auto flex shrink-0 items-center gap-1", className)}>
    {children}
    <DarkModeToggle />
    <SignOutButton />
  </div>
);

interface PageToolbarProps {
  /** Small lucide icon, e.g. <Package className="h-4 w-4" />. */
  icon?: ReactNode;
  title?: string;
  /** Filters/search rendered between the title and the actions. */
  children?: ReactNode;
  /** Extra buttons placed to the left of the theme toggle. */
  actions?: ReactNode;
  className?: string;
}

const PageToolbar = ({
  icon,
  title,
  children,
  actions,
  className,
}: PageToolbarProps) => (
  <div className={cn("app-toolbar", className)}>
    {(icon || title) && (
      <div className="flex shrink-0 items-center gap-2.5">
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
            {icon}
          </span>
        )}
        {title && (
          <span className="truncate font-semibold text-foreground">{title}</span>
        )}
      </div>
    )}
    {children}
    <ToolbarActions>{actions}</ToolbarActions>
  </div>
);

export default PageToolbar;
