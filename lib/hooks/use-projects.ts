"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getCanvasStore, type CreateProjectInput } from "@/lib/store";

const PROJECTS_KEY = ["projects"] as const;

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: () => getCanvasStore().listProjects(),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id] as const,
    queryFn: () => getCanvasStore().getProject(id),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => getCanvasStore().createProject(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getCanvasStore().deleteProject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}
