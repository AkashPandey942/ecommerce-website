import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { runComfyService } from "@/backend/services/ai/runComfyService";
import { generationService } from "@/backend/services/generationService";

export const GenerateController = {
  async handleGeneration(request: Request) {
    try {
      const session = await getServerSession(authOptions);

      const { modelId, background, style, prompt, garmentImageUrl, modelImageUrl, mode, userPoint, clothingPoint } = await request.json();

      if (!garmentImageUrl) {
        return NextResponse.json({ success: false, error: "Garment image is required" }, { status: 400 });
      }

      if (!modelImageUrl && mode === "Virtual Try-On") {
        return NextResponse.json({ success: false, error: "Model image is required for virtual try-on" }, { status: 400 });
      }

      const userId = session?.user?.id ?? "guest-user";

      // 1. Phase 1: Create record in MongoDB and deduct credits
      const jobId = await generationService.createJob(userId, {
        inputImage: garmentImageUrl,
        modelId: modelId || "custom",
        background: background || "default",
        outputStyle: style || "Catalog",
        prompt: prompt || "",
      });

      // 2. Trigger RunComfy workflow
      const requestId = await runComfyService.triggerWorkflow({
        garmentImageUrl,
        modelImageUrl: modelImageUrl || garmentImageUrl,
        userPoint,
        clothingPoint
      });

      if (!requestId) {
        await generationService.updateJob(jobId, {
          status: "failed",
          error: "Failed to start generation request",
        });
        return NextResponse.json({ success: false, error: "Failed to start generation request" }, { status: 502 });
      }

      // 3. Update job with RunComfy requestId
      await generationService.updateJob(jobId, { 
        requestId,
        status: "processing" 
      });

      return NextResponse.json({ 
        success: true, 
        jobId, 
        requestId 
      });

    } catch (error: unknown) {
      console.error("❌ [API/Generate] Error:", error);
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ 
        success: false,
        error: message
      }, { status: 500 });
    }
  }
};
