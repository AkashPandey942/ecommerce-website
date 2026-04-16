// src/services/runComfyService.ts
import { env } from "@/shared/config/env";

// Node IDs from ComfyUI Workflow (Customize based on your workflow_api.json)
const NODES = {
  GARMENT_IMAGE: "5", // Example Node ID
  MODEL_IMAGE: "12",  // Example Node ID
  POINT_X: "20",      // Example Node ID for X coordinate
  POINT_Y: "21",      // Example Node ID for Y coordinate
  CLOTHING_POINT_X: "22", 
  CLOTHING_POINT_Y: "23",
};

type RunComfyStatus = "queued" | "processing" | "completed" | "failed";

type WorkflowOverrides = Record<string, { inputs: Record<string, string | number> }>;

export const runComfyService = {
  /**
   * Phase 1: Submit the workflow to RunComfy.
   */
  async triggerWorkflow(params: {
    garmentImageUrl: string;
    modelImageUrl: string;
    userPoint?: { x: number, y: number } | null;
    clothingPoint?: { x: number, y: number } | null;
  }) {
    if (!env.RUNCOMFY_API_KEY) {
      console.warn("⚠️ [runComfyService] Missing RunComfy API Key. Skipping workflow.");
      return null;
    }

    try {
      const baseUrl = env.RUNCOMFY_API_URL || "https://model-api.runcomfy.net/v1";
      // If deployment ID is present, use specialized deployment endpoint, else use standard inference
      const url = env.RUNCOMFY_DEPLOYMENT_ID 
        ? `${baseUrl}/deployments/${env.RUNCOMFY_DEPLOYMENT_ID}/inference`
        : `${baseUrl}/inferences`;

      const overrides: WorkflowOverrides = {
        [NODES.GARMENT_IMAGE]: { inputs: { image: params.garmentImageUrl } },
        [NODES.MODEL_IMAGE]: { inputs: { image: params.modelImageUrl } },
      };

      // Pass coordinates to workflow if provided
      if (params.userPoint) {
        overrides[NODES.POINT_X] = { inputs: { float: Math.round(params.userPoint.x) } };
        overrides[NODES.POINT_Y] = { inputs: { float: Math.round(params.userPoint.y) } };
      }

      if (params.clothingPoint) {
        overrides[NODES.CLOTHING_POINT_X] = { inputs: { float: Math.round(params.clothingPoint.x) } };
        overrides[NODES.CLOTHING_POINT_Y] = { inputs: { float: Math.round(params.clothingPoint.y) } };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RUNCOMFY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          overrides,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`RunComfy Submission Error: ${err}`);
      }

      const data = await response.json();
      return data.request_id || data.id || null; // Return the polling ID (RunComfy uses id or request_id)
    } catch (error: unknown) {
      console.error("❌ [runComfyService] triggerWorkflow Error:", error);
      throw error;
    }
  },

  /**
   * Phase 2: Check the status of a request.
   */
  async checkStatus(requestId: string) {
    if (!env.RUNCOMFY_API_KEY) {
      return { status: "failed", error: "Missing RunComfy API Key" };
    }

    try {
      const baseUrl = env.RUNCOMFY_API_URL || "https://model-api.runcomfy.net/v1";
      const endpoint = requestId.includes('/') ? requestId : `requests/${requestId}`;
      const response = await fetch(`${baseUrl}/${endpoint}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${env.RUNCOMFY_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check RunComfy status");
      }

      const data = await response.json();

      const outputImage =
        data.outputs?.[0]?.url ||
        data.output?.[0]?.url ||
        data.result?.images?.[0]?.url ||
        null;
      
      // Map RunComfy states to our internal states
      // Possible states: "queued", "processing", "completed", "failed"
      return {
        status: (data.status || "processing") as RunComfyStatus,
        outputImage,
        error: data.error || null,
      };
    } catch (error: unknown) {
      console.error("❌ [runComfyService] checkStatus Error:", error);
      throw error;
    }
  }
};
