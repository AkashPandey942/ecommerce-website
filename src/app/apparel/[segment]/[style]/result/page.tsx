"use client";

import FlowHeader from "@/components/FlowHeader";
import Footer from "@/components/Footer";
import ProgressStepper from "@/components/ProgressStepper";
import ResultCarousel from "@/components/ResultCarousel";
import { Download, RefreshCcw, Share2, Maximize2, Play, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import LoadingActionButton from "@/components/LoadingActionButton";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "Ethnic-Wear";
  
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Sample images for the carousel (Primary + Potential derivative views)
  const resultImages = [
    "/hero_image.png",
    "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg",
    "/assets/ladies/ethnic-wear/ChatGPT%20Image%20Apr%201,%202026,%2005_49_51%20PM.png"
  ];

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0">
      <FlowHeader title="Results" />

      <main className="w-full max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        {/* Step Indicator (Section 5.0) */}
        <div className="w-full mb-8">
          <ProgressStepper currentStep={6} />
        </div>

        {/* Multi-image Carousel (Rule 5.0, 6.6) */}
        <ResultCarousel images={resultImages} />

        {/* Action Buttons Hierarchy (Figma iPhone 16 - 9) */}
        <div className="w-full max-w-[353px] flex flex-col gap-4 mt-10 mb-10">
          
          {/* Row 1: More Angles & Create Video (Side-by-side) */}
          <div className="grid grid-cols-2 gap-4">
            <Link href={`/apparel/${segment}/${style}/views`}>
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-[52px] border border-white/10 rounded-[14px] flex items-center justify-center gap-2 bg-[#1A1F2E]/40"
              >
                <Maximize2 className="w-4 h-4 text-[#C5B6DE]" />
                <span className="font-roboto font-medium text-sm text-[#E2E2E8]">
                  More Angles
                </span>
              </motion.button>
            </Link>

            <Link href={`/apparel/${segment}/${style}/video`}>
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-[52px] border border-white/10 rounded-[14px] flex items-center justify-center gap-2 bg-[#1A1F2E]/40"
              >
                <div className="w-5 h-5 rounded-full border border-[#E2E2E8] flex items-center justify-center pl-0.5">
                  <Play className="w-2.5 h-2.5 text-[#E2E2E8] fill-[#E2E2E8]" />
                </div>
                <span className="font-roboto font-medium text-sm text-[#E2E2E8]">
                  Create Video
                </span>
              </motion.button>
            </Link>
          </div>

          {/* Row 2: Download All (Primary Gradient) */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-[61px] bg-figma-gradient rounded-[16px] shadow-[0_10px_30px_rgba(124,77,255,0.3)] flex items-center justify-center gap-3"
          >
            <Download className="w-5 h-5 text-white" />
            <span className="font-roboto font-semibold text-lg text-white">
              Download All
            </span>
          </motion.button>

          {/* Row 3: Create New Project (Tertiary Outline) */}
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.02)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-[61px] border border-white/10 rounded-[16px] flex items-center justify-center"
            >
              <span className="font-roboto font-medium text-lg text-[#E2E2E8]">
                Create New Project
              </span>
            </motion.button>
          </Link>
        </div>

        <Footer />
        <div className="h-[120px] lg:hidden" />
      </main>
    </div>
  );
}
