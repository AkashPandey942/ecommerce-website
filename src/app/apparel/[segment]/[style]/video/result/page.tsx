"use client";

import ApparelHeader from "@/components/ApparelHeader";
import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import { Play, CheckCircle2, Download, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function VideoResultPage() {
  const params = useParams();
  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "Ethnic Wear";

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <ApparelHeader title="Video Result" />

      <main className="w-full max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        {/* Step 6: Fully Completed */}
        <ProgressStepper currentStep={6} />

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-8 mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <h2 className="font-manrope font-bold text-2xl md:text-3xl bg-figma-gradient bg-clip-text text-transparent italic">
              Cinematic Video Ready!
            </h2>
          </div>
          <p className="font-roboto text-[#99A1AF] text-sm md:text-base">
            Your fashion animation has been generated with high-fidelity physics.
          </p>
        </motion.div>

        {/* Video Result Card (Rectangle 27 - 558px) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="relative w-full max-w-[353px] aspect-[353/558] bg-[#1A1E29] rounded-[10px] overflow-hidden border border-[#2E1C4D] shadow-[0_0_50px_rgba(124,77,255,0.2)] group cursor-pointer"
        >
          {/* Mock Video Frame */}
          <Image
            src="/hero_image.png"
            alt="AI Generated Video Result"
            fill
            loading="lazy"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Large Play Icon (64px) */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/10">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-[64px] h-[64px] rounded-full bg-white flex items-center justify-center shadow-2xl overflow-hidden relative"
            >
              {/* Target Gradient Vector */}
              <div className="absolute inset-0 bg-figma-gradient opacity-90" />
              <Play className="w-8 h-8 text-white relative z-10 fill-white" />
            </motion.div>
          </div>

          {/* Video Metadata Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/40 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
            <span className="font-roboto text-[10px] uppercase tracking-wider font-semibold text-white/90">
              4K Cinematic • 30fps
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#7C4DFF] animate-pulse" />
              <span className="font-roboto text-[10px] font-bold text-[#7C4DFF]">LIVE</span>
            </div>
          </div>
        </motion.div>

        {/* Final Actions */}
        <div className="w-full max-w-[353px] flex flex-col gap-4 mt-10 mb-10">
          <Link href={`/apparel/${segment}/${style}/final-results`} className="w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-[61px] bg-figma-gradient rounded-full shadow-[0_0_30px_rgba(124,77,255,0.4)] flex items-center justify-center"
            >
              <span className="font-roboto font-semibold text-lg text-white">
                Approve & Continue
              </span>
            </motion.button>
          </Link>

          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.98 }}
              className="h-[52px] border border-white/10 rounded-full flex items-center justify-center gap-2 bg-white/5 transition-colors text-[#C5B6DE]"
            >
              <Download className="w-4 h-4" />
              <span className="font-roboto font-medium text-sm">Save</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.98 }}
              className="h-[52px] border border-white/10 rounded-full flex items-center justify-center gap-2 bg-white/5 transition-colors text-[#C5B6DE]"
            >
              <Share2 className="w-4 h-4" />
              <span className="font-roboto font-medium text-sm">Share</span>
            </motion.button>
          </div>
        </div>

        {/* Desktop Footer */}
        <div className="w-full mt-20">
          <Footer />
        </div>
      </main>
    </div>
  );
}
