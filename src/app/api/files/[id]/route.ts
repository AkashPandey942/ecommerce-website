import { NextResponse } from "next/server";
import { getGridFSBucket } from "@/lib/gridfs";
import mongoose from "mongoose";

/**
 * Serves files stored in GridFS.
 * GET /api/files/[id]
 */
export async function GET(
  request: Request,
  context: { params: any }
) {
  try {
    const { id } = await context.params;
    const fileId = id;
    if (!fileId) return NextResponse.json({ error: "File ID required" }, { status: 400 });

    const bucket = await getGridFSBucket();
    
    // Hardening: Use Mongoose's ObjectId to avoid BSON version conflicts
    const objectId = new mongoose.Types.ObjectId(fileId);

    // Check if file exists
    const files = await bucket.find({ _id: objectId }).toArray();
    if (files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = files[0];
    const stream = bucket.openDownloadStream(objectId);

    // Standard Industry Header: Setting correct Content-Type and Cache-Control
    return new Response(stream as any, {
      headers: {
        "Content-Type": file.contentType || "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("❌ [API/Files] Error serving file:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
