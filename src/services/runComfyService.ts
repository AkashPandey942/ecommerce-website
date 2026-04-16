// src/services/runComfyService.ts

const RUNCOMFY_API_KEY = process.env.RUNCOMFY_API_KEY || "";
const DEPLOYMENT_ID = process.env.RUNCOMFY_DEPLOYMENT_ID || "PLACEHOLDER_ID";

// Node IDs / Field names for Model API
const FIELDS = {
  GARMENT_IMAGE: "garment_image",
  MODEL_IMAGE: "model_image",
};

// Common VTON Model ID on RunComfy
const DEFAULT_MODEL_ID = "idm-vton";

export const runComfyService = {
  /**
   * Phase 1: Submit the workflow to RunComfy.
   */
  async triggerWorkflow(params: {
    garmentImageUrl: string;
    modelImageUrl: string;
  }) {
    if (!RUNCOMFY_API_KEY) {
      console.warn("⚠️ [runComfyService] Missing RUNCOMFY_API_KEY.");
      return null;
    }

    try {
      const baseUrl = process.env.RUNCOMFY_API_URL || "https://model-api.runcomfy.net/v1";
      // Using /models/{id} pattern for hosted models
      const modelId = process.env.RUNCOMFY_MODEL_ID || DEFAULT_MODEL_ID;
      const endpoint = `${baseUrl}/models/${modelId}`;
      
      console.log(`🚀 [runComfyService] Triggering Model: ${modelId}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RUNCOMFY_API_KEY.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [FIELDS.GARMENT_IMAGE]: params.garmentImageUrl,
          [FIELDS.MODEL_IMAGE]: params.modelImageUrl,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`RunComfy Model API Error: ${err}`);
      }

      const data = await response.json();
      return data.request_id || data.id; // Support both naming conventions
    } catch (error: any) {
      console.error("❌ [runComfyService] triggerWorkflow Error:", error.message);
      throw error;
    }
  },

  /**
   * Phase 2: Check the status of a request via Model API.
   */
  async checkStatus(requestId: string) {
    try {
      const baseUrl = process.env.RUNCOMFY_API_URL || "https://model-api.runcomfy.net/v1";
      // Model API status endpoint is typically /requests/{id}/status or /requests/{id}
      const response = await fetch(`${baseUrl}/requests/${requestId}/status`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${RUNCOMFY_API_KEY.trim()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check RunComfy status: ${response.status}`);
      }

      const data = await response.json();
      
      // Map RunComfy states to our internal states
      return {
        status: data.status, // "queued", "processing", "completed", "failed"
        outputImage: data.output_url || data.outputs?.[0]?.url || null,
        error: data.error || data.error_message || null
      };
    } catch (error: any) {
      console.error("❌ [runComfyService] checkStatus Error:", error.message);
      throw error;
    }
  }
};
