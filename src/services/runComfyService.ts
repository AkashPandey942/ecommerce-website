// src/services/runComfyService.ts
import { env } from "@/config/env";

// Node IDs from ComfyUI Workflow (Customize based on your workflow_api.json)
const NODES = {
  GARMENT_IMAGE: "5", // Example Node ID
  MODEL_IMAGE: "12",  // Example Node ID
};

export const runComfyService = {
  /**
   * Phase 1: Submit the workflow to RunComfy.
   */
  async triggerWorkflow(params: {
    garmentImageUrl: string;
    modelImageUrl: string;
  }) {
    try {
      const response = await fetch(`https://runcomfy.com/api/prod/v1/deployments/${env.RUNCOMFY_DEPLOYMENT_ID}/inference`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RUNCOMFY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          overrides: {
            [NODES.GARMENT_IMAGE]: { inputs: { image: params.garmentImageUrl } },
            [NODES.MODEL_IMAGE]: { inputs: { image: params.modelImageUrl } },
          },
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`RunComfy Submission Error: ${err}`);
      }

      const data = await response.json();
      return data.request_id; // Return the polling ID
    } catch (error) {
      console.error("❌ [runComfyService] triggerWorkflow Error:", error);
      throw error;
    }
  },

  /**
   * Phase 2: Check the status of a request.
   */
  async checkStatus(requestId: string) {
    try {
      const response = await fetch(`https://runcomfy.com/api/prod/v1/requests/${requestId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${env.RUNCOMFY_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to check RunComfy status");
      }

      const data = await response.json();
      
      // Map RunComfy states to our internal states
      // Possible states: "queued", "processing", "completed", "failed"
      return {
        status: data.status,
        outputImage: data.outputs?.[0]?.url || null, // Assumes first output is the image
        error: data.error || null
      };
    } catch (error) {
      console.error("❌ [runComfyService] checkStatus Error:", error);
      throw error;
    }
  }
};
