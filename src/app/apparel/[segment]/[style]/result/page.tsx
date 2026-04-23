"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import ResultCarousel from "@/frontend/components/ResultCarousel";
import { Download, RefreshCcw, PlayCircle, Camera } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProject } from "@/frontend/context/ProjectContext";
import { useGeneration } from "@/frontend/context/GenerationContext";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "Ethnic-Wear";
  
  const { currentProject, resetProject } = useProject();
  const { resetGeneration } = useGeneration();
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const hasPrime = Boolean(currentProject?.primeImage);
    const hasOutputs = Array.isArray(currentProject?.outputViews) && currentProject.outputViews.length > 0;
    if (!hasPrime && !hasOutputs) {
      router.replace(`/apparel/${params.segment}/${params.style}/views`);
    }
  }, [currentProject, params.segment, params.style, router]);

  // Map generated images from context. If none exist, show an empty array to prevent static leakage.
  const resultImages = currentProject?.outputViews?.length
    ? currentProject.outputViews
    : currentProject?.primeImage
      ? [currentProject.primeImage]
      : [];

  const handleDownloadAll = async () => {
    if (resultImages.length === 0) return;
    try {
      setIsDownloading(true);
      
      for (let i = 0; i < resultImages.length; i++) {
        const urlToDownload = resultImages[i];
        if (!urlToDownload) continue;

        const link = document.createElement('a');
        link.href = urlToDownload;
        link.target = "_blank";
        link.download = `Result_View_${i + 1}.png`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    } catch (error) {
      console.error("Error downloading files:", error);
      alert("Failed to download files. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCreateNewProject = (e: React.MouseEvent) => {
    e.preventDefault();
    resetProject();
    resetGeneration();
    router.push("/");
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0">
      <FlowHeader title="Results" />

      <main className="w-full max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        {/* Step Indicator (Section 5.0) */}
        <div className="w-full mb-8">
          <ProgressStepper currentStep={6} />
        </div>

        {/* Multi-image Carousel (Rule 5.0, 6.6) */}
        {resultImages.length > 0 ? (
          <ResultCarousel images={resultImages} />
        ) : (
          <div className="w-full aspect-[4/5] max-w-full sm:max-w-[353px] rounded-[24px] bg-white/5 flex flex-col items-center justify-center gap-4 border border-white/10">
            <RefreshCcw className="w-10 h-10 text-[#7C4DFF] animate-spin" />
            <p className="text-[#99A1AF] text-sm">Waiting for AI outputs...</p>
          </div>
        )}

        {/* Action Buttons Hierarchy (Figma iPhone 16 - 9) */}
        <div className="w-full max-w-full sm:max-w-[353px] flex flex-col gap-4 mt-10 mb-10">
          
          {/* Row 1: More Angles & Create Video (Side-by-side) */}
          <div className="grid grid-cols-2 gap-4">
            <Link href={`/apparel/${params.segment}/${params.style}/views`}>
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-[52px] border border-white/10 rounded-full flex items-center justify-center gap-2 bg-transparent"
              >
                <Camera className="w-4 h-4 text-[#E2E2E8]" />
                <span className="font-roboto font-medium text-sm text-[#E2E2E8]">
                  More Angles
                </span>
              </motion.button>
            </Link>

            <Link href={`/apparel/${params.segment}/${params.style}/video-style`}>
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-[52px] border border-white/10 rounded-full flex items-center justify-center gap-2 bg-transparent"
              >
                <PlayCircle className="w-4 h-4 text-[#E2E2E8]" />
                <span className="font-roboto font-medium text-sm text-[#E2E2E8]">
                  Create Video
                </span>
              </motion.button>
            </Link>
          </div>

          {/* Row 2: Download All (Primary Gradient) */}
          <motion.button
            whileHover={isDownloading ? undefined : { scale: 1.02 }}
            whileTap={isDownloading ? undefined : { scale: 0.98 }}
            onClick={handleDownloadAll}
            disabled={isDownloading}
            className={`w-full h-[61px] ${isDownloading ? "bg-white/20 cursor-not-allowed" : "bg-figma-gradient shadow-[0_10px_30px_rgba(124,77,255,0.3)]"} rounded-full flex items-center justify-center gap-3 transition-all`}
          >
            {isDownloading ? (
              <RefreshCcw className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Download className="w-5 h-5 text-white" />
            )}
            <span className="font-roboto font-semibold text-lg text-white">
              {isDownloading ? "Downloading..." : "Download All"}
            </span>
          </motion.button>

          {/* Row 3: Create New Project (Tertiary Outline) */}
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.02)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateNewProject}
            className="w-full h-[61px] border border-white/10 rounded-full flex items-center justify-center bg-transparent"
          >
            <span className="font-roboto font-medium text-lg text-[#E2E2E8]">
              Create New Project
            </span>
          </motion.button>
        </div>

        <Footer />
        <div className="h-[120px] lg:hidden" />
      </main>
    </div>
  );
}
