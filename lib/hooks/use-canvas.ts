"use client";

import { useQuery } from "@tanstack/react-query";

import { getCanvasStore } from "@/lib/store";

export function useCanvas(canvasId: string) {
  return useQuery({
    queryKey: ["canvas", canvasId] as const,
    queryFn: () => getCanvasStore().getCanvas(canvasId),
    enabled: Boolean(canvasId),
  });
}
