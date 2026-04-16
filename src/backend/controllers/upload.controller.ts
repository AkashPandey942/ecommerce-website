import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import cloudinary from "@/shared/config/cloudinary";

export const UploadController = {
  async handleUpload(request: Request) {
    try {
      const session = await getServerSession(authOptions);
      const userId = session?.user?.id ?? "guest-user";

      const formData = await request.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File must be less than 10MB" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `ecom-hub/user-${userId}`,
            resource_type: "auto",
          },
          (error, result) => {
            if (error || !result) reject(error || new Error("Cloudinary upload failed"));
            else resolve(result as { secure_url: string });
          }
        );
        uploadStream.end(buffer);
      });

      return NextResponse.json({ success: true, url: result.secure_url });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Upload failed";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  }
};
