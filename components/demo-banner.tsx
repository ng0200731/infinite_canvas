"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { usingLocalStore } from "@/lib/store";

/** Dismissible amber banner shown in local/demo mode (no Supabase configured). */
export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (!usingLocalStore || dismissed) return null;

  return (
    <div className="flex items-center justify-center gap-3 border-b bg-amber-100 px-4 py-2 text-center text-xs text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
      <span>
        <strong>Demo mode:</strong> projects are saved in this browser only. Add Supabase keys (
        <code>.env.local</code>) to sync to the cloud.
      </span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        className="shrink-0 opacity-70 hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
