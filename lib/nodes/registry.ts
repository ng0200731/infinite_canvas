import type { CanvasNode, NodeType } from "./types";

export interface NodeMeta {
  type: NodeType;
  label: string;
  description: string;
  /** Shown in the palette. `generate` is enabled in M7. */
  palette: boolean;
  defaultData: () => Record<string, unknown>;
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const NODE_META: Record<NodeType, NodeMeta> = {
  note: {
    type: "note",
    label: "Note",
    description: "A text note",
    palette: true,
    defaultData: () => ({ text: "" }),
  },
  image: {
    type: "image",
    label: "Image",
    description: "Display an image",
    palette: true,
    defaultData: () => ({ url: null }),
  },
  group: {
    type: "group",
    label: "Group",
    description: "A grouping box",
    palette: true,
    defaultData: () => ({ label: "Group" }),
  },
  generate: {
    type: "generate",
    label: "Generate",
    description: "AI image generation",
    palette: true,
    defaultData: () => ({
      prompt: "",
      model: "flux",
      references: [],
      status: "idle",
      resultUrl: null,
    }),
  },
};

/** Node types surfaced in the palette (excludes `generate` until M7). */
export const PALETTE_NODE_TYPES: NodeType[] = Object.values(NODE_META)
  .filter((m) => m.palette)
  .map((m) => m.type);

export function createNode(type: NodeType, position: { x: number; y: number }): CanvasNode {
  return {
    id: uid(),
    type,
    position,
    data: NODE_META[type].defaultData(),
  };
}
