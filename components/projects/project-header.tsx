"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/lib/hooks/use-projects";

export function ProjectHeader({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) {
    return <Skeleton className="h-8 w-48" />;
  }

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">{project?.name ?? "Project"}</h1>
      {project?.description && (
        <p className="text-muted-foreground text-sm">{project.description}</p>
      )}
    </div>
  );
}
