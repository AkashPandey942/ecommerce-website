import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { runComfyService } from "@/backend/services/ai/runComfyService";
import { generationService } from "@/backend/services/generationService";
import { z } from "zod";

function isPublicHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

const generateRequestSchema = z.object({
  userImage: z.string().nullable().optional(),
  clothImage: z.string().nullable().optional(),
  gender: z.enum(["Male", "Female", "Kids", "Man", "Woman", "Person"]).optional(),
  garmentType: z.enum(["Fabric", "Ready-made"]).optional(),
  category: z.string().min(1, "Category is required").nullable().optional(),
  style: z.string().min(1, "Style is required"),
  outputFormat: z.enum(["single", "triple", "multi-view"]).default("multi-view"),
  outputCount: z.number().int().min(1).max(8).optional(),
  notes: z.string().nullable().optional(),
  modelId: z.string().nullable().optional(),
  background: z.string().nullable().optional(),
  prompt: z.string().nullable().optional(),
  garmentImageUrl: z.string().nullable().optional(),
  modelImageUrl: z.string().nullable().optional(),
  mode: z.enum(["Virtual Try-On", "AI Studio"]).default("Virtual Try-On"),
  userPoint: z.object({ x: z.number(), y: z.number() }).nullable().optional(),
  clothingPoint: z.object({ x: z.number(), y: z.number() }).nullable().optional(),
});

export const GenerateController = {
  async handleGeneration(request: Request) {
    try {
      const session = await getServerSession(authOptions);

      const rawBody = await request.json();
      const parsed = generateRequestSchema.safeParse(rawBody);

      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0]?.message || "Invalid request payload" },
          { status: 400 }
        );
      }

      const {
        modelId,
        background,
        style,
        prompt,
        notes,
        garmentImageUrl,
        modelImageUrl,
        clothImage,
        userImage,
        gender,
        garmentType,
        category,
        mode,
        outputFormat,
        outputCount,
        userPoint,
        clothingPoint,
      } = parsed.data;

      const normalizedGarmentImage = garmentImageUrl ?? clothImage ?? "";
      const normalizedUserImage = modelImageUrl ?? userImage ?? "";
      const normalizedPrompt = [prompt ?? "", notes ?? "", category ? `Category: ${category}` : ""].filter(Boolean).join("\n");
      const normalizedCategory = (category || "").trim();
      const normalizedGarmentType = garmentType ?? "Fabric";
      const normalizedMode =
        mode === "Virtual Try-On" && !normalizedCategory && Boolean(modelId || background)
          ? "AI Studio"
          : mode;

      console.log("[API/Generate] Request received", {
        mode: normalizedMode,
        garmentType: normalizedGarmentType,
        category,
        style,
        outputFormat,
        outputCount,
        hasUserImage: Boolean(normalizedUserImage),
        hasClothingImage: Boolean(normalizedGarmentImage),
      });

      if (!normalizedGarmentImage) {
        return NextResponse.json({ success: false, error: "Garment image is required" }, { status: 400 });
      }

      if (!normalizedUserImage && normalizedMode === "Virtual Try-On") {
        return NextResponse.json({ success: false, error: "Model image is required for virtual try-on" }, { status: 400 });
      }

      const requiresCategory = normalizedMode === "Virtual Try-On" && normalizedGarmentType === "Fabric";
      if (requiresCategory && !normalizedCategory) {
        return NextResponse.json({ success: false, error: "Clothing category is required" }, { status: 400 });
      }

      if (!isPublicHttpUrl(normalizedGarmentImage)) {
        return NextResponse.json(
          { success: false, error: "Garment image must be a public http/https URL. Please upload again." },
          { status: 400 }
        );
      }

      if (normalizedUserImage && !isPublicHttpUrl(normalizedUserImage)) {
        return NextResponse.json(
          { success: false, error: "Model image must be a public http/https URL. Please upload again." },
          { status: 400 }
        );
      }

      const userId = session?.user?.id ?? "guest-user";

      // 1. Phase 1: Create record in MongoDB and deduct credits
      const jobId = await generationService.createJob(userId, {
        inputImage: normalizedGarmentImage,
        modelId: modelId || "custom",
        background: background ?? "default",
        outputStyle: style,
        prompt: normalizedPrompt,
      });

      // 2. Trigger RunComfy workflow
      const requestId = await runComfyService.triggerWorkflow({
        garmentImageUrl: normalizedGarmentImage,
        modelImageUrl: normalizedUserImage || normalizedGarmentImage,
        prompt: normalizedPrompt,
        style,
        gender,
        garmentType: normalizedGarmentType,
        category: normalizedCategory || undefined,
        mode: normalizedMode,
        outputFormat,
        outputCount,
        background: background ?? undefined,
        userPoint,
        clothingPoint
      });

      console.log("[API/Generate] Trigger response", { jobId, hasRequestId: Boolean(requestId) });

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
      const status =
        /insufficient credits/i.test(message)
          ? 402
          : /text-to-image model/i.test(message)
            ? 400
            : 500;
      return NextResponse.json({ 
        success: false,
        error: message
      }, { status });
    }
  }
};
