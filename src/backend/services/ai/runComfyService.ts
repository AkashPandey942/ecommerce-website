// src/services/runComfyService.ts
import { env } from "@/shared/config/env";

// Node IDs from ComfyUI Workflow (Customize based on your workflow_api.json)
const DEFAULT_MODEL_ID = "blackforestlabs/flux-1-kontext/pro/edit";
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
  category?: string;
  outputFormat?: "single" | "triple" | "multi-view";
  outputCount?: number;
  userPoint?: { x: number; y: number } | null;
  clothingPoint?: { x: number; y: number } | null;
}) {
  const mergedPrompt = [params.prompt, params.style, params.background, params.category ? `Category: ${params.category}` : ""]
    .filter(Boolean)
    .join(", ")
    .trim();

  const aiStudioPrompt = mergedPrompt || "fashion e-commerce product generation";

  const isVirtualTryOn = params.mode === "Virtual Try-On";
  const requestedCount = Math.max(1, Math.min(8, params.outputCount || (params.outputFormat === "single" ? 1 : params.outputFormat === "triple" ? 3 : 6)));
  const genderHint = mapGenderToPromptSubject(params.gender);
  const isKidsMode = (params.gender || "").toLowerCase() === "kids";
  const viewHint =
    params.outputFormat === "single"
      ? "front view"
      : params.outputFormat === "triple"
        ? "front, side, and back views"
        : "multi-view (front, side, back, and detailed angles)";
  const categoryHint = params.category || "garment";

  return {
    prompt: isVirtualTryOn
      ? [
          ...(isKidsMode
            ? [
                "Use the EXACT SAME person from the input image.",
                "Do NOT change the face, age, or identity.",
                "The person must remain a child (kid), same face, same body.",
                "Apply the given garment on this exact person naturally.",
                "Keep original pose and proportions.",
                "Ultra realistic, do not generate a new model.",
              ]
            : [
                "A highly realistic image of the SAME person from the input photo wearing the provided garment.",
                "Preserve the exact face, identity, skin tone, hairstyle, and body shape. Do not change the person.",
                `The person is ${genderHint}, with natural and accurate body proportions.`,
                `The garment belongs to the category: ${categoryHint}, and must be applied correctly on the body.`,
                "The clothing should fit naturally with realistic fabric draping, folds, and alignment according to the body posture.",
                "Ensure proper placement of sleeves, collar, waistline, and overall structure of the garment.",
                "Maintain consistent lighting, shadows, and perspective between the person and the clothing.",
                "The final image should look like a real photograph taken in a studio.",
                `Camera view: ${viewHint}.`,
                "Ultra realistic, high quality, detailed fabric texture, sharp focus, fashion photography, 4k quality.",
              ]),
          mergedPrompt,
        ]
          .filter(Boolean)
          .join(" ")
      : aiStudioPrompt,
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
  category?: string;
  outputFormat?: "single" | "triple" | "multi-view";
  outputCount?: number;
  userPoint?: { x: number; y: number } | null;
  clothingPoint?: { x: number; y: number } | null;
}) {
  const input = buildModelPayload(params);
  const isVirtualTryOn = params.mode === "Virtual Try-On";

  if (!isVirtualTryOn) {
    return {
      input,
      ...input,
    };
  }

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
    },
    ...input,
    ...vtonWorkflow,
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
            category: params.category,
            outputFormat: params.outputFormat,
            outputCount: params.outputCount,
            userPoint: params.userPoint,
            clothingPoint: params.clothingPoint,
          })
        : buildModelPayload({
            garmentImageUrl: params.garmentImageUrl,
            modelImageUrl: params.modelImageUrl,
            prompt: params.prompt,
            style: params.style,
            background: params.background,
            mode: params.mode,
            gender: params.gender,
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
            "Authorization": `Bearer ${config.apiKey}`,
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
