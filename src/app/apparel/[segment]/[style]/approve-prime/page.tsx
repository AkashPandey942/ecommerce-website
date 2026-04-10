"use client";

import FlowHeader from "@/components/FlowHeader";
import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import LoadingActionButton from "@/components/LoadingActionButton";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Check, RefreshCcw, Sparkles, Wand2, MessageSquare, X } from "lucide-react";
import { useProject } from "@/context/ProjectContext";

export default function ApprovePrimeImagePage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "ladies";
  const style = (params.style as string) || "ethnic-wear";

  const [isGenerating, setIsGenerating] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [showTextBox, setShowTextBox] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isRegenerateMode, setIsRegenerateMode] = useState(false);
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const { spendCredits } = useProject();

  const feedbackChips = [
    "Better Drape", "Clearer Border", "Premium Studio Look", "Face More Natural", "Better Lighting", "More Catalog-Safe"
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGenerating(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const chipPrompts: Record<string, string> = {
    "Better Drape": "Enhancing fabric physics and natural gravitational folds...",
    "Clearer Border": "Sharpening embroidery edges and contrast markers...",
    "Premium Glow": "Adjusting studio lighting for high-end cinematic luster...",
    "Natural Face": "Refining skin texture and realistic symmetric features...",
    "Better Lighting": "Remapping shadows for balanced 3-point studio lighting...",
    "Sharper Detail": "Increasing textural resolution on fine material patterns..."
  };

  const toggleChip = (chip: string) => {
    setSelectedChips(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
  };

  const handleApprove = async () => {
    const success = spendCredits(5);
    if (!success) {
      alert("Insufficient credits. Please top up.");
      return;
    }

    setIsApproving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push(`/apparel/${segment}/${style}/views`);
  };

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowFullPreview(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Approve Prime Image" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        <ProgressStepper currentStep={7} />

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
                  Improve result through quick chips or approve to expand the pack.
                </p>
              </section>

              <div 
                onDoubleClick={() => setShowFullPreview(true)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative w-full aspect-[3/4] max-w-[353px] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(124,77,255,0.2)] mb-10 border border-white/10 group cursor-zoom-in active:scale-[0.98] transition-all"
              >
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

                {/* Simulated AI Directive Expansion */}
                <AnimatePresence>
                  {selectedChips.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-x-4 bottom-4 bg-[#7C4DFF]/90 backdrop-blur-md p-3 rounded-xl border border-white/20 z-10"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-bold uppercase text-white tracking-widest">AI Directive Engine</span>
                      </div>
                      <p className="text-[11px] text-white/90 leading-tight">
                        {chipPrompts[selectedChips[selectedChips.length - 1]]}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full max-w-[353px] flex flex-col gap-4 mb-10">
                <LoadingActionButton
                  isLoading={isApproving}
                  onClick={handleApprove}
                  className="w-full h-[61px] text-[18px]"
                  icon={<Check className="w-5 h-5" />}
                >
                  Approve and Continue
                </LoadingActionButton>

                {!isRegenerateMode && (
                  <button 
                    onClick={() => setIsRegenerateMode(true)}
                    className="text-[#7C4DFF] text-sm font-medium hover:underline transition-all"
                  >
                    Not happy with the result?
                  </button>
                )}
              </div>

              <AnimatePresence>
                {isRegenerateMode && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full max-w-[353px] overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-roboto font-semibold text-base text-white">Refine & Regenerate</h3>
                      <button 
                        onClick={() => setShowTextBox(!showTextBox)}
                        className="flex items-center gap-1 text-[#7C4DFF] text-xs font-medium"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {showTextBox ? "Hide Note" : "Add Note"}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {feedbackChips.map(chip => (
                        <button
                          key={chip}
                          onClick={() => toggleChip(chip)}
                          className={`px-4 py-2 rounded-full border text-[11px] font-medium transition-all ${
                            selectedChips.includes(chip)
                            ? "bg-figma-gradient border-transparent text-white shadow-[0_0_15px_rgba(124,77,255,0.4)]"
                            : "bg-white/5 border-white/10 text-[#C2C6D6] hover:border-white/20"
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {showTextBox && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mb-6"
                        >
                          <textarea 
                            placeholder="E.g. Focus on the golden pallu details..."
                            className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#7C4DFF] outline-none transition-all placeholder:text-[#C2C6D6]/40 resize-none"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button 
                      onClick={() => {
                        setIsGenerating(true);
                        setIsRegenerateMode(false);
                        setSelectedChips([]);
                      }}
                      className="w-full h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-[#7C4DFF] font-bold text-sm mb-20"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Regenerate
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Full Preview Modal */}
      <AnimatePresence>
        {showFullPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFullPreview(false)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-5 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <Image 
                src="/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg"
                alt="Full Preview"
                fill
                className="object-contain bg-black/50"
              />
              <div className="absolute top-6 right-6 p-4">
                 <button className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-all border border-white/10 group">
                    <X className="w-6 h-6 text-white" />
                 </button>
              </div>
              
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-fit px-6 py-2 bg-white/5 backdrop-blur-lg rounded-full border border-white/10 text-white/60 text-xs font-medium uppercase tracking-widest whitespace-nowrap">
                Click anywhere to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
