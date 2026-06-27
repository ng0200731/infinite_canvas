import { EMPTY_CANVAS_CONTENT, type CanvasContent } from "@/lib/nodes/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import type {
  Canvas,
  CanvasStore,
  CreateCanvasInput,
  CreateProjectInput,
  ImageRecord,
  Project,
  ProjectUpdate,
  RecordImageInput,
} from "./canvasStore";

/**
 * Supabase-backed CanvasStore. Uses the browser client; all access is scoped to
 * the signed-in user via Row Level Security (see supabase/migrations/). Canvas
 * contents (nodes + edges) are stored as a single JSON document per canvas row.
 */

interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface CanvasRow {
  id: string;
  project_id: string;
  name: string;
  content: CanvasContent | null;
  created_at: string;
  updated_at: string;
}

interface ImageRow {
  id: string;
  canvas_id: string | null;
  source: "upload" | "generated";
  url: string;
  storage_path: string | null;
  prompt: string | null;
  model: string | null;
  created_at: string;
}

const mapProject = (r: ProjectRow): Project => ({
  id: r.id,
  name: r.name,
  description: r.description,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const mapCanvas = (r: CanvasRow): Canvas => ({
  id: r.id,
  projectId: r.project_id,
  name: r.name,
  content: r.content ?? EMPTY_CANVAS_CONTENT,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const mapImage = (r: ImageRow): ImageRecord => ({
  id: r.id,
  canvasId: r.canvas_id,
  source: r.source,
  url: r.url,
  storagePath: r.storage_path,
  prompt: r.prompt,
  model: r.model,
  createdAt: r.created_at,
});

function assertNoError<T extends { error: { message: string } | null }>(
  result: T,
  context: string,
): void {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
}

export function createSupabaseCanvasStore(): CanvasStore {
  const supabase = getSupabaseBrowserClient();

  return {
    // ── Projects ────────────────────────────────────────────────────────
    async listProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, description, created_at, updated_at")
        .order("updated_at", { ascending: false });
      assertNoError({ error }, "listProjects");
      return (data as ProjectRow[]).map(mapProject);
    },

    async getProject(id) {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, description, created_at, updated_at")
        .eq("id", id)
        .maybeSingle();
      assertNoError({ error }, "getProject");
      return data ? mapProject(data as ProjectRow) : null;
    },

    async createProject(input: CreateProjectInput) {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          name: input.name.trim(),
          description: input.description?.trim() ?? null,
        })
        .select("id, name, description, created_at, updated_at")
        .single();
      assertNoError({ error }, "createProject");
      return mapProject(data as ProjectRow);
    },

    async updateProject(id, input: ProjectUpdate) {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (input.name !== undefined) patch.name = input.name;
      if (input.description !== undefined) patch.description = input.description;
      const { data, error } = await supabase
        .from("projects")
        .update(patch)
        .eq("id", id)
        .select("id, name, description, created_at, updated_at")
        .single();
      assertNoError({ error }, "updateProject");
      return mapProject(data as ProjectRow);
    },

    async deleteProject(id) {
      // Canvas/image cascade is handled at the DB level (ON DELETE CASCADE).
      const { error } = await supabase.from("projects").delete().eq("id", id);
      assertNoError({ error }, "deleteProject");
    },

    // ── Canvases ────────────────────────────────────────────────────────
    async listCanvases(projectId) {
      const { data, error } = await supabase
        .from("canvases")
        .select("id, project_id, name, content, created_at, updated_at")
        .eq("project_id", projectId)
        .order("updated_at", { ascending: false });
      assertNoError({ error }, "listCanvases");
      return (data as CanvasRow[]).map(mapCanvas);
    },

    async getCanvas(id) {
      const { data, error } = await supabase
        .from("canvases")
        .select("id, project_id, name, content, created_at, updated_at")
        .eq("id", id)
        .maybeSingle();
      assertNoError({ error }, "getCanvas");
      return data ? mapCanvas(data as CanvasRow) : null;
    },

    async createCanvas(input: CreateCanvasInput) {
      const { data, error } = await supabase
        .from("canvases")
        .insert({
          project_id: input.projectId,
          name: input.name.trim(),
          content: EMPTY_CANVAS_CONTENT,
        })
        .select("id, project_id, name, content, created_at, updated_at")
        .single();
      assertNoError({ error }, "createCanvas");
      return mapCanvas(data as CanvasRow);
    },

    async renameCanvas(id, name) {
      const { data, error } = await supabase
        .from("canvases")
        .update({ name: name.trim(), updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("id, project_id, name, content, created_at, updated_at")
        .single();
      assertNoError({ error }, "renameCanvas");
      return mapCanvas(data as CanvasRow);
    },

    async saveCanvasContent(id, content) {
      const { error } = await supabase
        .from("canvases")
        .update({ content, updated_at: new Date().toISOString() })
        .eq("id", id);
      assertNoError({ error }, "saveCanvasContent");
    },

    async deleteCanvas(id) {
      const { error } = await supabase.from("canvases").delete().eq("id", id);
      assertNoError({ error }, "deleteCanvas");
    },

    // ── Image metadata ──────────────────────────────────────────────────
    async recordImage(input: RecordImageInput) {
      const { data, error } = await supabase
        .from("images")
        .insert({
          canvas_id: input.canvasId ?? null,
          source: input.source,
          url: input.url,
          storage_path: input.storagePath ?? null,
          prompt: input.prompt ?? null,
          model: input.model ?? null,
        })
        .select("id, canvas_id, source, url, storage_path, prompt, model, created_at")
        .single();
      assertNoError({ error }, "recordImage");
      return mapImage(data as ImageRow);
    },
  };
}
