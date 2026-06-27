import type { Edge, Node } from "@xyflow/react";

/** Registered canvas node type identifiers (kept in sync with the registry). */
export type NodeType = "note" | "image" | "group" | "generate";

// ── Per-type node data ───────────────────────────────────────────────────
// Each carries an index signature so the type satisfies React Flow v12's
// `Record<string, unknown>` data constraint; declared fields keep their types.
export interface NoteNodeData {
  text: string;
  [key: string]: unknown;
}

export interface ImageNodeData {
  url: string | null;
  alt?: string;
  [key: string]: unknown;
}

export interface GroupNodeData {
  label: string;
  [key: string]: unknown;
}

export interface GenerateNodeData {
  prompt: string;
  model: string;
  references: string[];
  status: "idle" | "loading" | "error" | "done";
  resultUrl: string | null;
  error?: string;
  [key: string]: unknown;
}

// ── Generic shapes used by the persistence layer ─────────────────────────
export type CanvasNode = Node<Record<string, unknown>, NodeType>;
export type CanvasEdge = Edge;

export interface CanvasContent {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export const EMPTY_CANVAS_CONTENT: CanvasContent = { nodes: [], edges: [] };

// ── Per-type node shapes for typed components ────────────────────────────
export type NoteCanvasNode = Node<NoteNodeData, "note">;
export type ImageCanvasNode = Node<ImageNodeData, "image">;
export type GroupCanvasNode = Node<GroupNodeData, "group">;
export type GenerateCanvasNode = Node<GenerateNodeData, "generate">;
