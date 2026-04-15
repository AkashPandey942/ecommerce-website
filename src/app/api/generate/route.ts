// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { runComfyService } from "@/services/runComfyService";
import { generationService } from "@/services/generationService";

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { modelId, background, style, prompt, garmentImageUrl, modelImageUrl } = await request.json();

    const userId = (session.user as any).id;

    // 1. Phase 1: Create record in MongoDB and deduct credits
    const jobId = await generationService.createJob(userId, {
      inputImage: garmentImageUrl,
      modelId,
      background,
      outputStyle: style,
      prompt,
    });

    // 2. Trigger RunComfy workflow
    const requestId = await runComfyService.triggerWorkflow({
      garmentImageUrl,
      modelImageUrl
    });

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

  } catch (error: any) {
    console.error("❌ [API/Generate] Error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error" 
    }, { status: 500 });
  }
}
