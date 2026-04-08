"use client";

import ApparelHeader from "@/components/ApparelHeader";
import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import LoadingActionButton from "@/components/LoadingActionButton";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, RefreshCcw, Sparkles, Wand2 } from "lucide-react";

export default function ApprovePrimeImagePage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "ladies";
  const style = (params.style as string) || "ethnic-wear";

  const [isGenerating, setIsGenerating] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  // Simulate AI Generation of the Prime Image
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGenerating(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleApprove = async () => {
    setIsApproving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push(`/apparel/${segment}/${style}/views`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <ApparelHeader title="Approve Prime Image" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        {/* Step 5: Approval */}
        <ProgressStepper currentStep={5} />

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
                <div className="absolute inset-0 border-4 border-[#7C4DFF]/20 rounded-full" />
                <motion.div 
                  className="absolute inset-0 border-4 border-t-[#7C4DFF] border-r-transparent border-b-transparent border-l-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#7C4DFF] animate-pulse" />
                </div>
              </div>
              <h2 className="font-roboto font-semibold text-2xl text-white mb-2">AI is Crafting Your Prime Image</h2>
              <p className="text-[#C2C6D6] text-sm animate-pulse">Running high-fidelity render pipeline...</p>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 w-full flex flex-col items-center"
            >
              <section className="mt-8 mb-6 text-center">
                <h1 className="font-roboto font-semibold text-2xl text-white mb-2">Review Prime Image</h1>
                <p className="text-[#C2C6D6] text-sm max-w-[280px]">
                  If you approve this, we'll generate all other views using this consistent style.
                </p>
              </section>

              <div className="relative w-full aspect-[3/4] max-w-[353px] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(124,77,255,0.2)] mb-10 border border-white/10 group">
                <Image 
                  src="/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg"
                  alt="Prime Image Result"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  priority
                />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                  <Wand2 className="w-3 h-3 text-[#00C2FF]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#00C2FF]">Prime Render</span>
                </div>
              </div>

              <div className="w-full max-w-[353px] flex flex-col gap-4 mb-20">
                <LoadingActionButton
                  isLoading={isApproving}
                  onClick={handleApprove}
                  className="w-full h-[61px] text-[18px]"
                  icon={<Check className="w-5 h-5" />}
                >
                  Approve & Expand
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
