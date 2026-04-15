"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { GenerationProvider } from "@/context/GenerationContext";
import { fal } from "@fal-ai/client";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ProjectProvider>
          <GenerationProvider>
            {children}
          </GenerationProvider>
        </ProjectProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
