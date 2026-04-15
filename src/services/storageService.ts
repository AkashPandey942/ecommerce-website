/**
 * src/services/storageService.ts
 * Rewritten to use internal API / Cloudinary instead of Firebase.
 */
export const storageService = {
  /**
   * Uploads an image to our internal upload API.
   * This handles storage without needing Firebase.
   */
  async uploadGarment(userId: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      // We will create this API route next if you want to use Cloudinary or S3
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.url; // The permanent URL for the input image
    } catch (error) {
      console.error("❌ [storageService] uploadGarment Error:", error);
      throw new Error("Failed to upload image. Please setup a storage provider (like Cloudinary).");
    }
  }
};
