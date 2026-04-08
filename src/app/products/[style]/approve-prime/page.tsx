"use client";

import FlowHeader from "@/components/FlowHeader";
import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import LoadingActionButton from "@/components/LoadingActionButton";
import { Check, RefreshCcw, MessageSquare } from "lucide-react";
import { useProject } from "@/context/ProjectContext";

export default function ProductsApprovePrimePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const style = (params.style as string) || "home-decor";
  const product = searchParams.get("product") || "Vase";

  const [isGenerating, setIsGenerating] = useState(true);
  const [showTextBox, setShowTextBox] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [feedback, setFeedback] = useState<string[]>([]);

  const { spendCredits } = useProject();
  
  // Dynamic mapping of prime image based on sub-category
  const getPrimeImage = () => {
    if (style.includes("home")) return "/assets/categories/home_decor.png";
    if (style.includes("beauty")) return "/assets/categories/beauty.png";
    if (style.includes("handicrafts")) return "/assets/categories/handicrafts.png";
    return "/assets/categories/home_decor.png";
  };

  const primeImage = getPrimeImage();

  useEffect(() => {
    const timer = setTimeout(() => setIsGenerating(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const feedbackChips = [
    "Smarter Lighting", "Clearer Texture", "Natural Reflection", "Bold Colors", "Minimalist Shadow", "Soft Contrast"
  ];

  const toggleFeedback = (chip: string) => {
    setFeedback(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
  };

  const handleApprove = async () => {
    const success = spendCredits(5);
    if (!success) {
      alert("Insufficient credits. Please top up.");
      return;
    }

    setIsApproving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push(`/products/${style}/views?product=${product}`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Approve Result" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        <ProgressStepper currentStep={5} />

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-8"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-[#7C4DFF] rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Rendering AI Asset...</h2>
                <p className="text-[#99A1AF]">Perfecting shadows and reflections for {product}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center py-10"
            >
              <div className="relative w-full max-w-[353px] aspect-square rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(124,77,255,0.2)] border border-white/10 mb-10">
                <Image src={primeImage} alt="Generated Prime" fill className="object-cover" priority />
              </div>

              <section className="w-full max-w-[400px] mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-xl">Refine Asset</h3>
                  <button onClick={() => setShowTextBox(!showTextBox)} className="text-[#7C4DFF] text-sm flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {showTextBox ? "Hide Note" : "Add Note"}
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {feedbackChips.map(chip => (
                    <button
                      key={chip}
                      onClick={() => toggleFeedback(chip)}
                      className={`px-4 py-2 rounded-full border text-sm transition-all ${
                        feedback.includes(chip) 
                        ? "bg-figma-gradient border-transparent text-white" 
                        : "bg-white/5 border-white/10 text-[#C2C6D6] hover:border-white/30"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {showTextBox && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-8">
                      <textarea 
                        className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#7C4DFF] outline-none"
                        placeholder="E.g. Focus on the surface texture or material finish..."
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-4">
                  <LoadingActionButton
                    isLoading={isApproving}
                    onClick={handleApprove}
                    className="w-full h-[61px] rounded-xl text-lg font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      <span>Approve & Spend 5 Credits</span>
                    </div>
                  </LoadingActionButton>

                  <button 
                    onClick={() => {
                      const success = spendCredits(1);
                      if (success) {
                        setIsGenerating(true);
                      } else {
                        alert("Insufficient credits. Please top up.");
                      }
                    }} 
                    className="w-full h-[54px] rounded-xl border border-white/10 bg-white/5 flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-white/50"
                  >
                    <RefreshCcw className="w-4 h-4" />
                    <span className="font-medium text-[14px]">Regenerate (1 Credit)</span>
                  </button>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
