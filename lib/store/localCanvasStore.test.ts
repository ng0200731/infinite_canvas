import { beforeEach, describe, expect, it } from "vitest";

import type { CanvasNode } from "@/lib/nodes/types";
import { localCanvasStore } from "./localCanvasStore";

beforeEach(() => localStorage.clear());

describe("localCanvasStore", () => {
  it("creates and lists projects (newest first)", async () => {
    const a = await localCanvasStore.createProject({ name: "A" });
    const b = await localCanvasStore.createProject({ name: "B" });
    const list = await localCanvasStore.listProjects();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(b.id);
    expect(list[1].id).toBe(a.id);
  });

  it("creates a canvas with empty content", async () => {
    const p = await localCanvasStore.createProject({ name: "P" });
    const c = await localCanvasStore.createCanvas({
      projectId: p.id,
      name: "Canvas",
    });
    expect(c.content.nodes).toEqual([]);
    const got = await localCanvasStore.getCanvas(c.id);
    expect(got?.name).toBe("Canvas");
    expect(got?.projectId).toBe(p.id);
  });

  it("saves and reloads canvas content", async () => {
    const p = await localCanvasStore.createProject({ name: "P" });
    const c = await localCanvasStore.createCanvas({
      projectId: p.id,
      name: "Canvas",
    });
    const node: CanvasNode = {
      id: "n1",
      type: "note",
      position: { x: 10, y: 20 },
      data: { text: "hello" },
    };
    await localCanvasStore.saveCanvasContent(c.id, { nodes: [node], edges: [] });
    const got = await localCanvasStore.getCanvas(c.id);
    expect(got?.content.nodes).toHaveLength(1);
    expect(got?.content.nodes[0].data).toEqual({ text: "hello" });
  });

  it("renames a canvas", async () => {
    const p = await localCanvasStore.createProject({ name: "P" });
    const c = await localCanvasStore.createCanvas({
      projectId: p.id,
      name: "Old",
    });
    const renamed = await localCanvasStore.renameCanvas(c.id, "New");
    expect(renamed.name).toBe("New");
    const got = await localCanvasStore.getCanvas(c.id);
    expect(got?.name).toBe("New");
  });

  it("deletes a project and cascades its canvases", async () => {
    const p = await localCanvasStore.createProject({ name: "P" });
    await localCanvasStore.createCanvas({ projectId: p.id, name: "C" });
    await localCanvasStore.deleteProject(p.id);
    expect(await localCanvasStore.listProjects()).toHaveLength(0);
    expect(await localCanvasStore.listCanvases(p.id)).toHaveLength(0);
  });

  it("returns null for missing entities", async () => {
    expect(await localCanvasStore.getProject("nope")).toBeNull();
    expect(await localCanvasStore.getCanvas("nope")).toBeNull();
  });
});
