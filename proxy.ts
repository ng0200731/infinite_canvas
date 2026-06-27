import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/session";

// Next.js 16 renamed the "middleware" file convention to "proxy".
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run on everything except static assets (Supabase recommended matcher).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|map)$).*)",
  ],
};
