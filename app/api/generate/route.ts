import { NextResponse } from "next/server";
import { z } from "zod";

import { isFalConfigured } from "@/lib/env";
import { generateImage, type GenerateModel } from "@/lib/fal";

export const runtime = "nodejs";

const bodySchema = z.object({
  model: z.enum(["flux", "flux-kontext"]),
  prompt: z.string().min(1).max(2000),
  imageUrl: z.union([z.string().url(), z.null()]).optional(),
});

export async function POST(request: Request) {
  if (!isFalConfigured) {
    return NextResponse.json(
      { error: "AI generation is disabled. Set FAL_KEY in .env.local." },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  try {
    const { url } = await generateImage({
      model: parsed.data.model as GenerateModel,
      prompt: parsed.data.prompt,
      imageUrl: parsed.data.imageUrl ?? null,
    });
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
