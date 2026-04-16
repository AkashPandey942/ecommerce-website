// src/services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGridFSBucket } from "@/lib/gridfs";
import mongoose from "mongoose";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

interface RefinementInput {
  segment: string;
  style: string;
  model: string;
  background: string;
  directorNotes?: string;
}

/**
 * Service to refine user inputs into professional AI prompts using Gemini.
 */
export const geminiService = {
  /**
   * Transforms structured selections into a high-fidelity photographic prompt.
   * Optimized for high-end image generation APIs like Pollinations or SDXL.
   */
  async refinePrompt(input: RefinementInput): Promise<string> {
    if (!API_KEY) {
      console.warn("⚠️ [geminiService] Missing GEMINI_API_KEY. Using basic prompt.");
      return `${input.segment} ${input.style} on a ${input.model} model, ${input.background} background. ${input.directorNotes || ""}`;
    }

    try {
      // Using gemini-flash-latest for stable free-tier analysis
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const systemPrompt = `
        You are an expert Fashion Creative Director and Prompt Engineer.
        Your task is to convert simple garment and scene selections into professional, descriptive "Masterpiece" prompts for AI image generation.
        
        STRICT RULES:
        1. Focus on fabric textures (Silk, Chiffon, Cotton), embroidery details (Zari, Resham), and lighting physics.
        2. Describe a specific real-world fashion setting matching the user's 'background' choice.
        3. Specify a "High-end fashion editorial" look with 8k resolution and highly detailed skin textures.
        4. Focus on the garment being the center of attention.
        5. DO NOT include any introductory or conversational text. Output ONLY the refined prompt.
      `;

      const userPrompt = `
        Product: ${input.segment} ${input.style}
        Model Type: ${input.model}
        Background Setting: ${input.background}
        Scenario Notes: ${input.directorNotes || "None"}

        Generate the ultimate photographic prompt.
      `;

      const result = await model.generateContent([systemPrompt, userPrompt]);
      const response = await result.response;
      return response.text().trim();
    } catch (error: any) {
      console.error("❌ [geminiService] Error refining prompt:", error);
      return `${input.segment} ${input.style} on a ${input.model} model, in a ${input.background} setting.`;
    }
  },

  /**
   * Generates a high-fidelity fashion image using a Hybrid Free Pipeline:
   * Gemini (Analysis) + Pollinations.ai (Free Generation Artist).
   */
  async generateFashionImage(input: {
    garmentImageUrl: string;
    modelId: string;
    background: string;
    style: string;
    prompt?: string;
  }): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      
      let garmentContext = "A stylish garment.";

      // 1. Analyze the uploaded garment (Only if Gemini is available)
      if (API_KEY) {
        try {
          let imgBuffer: Buffer;
          if (input.garmentImageUrl.startsWith("/api/files/")) {
            const fileId = input.garmentImageUrl.split("/").pop();
            const bucket = await getGridFSBucket();
            const objectId = new mongoose.Types.ObjectId(fileId);
            const stream = bucket.openDownloadStream(objectId);
            const chunks: any[] = [];
            for await (const chunk of stream) chunks.push(chunk);
            imgBuffer = Buffer.concat(chunks);
          } else {
            const imgResp = await fetch(input.garmentImageUrl);
            imgBuffer = Buffer.from(await imgResp.arrayBuffer());
          }

          const imgData = { inlineData: { data: imgBuffer.toString("base64"), mimeType: "image/png" } };
          const analysisPrompt = `Analyze this garment for a fashion generator. Describe color, fabric, pattern. Type: ${input.style}`;
          const analysisResult = await model.generateContent([analysisPrompt, imgData]);
          garmentContext = analysisResult.response.text();
        } catch (e) {
          console.warn("⚠️ [geminiService] Analysis failed, using fallback context.");
        }
      }

      // 2. Refine the prompt using the analyzed context
      const refinedPrompt = await this.refinePrompt({
        segment: "Ladies",
        style: input.style,
        model: input.modelId,
        background: input.background,
        directorNotes: `Garment Details: ${garmentContext}. User notes: ${input.prompt || ""}`
      });

      console.log("🎨 [geminiService] Final Creative Brief:", refinedPrompt);

      // 3. Generate Image using Pollinations.ai (FREE, High-Quality, No Key Required)
      // We truncate the prompt and encode it for URL safety (Browsers limit URLs to ~2000 chars)
      const safePrompt = refinedPrompt.length > 1000 ? refinedPrompt.substring(0, 1000) : refinedPrompt;
      const encodedPrompt = encodeURIComponent(safePrompt);
      const seed = Math.floor(Math.random() * 1000000); // Random seed for unique results
      const finalImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=1000&model=flux&seed=${seed}&nologo=true`;

      console.log("📥 [geminiService] Fetching image from Pollinations...");
      // By fetching server-side we bypass browser AdBlockers and URL length limits!
      const imgResp = await fetch(finalImageUrl);
      if (!imgResp.ok) throw new Error("Failed to download image from Pollinations");
      
      const imgBuffer = Buffer.from(await imgResp.arrayBuffer());
      
      // Upload to your local MongoDB GridFS so the frontend always has a clean, safe local URL
      const { uploadToGridFS } = await import("@/lib/gridfs");
      const fileId = await uploadToGridFS(imgBuffer, `ai-gen-${seed}.png`, "image/png");
      
      const localUrl = `/api/files/${fileId}`;
      console.log("✅ [geminiService] Image saved to GridFS:", localUrl);
      
      return localUrl;

    } catch (error: any) {
      console.error("❌ [geminiService] Free Gen Chain Error:", error);
      // Absolute fallback if everything fails
      return "/assets/demo-result.png"; 
    }
  }
};
