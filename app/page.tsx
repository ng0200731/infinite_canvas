import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isFalConfigured, isSupabaseConfigured } from "@/lib/env";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-zinc-500 dark:border-white/10 dark:text-zinc-400">
          MVP
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          A node-based canvas for AI image workflows
        </h1>
        <p className="max-w-md text-pretty text-zinc-600 dark:text-zinc-400">
          Arrange prompts, reference images, and generation nodes on an infinite canvas.
        </p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Button size="lg" render={<Link href="/projects" />}>
          Open the canvas
        </Button>
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          {isSupabaseConfigured ? "Supabase connected" : "Local/demo mode"} ·{" "}
          {isFalConfigured ? "AI generation on" : "AI generation off (add FAL_KEY)"}
        </p>
      </div>
    </main>
  );
}
