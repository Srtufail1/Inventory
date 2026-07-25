import Link from "next/link";
import React from "react";
import { auth } from "../../auth";
import { ToolbarActions } from "@/components/PageToolbar";
import DarkModeToggle from "@/components/DarkModeToggle";

const AppBar = async () => {
  const session = await auth();
  return (
    <div className="app-toolbar">
      {session && session?.user ? (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-sm font-bold text-white">
            {session.user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold leading-tight text-foreground">
              {session?.user?.name}
            </span>
            <span className="text-xs leading-tight text-muted-foreground">
              Welcome back
            </span>
          </div>
        </div>
      ) : (
        <h2 className="text-sm font-semibold text-foreground">
          ZamZam Cold Storage
        </h2>
      )}

      {session && session?.user ? (
        <ToolbarActions />
      ) : (
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <DarkModeToggle />
          <Link
            href="/signup"
            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
};

export default AppBar;
