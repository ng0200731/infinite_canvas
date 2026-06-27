import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { CanvasList } from "@/components/projects/canvas-list";
import { ProjectHeader } from "@/components/projects/project-header";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <Link
        href="/projects"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ChevronLeft className="size-4" /> Projects
      </Link>
      <ProjectHeader projectId={id} />
      <div className="mt-8">
        <CanvasList projectId={id} />
      </div>
    </main>
  );
}
