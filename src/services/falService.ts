import mongoose from "mongoose";
import { getGridFSBucket } from "@/lib/gridfs";

/**
 * Service to handle GPU inference calls via fal.ai.
 * Targeted Model: fal-ai/fashn/tryon/v1.5 (optimized for fashion)
 */
export const falService = {
  /**
   * Helper to fetch file from GridFS and convert to Base64 Data URI
   */
  async getGridFSBase64(fileUrl: string): Promise<string> {
    if (!fileUrl.startsWith("/api/files/")) return fileUrl;
    const fileId = fileUrl.split("/").pop();
    if (!fileId) return fileUrl;

    const bucket = await getGridFSBucket();
    const objectId = new mongoose.Types.ObjectId(fileId);
    
    // Check Content Type
    const files = await bucket.find({ _id: objectId }).toArray();
    if (files.length === 0) throw new Error("Garment image not found in database.");
    const contentType = files[0].contentType || "image/png";

    const stream = bucket.openDownloadStream(objectId);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk as Buffer));
    const buffer = Buffer.concat(chunks);
    
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  },

  /**
   * Triggers a Virtual Try-On generation via fal.ai.
   */
  async triggerVirtualTryOn(params: {
    garmentImageUrl: string;
    modelImageUrl: string;
    prompt?: string;
  }) {
    const FAL_KEY = process.env.FAL_KEY || "";
    if (!FAL_KEY) {
      console.warn("⚠️ [falService] Missing FAL_KEY. Generation will not trigger.");
      return null;
    }

    try {
      console.log("📥 [falService] Converting Garment Image to Base64...");
      const garmentBase64 = await this.getGridFSBase64(params.garmentImageUrl);
      
      // Note: modelImageUrl here will either be an external URL or requires similar conversion if local
      let modelBase64 = params.modelImageUrl;
      if (modelBase64.startsWith("/")) {
          console.warn("⚠️ [falService] Model Image is a local path. Converting to Base64 is required for production, but returning fallback for safety if not handled.");
          // Ideally convert public/assets/... to Base64 using fs
          const fs = await import('fs/promises');
          const path = await import('path');
          const fullPath = path.join(process.cwd(), 'public', params.modelImageUrl);
          const ext = path.extname(fullPath).toLowerCase().replace('.', '');
          const fileBuffer = await fs.readFile(fullPath);
          modelBase64 = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${fileBuffer.toString('base64')}`;
      }

      console.log("🚀 [falService] Submitting to fal-ai/fashn/tryon/v1.5...");
      const response = await fetch("https://fal.run/fal-ai/fashn/tryon/v1.5", {
        method: "POST",
        headers: {
          "Authorization": `Key ${FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_image: modelBase64,
          garment_image: garmentBase64,
          category: "tops" // Recommended by Fashn model
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`fal.ai Error: ${err}`);
      }

      const data = await response.json();
      const generatedImageUrl = data.images?.[0]?.url;

      if (!generatedImageUrl) throw new Error("No image returned from Fal.ai");

      console.log("✅ [falService] Image generated at:", generatedImageUrl);
      return generatedImageUrl;

    } catch (error) {
      console.error("❌ [falService] triggerVirtualTryOn Catch:", error);
      throw error;
    }
  }
};
