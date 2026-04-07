"use client";

import ApparelHeader from "@/components/ApparelHeader";
import Footer from "@/components/Footer";
import { Download, RefreshCcw, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import LoadingActionButton from "@/components/LoadingActionButton";

export default function ResultPage() {
  const params = useParams();
  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "Ethnic Wear";
  
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsRegenerating(false);
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <ApparelHeader title="AI Generation Result" />

      <main className="w-full max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="w-fit mx-auto font-manrope font-bold text-2xl md:text-3xl text-figma-gradient italic leading-tight text-center">
            Your Fashion Masterpiece is Ready!
          </h2>
          <p className="font-roboto text-[#99A1AF] mt-2 text-sm md:text-base">
            AI has perfectly blended your product with the chosen model and style.
          </p>
        </motion.div>

        {/* Result Card (Rectangle 26) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="relative w-full max-w-[353px] aspect-[353/502] bg-[#1A1E29] rounded-[20px] overflow-hidden border border-[#2E1C4D] shadow-[0_0_50px_rgba(124,77,255,0.2)] group"
        >
          {/* Result Image */}
          <Image
            src="/hero_image.png" // Using hero_image as a high-fidelity result placeholder
            alt="AI Generated Fashion Result"
            fill
            loading="lazy"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Subtle Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* High-quality badge */}
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-roboto text-[10px] uppercase tracking-wider font-semibold text-white/90">
              High Fidelity AI
            </span>
          </div>
        </motion.div>

        {/* Updated Action Buttons per Reference Image */}
        <div className="w-full max-w-[353px] flex flex-col gap-4 mt-10 mb-10">
          {/* Top Row: Regenerate & Edit Prompt */}
          <div className="grid grid-cols-2 gap-4">
            <LoadingActionButton
              variant="secondary"
              isLoading={isRegenerating}
              onClick={handleRegenerate}
              className="h-[52px]"
              icon={<RefreshCcw className="w-4 h-4 text-[#C5B6DE]" />}
            >
              Regenerate
            </LoadingActionButton>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.98 }}
              className="h-[52px] border border-white/10 rounded-full flex items-center justify-center gap-2 bg-[#1A1F2E]/40 transition-colors"
            >
              <svg 
                width="16" height="16" viewBox="0 0 24 24" fill="none" 
                stroke="#C5B6DE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span className="font-roboto font-medium text-sm text-[#C5B6DE]">
                Edit Prompt
              </span>
            </motion.button>
          </div>

          {/* Primary Action: Approve & Continue */}
          <Link href={`/apparel/${segment}/${style}/video`}>
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

          {/* Secondary Actions (Download/Share) */}
          <div className="flex items-center justify-center gap-8 mt-2">
            <button className="flex items-center gap-2 text-[#99A1AF] hover:text-white transition-colors">
              <Download className="w-4 h-4" />
              <span className="font-roboto text-xs">Download</span>
            </button>
            <button className="flex items-center gap-2 text-[#99A1AF] hover:text-white transition-colors">
              <Share2 className="w-4 h-4" />
              <span className="font-roboto text-xs">Share</span>
            </button>
          </div>
        </div>

        {/* Desktop Footer */}
        <div className="w-full mt-20 opacity-50 hover:opacity-100 transition-opacity">
          <Footer />
        </div>
      </main>
    </div>
  );
}
