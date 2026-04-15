import { createRouteHandler } from "@fal-ai/server-proxy/nextjs";

export const { GET, POST } = createRouteHandler({
  // Temporarily allowing unauthorized requests to bypass the 403 error.
  // In production, you should use the auth() callback to protect this route.
  allowUnauthorizedRequests: true,
});
