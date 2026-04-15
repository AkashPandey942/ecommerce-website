// src/app/api/status/route.ts
import { NextResponse } from "next/server";
import { runComfyService } from "@/services/runComfyService";
import { generationService } from "@/services/generationService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // 1. Fetch current job from MongoDB
    const job = await generationService.getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // If already finished, return immediately
    if (job.status === "completed" || job.status === "failed") {
      return NextResponse.json(job);
    }

    // 2. Poll RunComfy if we have a requestId
    if (job.requestId) {
      const runComfyData = await runComfyService.checkStatus(job.requestId);

      if (runComfyData.status === "completed" && runComfyData.outputImage) {
        // Success!
        await generationService.updateJob(jobId, {
          status: "completed",
          outputImage: runComfyData.outputImage
        });
        return NextResponse.json({ ...job, status: "completed", outputImage: runComfyData.outputImage });
      }

      if (runComfyData.status === "failed") {
        // Failure - Refund Credits
        await generationService.refundJob(jobId);
        return NextResponse.json({ ...job, status: "failed", error: runComfyData.error });
      }

      // Still processing
      return NextResponse.json({ ...job, status: "processing" });
    }

    return NextResponse.json(job);

  } catch (error: any) {
    console.error("❌ [API/Status] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
