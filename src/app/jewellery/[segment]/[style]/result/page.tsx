"use client";

import FlowHeader from "@/components/FlowHeader";
import Footer from "@/components/Footer";
import ProgressStepper from "@/components/ProgressStepper";
import ResultCarousel from "@/components/ResultCarousel";
import { Download, RefreshCcw, Share2, Maximize2, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoadingActionButton from "@/components/LoadingActionButton";

export default function JewelleryResultPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "bridal";
  const style = (params.style as string) || "sets-and-pieces";
  const [mounted, setMounted] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => setMounted(true), []);

  // Sample images for the carousel (Primary + Potential derivative views)
  const resultImages = [
    "/golden-jewlary.jpg",
    "/elegant-woman-showcasing-silver-necklace-with-vibrant-amethyst-aquamarine-stones-set-against-deep-background-dramatic-effect.jpg",
    "/indian-bride-9-2025-12-2fd0a5885b204639c8156089c6d2ebad-16x9.avif"
  ];

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 font-roboto lg:pb-0">
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
            <Link href={`/jewellery/${segment}/${style}/views`}>
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

            <Link href={`/jewellery/${segment}/${style}/video`}>
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

