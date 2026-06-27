"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getCanvasStore, type CreateCanvasInput } from "@/lib/store";

export function useCanvases(projectId: string) {
  return useQuery({
    queryKey: ["canvases", projectId] as const,
    queryFn: () => getCanvasStore().listCanvases(projectId),
    enabled: Boolean(projectId),
  });
}

export function useCreateCanvas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCanvasInput) => getCanvasStore().createCanvas(input),
    onSuccess: (canvas) => qc.invalidateQueries({ queryKey: ["canvases", canvas.projectId] }),
  });
}

export function useDeleteCanvas(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => getCanvasStore().deleteCanvas(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["canvases", projectId] }),
  });
}
