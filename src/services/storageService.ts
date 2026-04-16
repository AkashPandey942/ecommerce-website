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

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Upload failed");
      }

      const data = await response.json();
      return data.url; // Returns the permanent /api/files/[id] URL
    } catch (error: any) {
      console.error("❌ [storageService] uploadGarment Error:", error);
      throw new Error(error.message || "Failed to upload image.");
    }
  }
};
