/**
 * src/services/storageService.ts
 * Rewritten to use internal API / Cloudinary instead of Firebase.
 */
export const storageService = {
  /**
   * Uploads an image to our internal upload API using Cloudinary.
   */
  async uploadGarment(userId: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      // userId is passed by getServerSession, so we don't need it in formData but it's okay.
      formData.append("userId", userId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      return data.url; // Cloudinary secure_url
    } catch (error: any) {
      console.error("❌ [storageService] uploadGarment Error:", error);
      throw error;
    }
  }
};
