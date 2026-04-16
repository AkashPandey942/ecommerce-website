import { NextResponse } from "next/server";
import { runComfyService } from "@/backend/services/ai/runComfyService";
import { generationService } from "@/backend/services/generationService";

export const StatusController = {
  async handleStatus(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const jobId = searchParams.get("jobId");

      if (!jobId) {
        return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
      }

      // 1. Fetch current job from MongoDB
      const job = await generationService.getJob(jobId);
      if (!job) {
        return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
      }

      // If already finished, return immediately
      if (job.status === "completed" || job.status === "failed") {
        return NextResponse.json(job);
      }

      // 2. Polling RunComfy
      if (job.requestId) {
        const runComfyData = await runComfyService.checkStatus(job.requestId);

        if (runComfyData.status === "completed" && runComfyData.outputImage) {
          await generationService.updateJob(jobId, {
            status: "completed",
            outputImage: runComfyData.outputImage
          });
          return NextResponse.json({ success: true, ...job, status: "completed", outputImage: runComfyData.outputImage });
        }

        if (runComfyData.status === "failed") {
          await generationService.updateJob(jobId, {
            status: "failed",
            error: runComfyData.error || "Generation failed",
          });
          await generationService.refundJob(jobId);
          return NextResponse.json({ success: true, ...job, status: "failed", error: runComfyData.error || "Generation failed" });
        }

        return NextResponse.json({ success: true, ...job, status: "processing" });
      }

      return NextResponse.json({ success: true, ...job });

    } catch (error: unknown) {
      console.error("❌ [API/Status] Error:", error);
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  }
};
