// src/services/runComfyService.ts
import { env } from "@/shared/config/env";

// Node IDs from ComfyUI Workflow (Customize based on your workflow_api.json)
const DEFAULT_MODEL_ID = "blackforestlabs/flux-2/dev/text-to-image";
const MODEL_API_BASE_URL = "https://model-api.runcomfy.net/v1";
const DEPLOYMENT_API_BASE_URL = "https://api.runcomfy.net/prod/v1";

type RunComfyStatus = "queued" | "processing" | "completed" | "failed";

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function resolveBaseUrl(configuredBaseUrl: string, deploymentId?: string) {
  const cleanedConfigured = configuredBaseUrl.trim();
  const deploymentMode = Boolean(deploymentId);

  if (!cleanedConfigured) {
    return deploymentMode ? DEPLOYMENT_API_BASE_URL : MODEL_API_BASE_URL;
  }

  // When deployment mode is enabled, model-api host cannot serve /deployments/{id}/inference.
  if (deploymentMode && /model-api\.runcomfy\.net/i.test(cleanedConfigured)) {
    return DEPLOYMENT_API_BASE_URL;
  }

  return cleanedConfigured;
}

function getRunComfyConfig() {
  const apiKey = (env.RUNCOMFY_API_KEY || env.VITE_RUNCOMFY_API_KEY || "").trim();
  const deploymentId = env.RUNCOMFY_DEPLOYMENT_ID?.trim();
  const modelId = (env.RUNCOMFY_MODEL_ID || env.VITE_RUNCOMFY_MODEL_ID || DEFAULT_MODEL_ID).trim();
  const configuredBaseUrl = (env.RUNCOMFY_API_URL || env.VITE_RUNCOMFY_API_URL || "").trim();

  const baseUrl = normalizeBaseUrl(resolveBaseUrl(configuredBaseUrl, deploymentId));

  return {
    apiKey,
    deploymentId,
    modelId,
    baseUrl,
    isDeploymentMode: Boolean(deploymentId),
  };
}

function isTextToImageModel(modelId: string) {
  return /text-to-image/i.test(modelId);
}

function isNanoBananaEditModel(modelId: string) {
  return /google\/nano-banana\/pro\/edit/i.test(modelId);
}

function isSeedreamEditModel(modelId: string) {
  return /bytedance\/seedream-4-5\/edit/i.test(modelId);
}

function isImageEditModel(modelId: string) {
  return isNanoBananaEditModel(modelId) || isSeedreamEditModel(modelId);
}

function buildNanoBananaEditPayload(params: {
  garmentImageUrl: string;
  modelImageUrl: string;
  prompt?: string;
  style?: string;
  background?: string;
  mode?: "Virtual Try-On" | "AI Studio";
  gender?: "Male" | "Female" | "Kids" | "Man" | "Woman" | "Person";
  garmentType?: "Fabric" | "Ready-made";
  category?: string;
  outputFormat?: "single" | "triple" | "multi-view";
  outputCount?: number;
}) {
  const base = buildModelPayload({
    garmentImageUrl: params.garmentImageUrl,
    modelImageUrl: params.modelImageUrl,
    prompt: params.prompt,
    style: params.style,
    background: params.background,
    mode: params.mode,
    gender: params.gender,
    garmentType: params.garmentType,
    category: params.category,
    outputFormat: params.outputFormat,
    outputCount: params.outputCount,
    userPoint: null,
    clothingPoint: null,
  });

  // Pydantic error path shows this model expects `input.image_urls[0]`.
  // Provide both images to maximize conditioning: model/person first, then product reference.
  const imageUrls = [params.modelImageUrl, params.garmentImageUrl].filter(Boolean);

  const outputFormat = base.output_format || "png";
  // This model is an image edit endpoint; keep a stable mode string.
  const editMode = "edit";

  // Model validation errors show the schema expects top-level fields (prompt, image_urls, ...).
  return {
    prompt: base.prompt,
    image_urls: imageUrls,
    num_outputs: base.num_outputs,
    output_format: outputFormat,
    mode: editMode,
  };
}

function isUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function isTransientStatus(status: number) {
  // Cloudflare / gateway / overload responses that should be retried.
  return [408, 425, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524].includes(status);
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

function mapGenderToPromptSubject(value?: "Male" | "Female" | "Kids" | "Man" | "Woman" | "Person") {
  if (!value) return "person";

  const normalized = value.toLowerCase();

  if (normalized === "male" || normalized === "man") return "male";
  if (normalized === "female" || normalized === "woman") return "female";
  if (normalized === "kids") return "kid";

  return "person";
}

function buildModelPayload(params: {
  garmentImageUrl: string;
  modelImageUrl: string;
  prompt?: string;
  style?: string;
  background?: string;
  mode?: "Virtual Try-On" | "AI Studio";
  gender?: "Male" | "Female" | "Kids" | "Man" | "Woman" | "Person";
  garmentType?: "Fabric" | "Ready-made";
  category?: string;
  outputFormat?: "single" | "triple" | "multi-view";
  outputCount?: number;
  userPoint?: { x: number; y: number } | null;
  clothingPoint?: { x: number; y: number } | null;
}) {
  const requestedViewLayout = params.outputFormat || "multi-view";
  const outputImageFormat = "png";

  const mergedPrompt = (params.prompt || "").trim();

  const styleHint = params.style || "Natural";
  const backgroundHint = params.background || "studio";
  const isVirtualTryOn = params.mode === "Virtual Try-On";
  const isAIStudio = params.mode === "AI Studio";
  const requestedCount = Math.max(1, Math.min(8, params.outputCount || (params.outputFormat === "single" ? 1 : params.outputFormat === "triple" ? 3 : 6)));
  const genderHint = mapGenderToPromptSubject(params.gender);
  const isKidsMode = (params.gender || "").toLowerCase() === "kids";
  const viewHint =
    params.outputFormat === "single"
      ? "Single: Generate one high-quality image"
      : params.outputFormat === "triple"
        ? "3 Views: Generate Front, Side, Back views"
        : "6 Views: Generate Front, Back, Left, Right, Close-up, Detail views";
  const categoryHint = (params.category || "").trim();
  const garmentType = params.garmentType || "Fabric";

  const negativePrompt =
    "no face change, no body distortion, no slimming, no blur, no low-res, no waxy skin, no broken anatomy, no extra limbs, no fabric distortion, no texture stretching, no lighting mismatch";

  const virtualTryOnPrompt = [
    "Task: Redress the subject in the model/person image with the clothing from the garment/product image.",
    "Replace only the clothing while strictly preserving the subject’s face, identity, expression, body proportions, posture, and skin tone.",
    "Identity Lock (hard constraints): preserve 100% facial identity (pores, freckles, moles, micro-details); maintain exact body shape and pose; no body reshaping; no facial or anatomical alterations.",
    ...(isKidsMode ? ["If the subject is a child, keep age and identity unchanged."] : []),
    `Fabric Pipeline: ${garmentType}.`,
    ...(garmentType === "Ready-made"
      ? [
          "Ready-made: directly map the garment with accurate fit, scale, alignment, and perspective.",
          `Refine using Output Style: ${styleHint}, Output Format: ${viewHint}.`,
        ]
      : [
          `Fabric: generate garment using Person Type: ${genderHint}${categoryHint ? ` and Clothing Category: ${categoryHint}` : ""}.`,
          "Define realistic material properties (thickness, weight, elasticity, gravity-driven drape), then apply with precise tailoring, seams, and cloth simulation.",
          `Style using Output Style: ${styleHint}, Output Format: ${viewHint}.`,
        ]),
    "Rendering Fidelity: high photorealism, accurate fabric texture and color, patterns, stitching, seams; natural folds and draping; correct fit and perspective.",
    "Photography Direction: professional catalog pose (S-curve or 3/4 turn); clean studio or selected environment; soft neutral diffused lighting.",
    "Camera: 85mm prime lens look; aperture f/22 (all-in-focus clarity).",
    "Physics & Grounding: realistic cloth physics, tension lines, strong contact shadows + ambient occlusion; no floating/clipping.",
    mergedPrompt ? `AI Director Notes (optional): ${mergedPrompt}` : "",
    `Negative Prompt: ${negativePrompt}.`,
  ]
    .filter(Boolean)
    .join(" ");

  const aiStudioPrompt = [
    "Task: Apply the uploaded product/clothing image onto the exact selected model image.",
    "Do NOT generate a new person. Do NOT change the model. Do NOT change the face.",
    "Preserve the model’s face, identity, body proportions, skin tone, and pose exactly.",
    "Replace only the clothing.",
    "Ensure realistic fit, alignment, perspective, and natural fabric draping/folds/texture.",
    `Background: ${backgroundHint}. Match lighting, shadows, and color grading to the selected background.`,
    `Output Style: ${styleHint}.`,
    mergedPrompt ? `AI Director Notes: ${mergedPrompt}` : "",
    "Photography: premium fashion catalog framing, soft diffused lighting, 85mm lens look, f/22 clarity.",
    "Output: ultra-photorealistic, high-resolution, clean, artifact-free fashion image where the selected model wears the product.",
    `Negative Prompt: ${negativePrompt}, no person swap, no face swap, no pose change, no identity drift.`,
  ]
    .filter(Boolean)
    .join(" ");

  // Many image-edit model endpoints expect a single primary image to edit.
  // For AI Studio, the primary image should be the selected model (person), with the product image provided as a reference.
  const primaryImageUrl = isAIStudio ? params.modelImageUrl : params.garmentImageUrl;
  const referenceImageUrl = isAIStudio ? params.garmentImageUrl : params.modelImageUrl;

  return {
    prompt: isVirtualTryOn ? virtualTryOnPrompt : aiStudioPrompt,
    task: isVirtualTryOn ? "virtual_try_on" : "fashion_generation",
    mode: isVirtualTryOn ? "virtual_try_on" : "studio_generation",
    // RunComfy flux-2 endpoint validates output_format as image type enum: jpeg|png|webp.
    output_format: outputImageFormat,
    image_format: outputImageFormat,
    result_format: outputImageFormat,
    // Preserve requested multi-view layout semantics for downstream workflows.
    view_layout: requestedViewLayout,
    requested_view_layout: requestedViewLayout,
    num_outputs: requestedCount,
    output_count: requestedCount,
    image_url: primaryImageUrl,
    input_image_url: primaryImageUrl,
    init_image_url: primaryImageUrl,
    base_image_url: primaryImageUrl,
    source_image_url: primaryImageUrl,
    reference_image_url: referenceImageUrl,
    edit_image_url: referenceImageUrl,
    model_image_url: params.modelImageUrl,
    garment_image_url: params.garmentImageUrl,
    person_image_url: params.modelImageUrl,
    human_image_url: params.modelImageUrl,
    cloth_image_url: params.garmentImageUrl,
    product_image_url: params.garmentImageUrl,
    person: params.modelImageUrl,
    garment: params.garmentImageUrl,
    input_person_image: params.modelImageUrl,
    input_garment_image: params.garmentImageUrl,
    user_point: params.userPoint || undefined,
    cloth_point: params.clothingPoint || undefined,
    model_point: params.userPoint || undefined,
    garment_point: params.clothingPoint || undefined,
  };
}

function buildDeploymentPayload(params: {
  garmentImageUrl: string;
  modelImageUrl: string;
  prompt?: string;
  style?: string;
  background?: string;
  mode?: "Virtual Try-On" | "AI Studio";
  gender?: "Male" | "Female" | "Kids" | "Man" | "Woman" | "Person";
  garmentType?: "Fabric" | "Ready-made";
  category?: string;
  outputFormat?: "single" | "triple" | "multi-view";
  outputCount?: number;
  userPoint?: { x: number; y: number } | null;
  clothingPoint?: { x: number; y: number } | null;
}) {
  const input = buildModelPayload(params);
  const isVirtualTryOn = params.mode === "Virtual Try-On";

  const vtonWorkflow = {
    workflow_type: "virtual_try_on",
    workflow_name: "ipadapter_openpose_cloth_ksampler_output",
    pipeline: {
      steps: [
        "ipadapter",
        "openpose",
        "cloth_input",
        "ksampler",
        "output",
      ],
    },
    nodes: {
      ipadapter: {
        enabled: true,
        image_url: params.modelImageUrl,
        mode: "identity_lock",
        lock_identity: true,
        output: "identity_conditioning",
      },
      openpose: {
        enabled: true,
        image_url: params.modelImageUrl,
        lock_pose: true,
        output: "pose",
      },
      cloth_input: {
        enabled: true,
        image_url: params.garmentImageUrl,
        output: "cloth",
      },
      ksampler: {
        enabled: true,
        sampler_name: "euler",
        scheduler: "normal",
        steps: 28,
        cfg: 6,
        denoise: 0.2,
        prompt: input.prompt,
        conditioning: {
          identity_source: "ipadapter",
          pose_source: "openpose",
          cloth_source: "cloth_input",
        },
        user_point: params.userPoint || undefined,
        cloth_point: params.clothingPoint || undefined,
        output: "latent",
      },
      output: {
        enabled: true,
        decode: "vae",
        source: "ksampler",
      },
    },
    ipadapter_image_url: params.modelImageUrl,
    openpose_image_url: params.modelImageUrl,
    cloth_input_image_url: params.garmentImageUrl,
    ksampler_denoise: 0.2,
    output_source: "output",
  };

  return {
    input: {
      ...input,
      ...vtonWorkflow,
      workflow_type: isVirtualTryOn ? "virtual_try_on" : "ai_studio_try_on",
    },
    ...input,
    ...vtonWorkflow,
    workflow_type: isVirtualTryOn ? "virtual_try_on" : "ai_studio_try_on",
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
    gender?: "Male" | "Female" | "Kids" | "Man" | "Woman" | "Person";
    garmentType?: "Fabric" | "Ready-made";
    category?: string;
    outputFormat?: "single" | "triple" | "multi-view";
    outputCount?: number;
    userPoint?: { x: number, y: number } | null;
    clothingPoint?: { x: number, y: number } | null;
  }) {
    const config = getRunComfyConfig();

    if (!config.apiKey) {
      throw new Error("RUNCOMFY_API_KEY is missing");
    }

    // AI Studio / Virtual Try-On require image conditioning (product + model images).
    // The Flux "text-to-image" model endpoint ignores image inputs and will generate unrelated outfits.
    if (!config.isDeploymentMode && isTextToImageModel(config.modelId)) {
      const mode = params.mode || "AI Studio";
      throw new Error(
        `RunComfy is configured with a text-to-image model (${config.modelId}). ` +
          `${mode} requires an image-conditioned ComfyUI deployment to apply the uploaded product onto the selected model. ` +
          `Set RUNCOMFY_DEPLOYMENT_ID to your deployed try-on workflow (recommended), or switch RUNCOMFY_MODEL_ID to a workflow/model that supports image inputs.`
      );
    }

    try {
      const url = config.isDeploymentMode
        ? `${config.baseUrl}/deployments/${config.deploymentId}/inference`
        : `${config.baseUrl}/models/${config.modelId}`;

      const requestPayload = config.isDeploymentMode
        ? buildDeploymentPayload({
            garmentImageUrl: params.garmentImageUrl,
            modelImageUrl: params.modelImageUrl,
            prompt: params.prompt,
            style: params.style,
            background: params.background,
            mode: params.mode,
            gender: params.gender,
            garmentType: params.garmentType,
            category: params.category,
            outputFormat: params.outputFormat,
            outputCount: params.outputCount,
            userPoint: params.userPoint,
            clothingPoint: params.clothingPoint,
          })
        : isImageEditModel(config.modelId)
          ? buildNanoBananaEditPayload({
              garmentImageUrl: params.garmentImageUrl,
              modelImageUrl: params.modelImageUrl,
              prompt: params.prompt,
              style: params.style,
              background: params.background,
              mode: params.mode,
              gender: params.gender,
              garmentType: params.garmentType,
              category: params.category,
              outputFormat: params.outputFormat,
              outputCount: params.outputCount,
            })
          : buildModelPayload({
              garmentImageUrl: params.garmentImageUrl,
              modelImageUrl: params.modelImageUrl,
              prompt: params.prompt,
              style: params.style,
              background: params.background,
              mode: params.mode,
              gender: params.gender,
              garmentType: params.garmentType,
              category: params.category,
              outputFormat: params.outputFormat,
              outputCount: params.outputCount,
              userPoint: params.userPoint,
              clothingPoint: params.clothingPoint,
            });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorText = await parseErrorResponse(response);
        throw new Error(`RunComfy submission failed: ${errorText}`);
      }

      const data = (await response.json()) as RunComfySubmitResponse;
      return normalizeSubmitResponse(data, `${config.baseUrl}/requests`);
    } catch (error: unknown) {
      console.error("❌ [runComfyService] triggerWorkflow Error:", error);
      throw error;
    }
  },

  /**
   * Phase 2: Check the status of a request.
   */
  async checkStatus(requestId: string) {
    const config = getRunComfyConfig();

    if (!config.apiKey) {
      return { status: "failed", error: "Missing RunComfy API Key" };
    }

    try {
      const statusUrl = isUrl(requestId)
        ? requestId
        : `${config.baseUrl}/${requestId.includes("/") ? requestId : `requests/${requestId}/status`}`;

      const statusResponse = await fetch(statusUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
        },
      });

      if (!statusResponse.ok) {
        // Model API occasionally returns HTML Cloudflare error pages (e.g. 504) during long generations.
        // Treat transient HTTP errors as still processing so the UI keeps polling.
        if (isTransientStatus(statusResponse.status) || statusResponse.status === 404) {
          return {
            status: "processing" as const,
            outputImage: null,
            error: null,
          };
        }

        const errorText = await parseErrorResponse(statusResponse);
        return {
          status: "failed" as const,
          outputImage: null,
          error: `Failed to check RunComfy status: ${errorText}`,
        };
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
            "Authorization": `Bearer ${config.apiKey}`,
          },
        });

        if (!resultResponse.ok) {
          if (isTransientStatus(resultResponse.status) || resultResponse.status === 404) {
            return {
              status: "processing" as const,
              outputImage: null,
              error: null,
            };
          }

          const resultErrorText = await parseErrorResponse(resultResponse);
          return {
            status: "failed" as const,
            outputImage: null,
            error: `Failed to fetch RunComfy result: ${resultErrorText}`,
          };
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
      // Network errors / timeouts should not hard-fail polling.
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ [runComfyService] checkStatus Error:", error);

      if (/timeout|timed out|gateway time-?out|cloudflare|fetch failed|ECONNRESET|ENOTFOUND/i.test(message)) {
        return {
          status: "processing" as const,
          outputImage: null,
          error: null,
        };
      }

      return {
        status: "failed" as const,
        outputImage: null,
        error: message,
      };
    }
  }
};
