"use client";

import Link from "next/link";

import { signOut } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";

export function AppHeader({ email, authEnabled }: { email: string | null; authEnabled: boolean }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <Link href="/projects" className="text-sm font-semibold tracking-tight hover:opacity-80">
        Canvas
      </Link>
      <div className="flex items-center gap-3">
        {authEnabled && email ? (
          <>
            <span className="text-muted-foreground hidden text-xs sm:inline">{email}</span>
            <form action={signOut}>
              <Button size="sm" variant="ghost" type="submit">
                Sign out
              </Button>
            </form>
          </>
        ) : (
          <span className="text-muted-foreground text-xs">Demo mode</span>
        )}
      </div>
    </header>
  );
}
