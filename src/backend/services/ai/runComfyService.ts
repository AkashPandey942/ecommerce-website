// src/services/runComfyService.ts
import { env } from "@/shared/config/env";

// Node IDs from ComfyUI Workflow (Customize based on your workflow_api.json)
const DEFAULT_MODEL_ID = "blackforestlabs/flux-1-kontext/pro/edit";

type RunComfyStatus = "queued" | "processing" | "completed" | "failed";

const MODEL_API_BASE_URL = "https://model-api.runcomfy.net/v1";

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function getRunComfyBaseUrl() {
  const configured = env.VITE_RUNCOMFY_API_URL?.trim();
  return normalizeBaseUrl(configured || MODEL_API_BASE_URL);
}

function isUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function scoreCandidate(url: string, sourceHint: string) {
  let score = 0;
  const composite = `${sourceHint} ${url}`.toLowerCase();

  // Prioritize final/generated assets.
  if (/(output|result|generated|tryon|try-on|final|render|prediction|preview)/.test(composite)) {
    score += 4;
  }

  // De-prioritize references and inputs that often appear in payload echoes.
  if (/(input|garment|cloth|mask|source|original|ref|reference|upload)/.test(composite)) {
    score -= 6;
  }

  return score;
}

function mapRunComfyStatus(statusRaw: string | undefined): RunComfyStatus {
  const status = (statusRaw || "").toLowerCase();

  if (["completed", "succeeded", "success"].includes(status)) {
    return "completed";
  }

  if (["failed", "error", "cancelled", "canceled"].includes(status)) {
    return "failed";
  }

  if (["in_queue", "queued", "pending"].includes(status)) {
    return "queued";
  }

  return "processing";
}

async function parseErrorResponse(response: Response) {
  const bodyText = await response.text();

  if (!bodyText) {
    return `${response.status} ${response.statusText}`;
  }

  try {
    const parsed = JSON.parse(bodyText) as { message?: string; error?: string; detail?: string };
    return parsed.message || parsed.error || parsed.detail || bodyText;
  } catch {
    return bodyText;
  }
}

function extractOutputImage(payload: unknown): string | null {
  const images = extractOutputImages(payload);
  return images[0] || null;
}

function extractOutputImages(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = payload as Record<string, unknown>;
  const candidates: Array<{ url: string; score: number }> = [];

  const appendUrl = (value: unknown, sourceHint = "") => {
    if (typeof value === "string" && isUrl(value) && !candidates.some((entry) => entry.url === value)) {
      candidates.push({ url: value, score: scoreCandidate(value, sourceHint) });
    }
  };

  const directOutput = data.output as Record<string, unknown> | undefined;
  appendUrl(directOutput?.image, "output.image");

  const videos = directOutput?.videos;
  if (Array.isArray(videos)) {
    videos.forEach((entry) => appendUrl(entry, "output.videos[]"));
  }

  if (Array.isArray(data.outputs)) {
    data.outputs.forEach((entry) => {
      const result = entry as Record<string, unknown> | undefined;
      appendUrl(result?.url, "outputs[].url");
    });
  }

  const outputs = data.outputs as Record<string, unknown> | undefined;
  if (outputs && typeof outputs === "object") {
    for (const nodeOutput of Object.values(outputs)) {
      if (!nodeOutput || typeof nodeOutput !== "object") continue;
      const node = nodeOutput as Record<string, unknown>;

      const images = node.images;
      if (Array.isArray(images)) {
        images.forEach((entry) => {
          const image = entry as Record<string, unknown> | undefined;
          appendUrl(image?.url, "outputs.*.images[].url");
        });
      }
    }
  }

  // Deep scan fallback for provider payload variants.
  const walk = (value: unknown, path: string) => {
    if (!value) return;

    if (typeof value === "string") {
      appendUrl(value, path);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry, index) => walk(entry, `${path}[${index}]`));
      return;
    }

    if (typeof value === "object") {
      for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
        walk(nested, path ? `${path}.${key}` : key);
      }
    }
  };

  walk(payload, "");

  return candidates
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.url);
}

type RunComfySubmitResponse = {
  request_id?: string;
  id?: string;
  status_url?: string;
  error_code?: number;
  error_message?: string;
  detail?: unknown;
};

function buildModelPayload(params: {
  garmentImageUrl: string;
  modelImageUrl: string;
  prompt?: string;
  style?: string;
  background?: string;
  mode?: "Virtual Try-On" | "AI Studio";
  category?: string;
  outputFormat?: "single" | "triple" | "multi-view";
  outputCount?: number;
}) {
  const mergedPrompt = [params.prompt, params.style, params.background, params.category ? `Category: ${params.category}` : ""]
    .filter(Boolean)
    .join(", ")
    .trim();

  const virtualTryOnPrompt = [
    "Create a photorealistic virtual try-on result.",
    "Keep the same person identity, body proportions, skin tone, face, hair, and pose from the person image.",
    "Transfer the garment fabric, texture, wrinkles, fit, and drape from the garment image onto the person naturally.",
    "Preserve realistic lighting and shadows from the original person scene.",
    "Do not output isolated clothing product image.",
    mergedPrompt,
  ]
    .filter(Boolean)
    .join(" ");

  const aiStudioPrompt = mergedPrompt || "fashion e-commerce product generation";

  const isVirtualTryOn = params.mode === "Virtual Try-On";
  const requestedCount = Math.max(1, Math.min(8, params.outputCount || (params.outputFormat === "single" ? 1 : params.outputFormat === "triple" ? 3 : 6)));

  return {
    prompt: isVirtualTryOn ? virtualTryOnPrompt : aiStudioPrompt,
    task: isVirtualTryOn ? "virtual_try_on" : "fashion_generation",
    mode: isVirtualTryOn ? "virtual_try_on" : "studio_generation",
    output_format: params.outputFormat || "multi-view",
    num_outputs: requestedCount,
    output_count: requestedCount,
    image_url: params.garmentImageUrl,
    model_image_url: params.modelImageUrl,
    garment_image_url: params.garmentImageUrl,
    person_image_url: params.modelImageUrl,
    human_image_url: params.modelImageUrl,
    cloth_image_url: params.garmentImageUrl,
    person: params.modelImageUrl,
    garment: params.garmentImageUrl,
    input_person_image: params.modelImageUrl,
    input_garment_image: params.garmentImageUrl,
  };
}

function normalizeSubmitResponse(data: RunComfySubmitResponse, requestPathPrefix: string) {
  if (typeof data.error_code === "number" || data.error_message) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : data.detail
          ? JSON.stringify(data.detail)
          : "";
    throw new Error(
      `RunComfy request rejected${data.error_code ? ` (${data.error_code})` : ""}: ${data.error_message || "Unknown error"}${detail ? ` | detail: ${detail}` : ""}`
    );
  }

  if (data.status_url && isUrl(data.status_url)) {
    return data.status_url;
  }

  if (data.request_id) {
    return `${requestPathPrefix}/${data.request_id}/status`;
  }

  if (data.id) {
    return `${requestPathPrefix}/${data.id}/status`;
  }

  throw new Error("RunComfy did not return request_id/status_url");
}

export const runComfyService = {
  /**
   * Phase 1: Submit the workflow to RunComfy.
   */
  async triggerWorkflow(params: {
    garmentImageUrl: string;
    modelImageUrl: string;
    prompt?: string;
    style?: string;
    background?: string;
    mode?: "Virtual Try-On" | "AI Studio";
    category?: string;
    outputFormat?: "single" | "triple" | "multi-view";
    outputCount?: number;
    userPoint?: { x: number, y: number } | null;
    clothingPoint?: { x: number, y: number } | null;
  }) {
    if (!env.VITE_RUNCOMFY_API_KEY) {
      throw new Error("VITE_RUNCOMFY_API_KEY is missing");
    }

    try {
      const baseUrl = getRunComfyBaseUrl();
      const modelId = env.VITE_RUNCOMFY_MODEL_ID || DEFAULT_MODEL_ID;
      const url = `${baseUrl}/models/${modelId}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.VITE_RUNCOMFY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildModelPayload({
          garmentImageUrl: params.garmentImageUrl,
          modelImageUrl: params.modelImageUrl,
          prompt: params.prompt,
          style: params.style,
          background: params.background,
          mode: params.mode,
          category: params.category,
          outputFormat: params.outputFormat,
          outputCount: params.outputCount,
        })),
      });

      if (!response.ok) {
        const errorText = await parseErrorResponse(response);
        throw new Error(`RunComfy submission failed: ${errorText}`);
      }

      const data = (await response.json()) as RunComfySubmitResponse;
      return normalizeSubmitResponse(data, "requests");
    } catch (error: unknown) {
      console.error("❌ [runComfyService] triggerWorkflow Error:", error);
      throw error;
    }
  },

  /**
   * Phase 2: Check the status of a request.
   */
  async checkStatus(requestId: string) {
    if (!env.VITE_RUNCOMFY_API_KEY) {
      return { status: "failed", error: "Missing RunComfy API Key" };
    }

    try {
      const baseUrl = getRunComfyBaseUrl();
      const statusUrl = isUrl(requestId)
        ? requestId
        : `${baseUrl}/${requestId.includes("/") ? requestId : `requests/${requestId}/status`}`;

      const statusResponse = await fetch(statusUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${env.VITE_RUNCOMFY_API_KEY}`,
        },
      });

      if (!statusResponse.ok) {
        const errorText = await parseErrorResponse(statusResponse);
        throw new Error(`Failed to check RunComfy status: ${errorText}`);
      }

      const statusData = (await statusResponse.json()) as {
        status?: string;
        error?: string;
        message?: string;
        result_url?: string;
      };

      const normalizedStatus = mapRunComfyStatus(statusData.status);

      if (normalizedStatus === "completed") {
        const resultUrl = statusData.result_url || statusUrl.replace(/\/status$/, "/result");

        const resultResponse = await fetch(resultUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${env.VITE_RUNCOMFY_API_KEY}`,
          },
        });

        if (!resultResponse.ok) {
          const resultErrorText = await parseErrorResponse(resultResponse);
          throw new Error(`Failed to fetch RunComfy result: ${resultErrorText}`);
        }

        const resultData = await resultResponse.json();
        const outputImages = extractOutputImages(resultData);
        const outputImage = outputImages[0] || extractOutputImage(resultData);

        return {
          status: "completed" as const,
          outputImage,
          outputImages,
          error: outputImage ? null : "Generation completed but no output image URL was found",
        };
      }

      return {
        status: normalizedStatus,
        outputImage: null,
        error: statusData.error || statusData.message || null,
      };
    } catch (error: unknown) {
      console.error("❌ [runComfyService] checkStatus Error:", error);
      throw error;
    }
  }
};
