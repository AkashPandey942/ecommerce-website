import { z } from "zod";

/**
 * Environment variables schema for production-ready validation.
 * Ensures that all required variables are present and correctly formatted.
 */
const envSchema = z.object({
  // Database
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  // AI Services
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  FAL_KEY: z.string().optional(),
  RUNCOMFY_API_KEY: z.string().optional(),
  RUNCOMFY_DEPLOYMENT_ID: z.string().optional(),

  // Authentication
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),

  // Environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

// Validate process.env against the schema only on the server
const isServer = typeof window === "undefined";

/**
 * Validated environment variables.
 * Import this throughout the application instead of using process.env directly.
 */
export const env = (() => {
  if (!isServer) {
    // Return a dummy object on the client to prevent build-time/runtime errors.
    // Client-side code should not be accessing these variables.
    return {} as z.infer<typeof envSchema>;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    });

    // In production, we want to fail fast and hard if config is invalid
    throw new Error("Missing or invalid environment variables. Check the logs for details.");
  }

  return result.data;
})();
