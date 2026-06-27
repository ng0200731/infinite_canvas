import { describe, expect, it } from "vitest";

import { getCanvasStore } from "./index";
import { localCanvasStore } from "./localCanvasStore";

describe("store selector", () => {
  it("returns the local store when Supabase is not configured", () => {
    // Test environment has no Supabase env keys.
    expect(getCanvasStore()).toBe(localCanvasStore);
  });
});
