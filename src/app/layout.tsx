import type { Metadata } from "next";
import { Inter, Roboto, Manrope } from "next/font/google";
import { ProjectProvider } from "@/context/ProjectContext";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const fontInter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fontRoboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const fontManrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Figma UI | Premium Design System",
  description: "A high-fidelity project embodying modern, premium design aesthetics with Next.js and Tailwind CSS.",
  keywords: ["Figma", "UI", "Design System", "Next.js", "Tailwind CSS", "Glassmorphism"],
  authors: [{ name: "Design Team" }],
  openGraph: {
    title: "Figma UI | Premium Design System",
    description: "Stunning web application with glassmorphic UI and smooth animations.",
    type: "website",
    siteName: "Figma UI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Figma UI | Premium Design System",
    description: "Stunning web application with glassmorphic UI and smooth animations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontInter.variable} ${fontRoboto.variable} ${fontManrope.variable} h-full antialiased overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden" suppressHydrationWarning>
        <AuthProvider>
          <ProjectProvider>
            {children}
          </ProjectProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
