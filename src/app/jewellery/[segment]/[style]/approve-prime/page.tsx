"use client";

import ApparelHeader from "@/components/ApparelHeader";
import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import LoadingActionButton from "@/components/LoadingActionButton";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, RefreshCcw, Sparkles, Gem } from "lucide-react";

export default function JewelleryApprovePrimePage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "bridal";
  const style = (params.style as string) || "sets-and-pieces";

  const [isGenerating, setIsGenerating] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleApprove = async () => {
    setIsApproving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push(`/jewellery/${segment}/${style}/views`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <ApparelHeader title="Approve Base Asset" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        <ProgressStepper currentStep={6} />

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div 
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center min-h-[400px]"
            >
              <div className="relative w-32 h-32 mb-8">
                <motion.div 
                  className="absolute inset-0 border-2 border-t-[#00C2FF] border-b-[#FF00C7] rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gem className="w-8 h-8 text-[#00C2FF] animate-pulse" />
                </div>
              </div>
              <h2 className="font-roboto font-semibold text-2xl text-white mb-2 text-center">Rendering High-Fidelity Jewelry</h2>
              <p className="text-[#C2C6D6] text-sm animate-pulse">Calculating refractive caustics and skin tones...</p>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 w-full flex flex-col items-center"
            >
              <section className="mt-8 mb-6 text-center">
                <h1 className="font-roboto font-semibold text-2xl text-white mb-2">Review Primary Asset</h1>
                <p className="text-[#C2C6D6] text-sm max-w-[300px]">
                  Confirm the lighting and placement. This will lead the look for your entire catalog.
                </p>
              </section>

              <div className="relative w-full aspect-square max-w-[353px] rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,194,255,0.15)] mb-10 border border-white/10 group">
                <Image 
                  src="/golden-jewlary.jpg"
                  alt="Jewellery Prime Render"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-[#FF00C7]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF00C7]">Luxury Render v2.4</span>
                </div>
              </div>

              <div className="w-full max-w-[353px] flex flex-col gap-4 mb-20">
                <LoadingActionButton
                  isLoading={isApproving}
                  onClick={handleApprove}
                  className="w-full h-[61px] text-[18px]"
                  icon={<Check className="w-5 h-5" />}
                >
                  Approve & Expand Catalog
                </LoadingActionButton>

                <button 
                  onClick={() => setIsGenerating(true)}
                  className="flex items-center justify-center gap-2 h-14 rounded-full border border-white/10 text-white/40 hover:text-white transition-all hover:bg-white/5"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span className="font-medium">Regenerate</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
