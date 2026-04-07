"use client";

import ApparelHeader from "@/components/ApparelHeader";
import Footer from "@/components/Footer";
import { Download, RefreshCcw, Share2, Sparkles, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import LoadingActionButton from "@/components/LoadingActionButton";

export default function JewelleryResultPage() {
  const params = useParams();
  const segment = (params.segment as string) || "bridal";
  const style = (params.style as string) || "sets-and-pieces";
  const [mounted, setMounted] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsRegenerating(false);
  };

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 font-roboto">
      <ApparelHeader title="AI Photoshoot Ready" />

      <main className="w-full max-w-lg lg:max-w-7xl mx-auto pt-[105px] px-5 flex flex-col items-center">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
             <Sparkles className="w-5 h-5 text-[#00C2FF]" />
             <h2 className="font-bold text-2xl md:text-3xl bg-gradient-to-r from-[#00C2FF] via-[#7C4DFF] to-[#FF00C7] bg-clip-text text-transparent italic">
               Masterpiece Crafted!
             </h2>
             <Sparkles className="w-5 h-5 text-[#FF00C7]" />
          </div>
          <p className="text-[#99A1AF] text-sm md:text-base max-w-md">
            Your jewellery has been digitally staged in a premium editorial setting.
          </p>
        </motion.div>

        {/* Result Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-[353px] aspect-[353/502] rounded-[24px] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,194,255,0.15)] group"
        >
          <Image
            src="/golden-jewlary.jpg"
            alt="AI Generated Jewellery Result"
            fill
            className="object-cover"
            priority
          />

          {/* Overlays */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
             <div className="flex items-center justify-between">
                <div>
                   <h4 className="text-white font-bold text-lg leading-tight uppercase tracking-widest">
                     Bridal Edition
                   </h4>
                   <p className="text-white/60 text-[10px] uppercase tracking-wider mt-1">
                     8K Resolution • AI Enhanced
                   </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                   <ShoppingBag className="w-4 h-4 text-white" />
                </div>
             </div>
          </div>

          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white/90">HQ GENERATOR</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="w-full max-w-[353px] flex flex-col gap-4 mt-10 mb-10">
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-[52px] bg-[#1A1F2E] border border-white/5 rounded-full flex items-center justify-center gap-2 hover:bg-[#252B3D] transition-colors"
            >
              <Share2 className="w-4 h-4 text-[#C5B6DE]" />
              <span className="font-medium text-sm text-[#C5B6DE]">Share AI</span>
            </motion.button>
          </div>

          {/* Primary CTA */}
          <Link href="/gallery">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-[61px] bg-gradient-to-r from-[#00C2FF] via-[#7C3AED] to-[#FF00C7] rounded-full shadow-[0_10px_30px_rgba(124,77,255,0.3)] flex items-center justify-center group"
            >
              <span className="font-bold text-lg text-white">Save to My Collection</span>
            </motion.button>
          </Link>

          {/* Secondary Actions */}
          <div className="flex items-center justify-center gap-8 mt-2">
             <button className="flex items-center gap-2 text-[#99A1AF] hover:text-white transition-colors group">
               <Download className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
               <span className="text-xs">Download Result</span>
             </button>
             <Link href="/studio" className="text-xs text-[#99A1AF] hover:text-white transition-colors">
                Back to Studio
             </Link>
          </div>
        </div>

        <Footer />
        <div className="h-[120px] lg:hidden" />
      </main>
    </div>
  );
}
