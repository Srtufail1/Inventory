import Link from "next/link";
import React from "react";
import { auth, signOut } from "../../auth";

const AppBar = async () => {
  const session = await auth();
  return (
    <div className="app-toolbar">
      {session && session?.user ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full gradient-primary text-white text-sm font-bold">
            {session.user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground leading-tight">{session?.user?.name}</span>
            <span className="text-xs text-muted-foreground leading-tight">Welcome back</span>
          </div>
        </div>
      ) : (
        <h2 className="text-foreground font-semibold text-sm">ZamZam Cold Storage</h2>
      )}

      <div className="ml-auto">
        {session && session?.user ? (
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button type="submit" className="text-sm font-medium px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200">
              Sign Out
            </button>
          </form>
        ) : (
          <div className="flex gap-2">
            <Link href="/signup" className="text-sm font-medium px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200">
              Sign Up
            </Link>
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppBar;
