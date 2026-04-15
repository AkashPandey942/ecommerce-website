// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generationService } from "@/services/generationService";
import { geminiService } from "@/services/geminiService";
import { fal } from "@fal-ai/client";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { modelId, background, style, prompt, garmentImageUrl, modelImageUrl } = await request.json();

    const userId = (session.user as any).id;

    if (!userId) {
      console.error("❌ [API/Generate] User ID is missing from session");
      return NextResponse.json({ error: "User identity could not be verified. Please re-login." }, { status: 400 });
    }

    // 1. Phase 1: Create record in MongoDB and deduct credits
    const jobId = await generationService.createJob(userId, {
      inputImage: garmentImageUrl,
      modelId,
      background,
      outputStyle: style,
      prompt,
    });

    // 2. Trigger AI Generation via Gemini (Imagen 3)
    let outputImageUrl = "";
    try {
      const base64Image = await geminiService.generateImage({
        segment: "Ladies", // Fallback segment
        style,
        model: modelId,
        background,
        directorNotes: prompt,
      });

      // 3. Upload the generated image to a CDN (fal.ai storage)
      // Since Gemini returns a base64 string, we convert to Blob for storage
      const res = await fetch(base64Image);
      const blob = await res.blob();
      outputImageUrl = await fal.storage.upload(blob);
      
    } catch (aiError: any) {
      console.error("❌ [API/Generate] Gemini Generation failed:", aiError);
      throw new Error(`AI Generation failed: ${aiError.message}`);
    }

    // 4. Update job with final result
    await generationService.updateJob(jobId, { 
      outputImage: outputImageUrl,
      status: "completed" 
    });

    return NextResponse.json({ 
      success: true, 
      jobId, 
      outputImageUrl 
    });

  } catch (error: any) {
    console.error("❌ [API/Generate] Error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error" 
    }, { status: 500 });
  }
}
