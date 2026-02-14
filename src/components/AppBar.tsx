import Link from "next/link";
import React from "react";
import { auth, signOut } from "../../auth";

const AppBar = async () => {
  const session = await auth();
  return (
    <div className="flex justify-between w-full h-14 lg:h-16 items-center border-b bg-muted/40 px-6">
      {session && session?.user ? (
        <h2 className="text-foreground font-medium">Welcome {session?.user?.name}</h2>
      ) : (
        <h2 className="text-foreground font-medium">Welcome to ZamZam Cold Storage</h2>
      )}

      <div className="ml-auto">
        {session && session?.user ? (
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button type="submit" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign Out</button>
          </form>
        ) : (
          <div className="flex gap-4">
            <Link href="/signup" className="font-bold text-foreground hover:text-primary transition-colors">
              Sign Up
            </Link>
            <Link href="/login" className="font-bold text-foreground hover:text-primary transition-colors">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppBar;
