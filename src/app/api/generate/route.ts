// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { geminiService } from "@/services/geminiService";
import { generationService } from "@/services/generationService";
import { storageService } from "@/services/storageService";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { modelId, background, style, prompt, garmentImageUrl } = await request.json();

    const userId = (session.user as any).id;

    // 1. Phase 1: Create record in MongoDB and deduct credits
    const jobId = await generationService.createJob(userId, {
      inputImage: garmentImageUrl,
      modelId,
      background,
      outputStyle: style,
      prompt: prompt || "",
    });

    const { runComfyService } = require("@/services/runComfyService");
    
    // Fallback for simple numeric model IDs sent from frontend UI
    let modelImagePath: string = modelId;
    if (!modelImagePath || !modelImagePath.includes("/")) {
      modelImagePath = "/assets/ladies/western-wear/photo-beautiful-female-model.jpg";
    }

    // 2. Trigger RunComfy Model API Workflow
    const requestId = await runComfyService.triggerWorkflow({
      garmentImageUrl,
      modelImageUrl: modelImagePath
    });

    // 3. Update job with the RunComfy requestId for status polling
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
