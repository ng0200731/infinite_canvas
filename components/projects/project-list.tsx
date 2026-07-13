"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FolderOpen, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { useDeleteProject, useProjects } from "@/lib/hooks/use-projects";
import { formatDate } from "@/lib/format";
import type { Project } from "@/lib/store";

function displayValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not set";
}

function formatCurrency(project: Project): string {
  if (!project.currencyCode) return "Not set";
  return project.currencySymbol
    ? `${project.currencyCode} (${project.currencySymbol})`
    : project.currencyCode;
}

function fuzzyMatch(value: string, query: string): boolean {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  const haystack = value.toLocaleLowerCase();
  if (haystack.includes(needle)) return true;
  let index = 0;
  for (const character of haystack) {
    if (character === needle[index]) index += 1;
    if (index === needle.length) return true;
  }
  return false;
}

function getProjectSearchText(project: Project): string {
  return [
    project.customerName,
    project.employeeName,
    project.employeeTitle,
    project.employeeEmail,
    project.employeeTel,
    project.name,
    project.currencyCode,
    project.currencyName,
    project.currencySymbol,
    project.destinationCountryCode,
    project.destinationCountryName,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ");
}

function ProjectTable({
  projects,
  onOpenProject,
}: {
  projects: Project[];
  onOpenProject?: (projectId: string) => void;
}) {
  const del = useDeleteProject();
  const [query, setQuery] = useState("");
  const visibleProjects = projects.filter((project) =>
    fuzzyMatch(getProjectSearchText(project), query),
  );

  async function onDelete(projectId: string) {
    await del.mutateAsync(projectId);
    toast.success("Project deleted");
  }

  return (
    <div className="bg-card overflow-hidden rounded-lg border shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="bg-muted/60 text-muted-foreground border-b text-xs font-medium tracking-wide uppercase">
            <tr>
              <th scope="col" colSpan={6} className="px-4 py-3">
                <div className="relative max-w-md">
                  <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Fuzzy search projects"
                    aria-label="Fuzzy search projects"
                    className="bg-background h-9 pl-8 text-sm normal-case"
                  />
                </div>
              </th>
            </tr>
            <tr>
              <th scope="col" className="px-4 py-3">
                Customer name
              </th>
              <th scope="col" className="px-4 py-3">
                Employee name
              </th>
              <th scope="col" className="px-4 py-3">
                Project name
              </th>
              <th scope="col" className="px-4 py-3">
                Currency
              </th>
              <th scope="col" className="px-4 py-3">
                Destination
              </th>
              <th scope="col" className="w-28 px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {visibleProjects.length ? (
              visibleProjects.map((project) => (
                <tr key={project.id} className="hover:bg-muted/35 transition-colors">
                  <td className="max-w-56 px-4 py-3 align-top font-medium break-words">
                    {displayValue(project.customerName)}
                  </td>
                  <td className="max-w-56 px-4 py-3 align-top break-words">
                    <span className="font-medium">{displayValue(project.employeeName)}</span>
                    {project.employeeTitle || project.employeeEmail ? (
                      <span className="text-muted-foreground mt-1 block text-xs">
                        {[project.employeeTitle, project.employeeEmail].filter(Boolean).join(" / ")}
                      </span>
                    ) : null}
                  </td>
                  <td className="max-w-64 px-4 py-3 align-top">
                    {onOpenProject ? (
                      <button
                        type="button"
                        onClick={() => onOpenProject(project.id)}
                        className="focus-visible:ring-ring hover:text-primary rounded-sm text-left font-medium break-words outline-none focus-visible:ring-2"
                      >
                        {project.name}
                      </button>
                    ) : (
                      <Link
                        href={`/projects/${project.id}`}
                        className="focus-visible:ring-ring hover:text-primary rounded-sm font-medium break-words outline-none focus-visible:ring-2"
                      >
                        {project.name}
                      </Link>
                    )}
                    <span className="text-muted-foreground mt-1 block text-xs">
                      Updated {formatDate(project.updatedAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">{formatCurrency(project)}</td>
                  <td className="max-w-48 px-4 py-3 align-top break-words">
                    {displayValue(project.destinationCountryName)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex justify-end gap-1">
                      {onOpenProject ? (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Open ${project.name}`}
                          onClick={() => onOpenProject(project.id)}
                        >
                          <ArrowUpRight />
                        </Button>
                      ) : (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Open ${project.name}`}
                          render={<Link href={`/projects/${project.id}`} />}
                        >
                          <ArrowUpRight />
                        </Button>
                      )}
                      <ConfirmDialog
                        title="Delete project?"
                        description="This permanently deletes the project and all of its canvases."
                        onConfirm={() => onDelete(project.id)}
                        trigger={
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Delete ${project.name}`}
                          >
                            <Trash2 />
                          </Button>
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-muted-foreground px-4 py-10 text-center">
                  No matching projects.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProjectList({
  redirectOnCreate = true,
  onOpenProject,
  onProjectCreated,
}: {
  redirectOnCreate?: boolean;
  onOpenProject?: (projectId: string) => void;
  onProjectCreated?: (projectId: string) => void;
}) {
  const { data: projects, isLoading, isError, error } = useProjects();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Workspace
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
            Organize canvases for products, suppliers, customers, and image workflows.
          </p>
        </div>
        <CreateProjectDialog
          redirectOnCreate={redirectOnCreate}
          onCreated={(project) => onProjectCreated?.(project.id)}
        />
      </div>

      {isLoading ? (
        <div className="bg-card rounded-lg border p-3 shadow-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="mb-2 h-11 last:mb-0" />
          ))}
        </div>
      ) : isError ? (
        <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm">
          Failed to load projects: {error instanceof Error ? error.message : "unknown error"}
        </p>
      ) : projects && projects.length > 0 ? (
        <ProjectTable projects={projects} onOpenProject={onOpenProject} />
      ) : (
        <div className="bg-card flex min-h-80 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center shadow-sm">
          <div className="bg-accent text-accent-foreground flex size-12 items-center justify-center rounded-lg">
            <FolderOpen className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-base font-medium">No projects yet</p>
            <p className="text-muted-foreground max-w-sm text-sm">
              Create your first project to start arranging canvas nodes.
            </p>
          </div>
          <CreateProjectDialog
            redirectOnCreate={redirectOnCreate}
            onCreated={(project) => onProjectCreated?.(project.id)}
          />
        </div>
      )}
    </div>
  );
}
