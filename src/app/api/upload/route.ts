import { NextResponse } from "next/server";
import { uploadToGridFS } from "@/lib/gridfs";

/**
 * Handles image uploads and saves to MongoDB GridFS.
 * POST /api/upload
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to Buffer for GridFS
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to GridFS
    const fileId = await uploadToGridFS(
      buffer,
      file.name,
      file.type || "image/png"
    );

    // Return the industry-standard permanent URL
    const publicUrl = `/api/files/${fileId}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileId 
    });
  } catch (error: any) {
    console.error("❌ [API/Upload] Error details:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
