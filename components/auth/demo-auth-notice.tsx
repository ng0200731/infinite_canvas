import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Shown on /login and /signup when running without Supabase (demo mode). */
export function DemoAuthNotice() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border p-6 text-center">
      <h1 className="text-xl font-semibold tracking-tight">No authentication in demo mode</h1>
      <p className="text-muted-foreground text-sm">
        Add Supabase keys to <code>.env.local</code> to enable sign in and sign up. For now, jump
        straight into the canvas — your work is saved in this browser.
      </p>
      <Button className="h-10 w-full" render={<Link href="/projects" />}>
        Open the canvas
      </Button>
    </div>
  );
}
