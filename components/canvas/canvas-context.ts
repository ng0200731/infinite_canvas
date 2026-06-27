"use client";

import { createContext, useContext } from "react";

export interface CanvasActions {
  /** Patch a node's data object (shallow merge). */
  updateNodeData: (id: string, patch: Record<string, unknown>) => void;
  /** Spawn an image node next to `parentId` carrying `url` (e.g. a generation result). */
  spawnImageNode: (parentId: string, url: string, meta: { prompt: string; model: string }) => void;
  /** Remove a node and any wires connected to it. */
  deleteNode: (id: string) => void;
  /** Remove a single wire (edge) between nodes. */
  deleteEdge: (id: string) => void;
}

export const CanvasActionsContext = createContext<CanvasActions | null>(null);

export function useCanvasActions(): CanvasActions {
  const ctx = useContext(CanvasActionsContext);
  if (!ctx) {
    throw new Error("useCanvasActions must be used within CanvasActionsContext");
  }
  return ctx;
}
