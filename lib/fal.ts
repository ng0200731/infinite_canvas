import "server-only";

import { fal } from "@fal-ai/client";

import { env } from "@/lib/env";

/**
 * Server-only Fal.ai wrapper. The FAL_KEY never leaves the server.
 * Endpoints are inlined in generateImage() — confirm current IDs on Fal's model
 * registry: flux/schnell (text→image), flux-pro/kontext (image edit via image_url).
 */
export type GenerateModel = "flux" | "flux-kontext";

export interface GenerateInput {
  model: GenerateModel;
  prompt: string;
  /** Optional reference image (enables Flux Kontext image editing). */
  imageUrl?: string | null;
}

export interface GenerateOutput {
  url: string;
}

let configured = false;
function ensureConfig() {
  if (configured) return;
  fal.config({ credentials: env.FAL_KEY });
  configured = true;
}

export async function generateImage(input: GenerateInput): Promise<GenerateOutput> {
  ensureConfig();

  // Branch on literal endpoints so the client's generated input types resolve.
  const response = input.imageUrl
    ? await fal.subscribe("fal-ai/flux-pro/kontext", {
        input: { prompt: input.prompt, image_url: input.imageUrl },
      })
    : await fal.subscribe("fal-ai/flux/schnell", {
        input: { prompt: input.prompt, image_size: "landscape_4_3" },
      });

  const data = response.data as { images?: { url: string }[] } | undefined;
  const url = data?.images?.[0]?.url;
  if (!url) {
    throw new Error("The model did not return an image.");
  }
  return { url };
}
