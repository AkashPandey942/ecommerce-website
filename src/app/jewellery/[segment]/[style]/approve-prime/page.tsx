"use client";

import FlowHeader from "@/components/FlowHeader";
import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import LoadingActionButton from "@/components/LoadingActionButton";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, RefreshCcw, Sparkles, Gem, MessageSquare } from "lucide-react";
import { useProject } from "@/context/ProjectContext";

export default function JewelleryApprovePrimePage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "bridal";
  const style = (params.style as string) || "sets-and-pieces";

  const [isGenerating, setIsGenerating] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [showTextBox, setShowTextBox] = useState(false);

  const { spendCredits } = useProject();

  const chipPrompts: Record<string, string> = {
    "More Brilliance": "Calculating ray-tracing refractive indices for diamond facets...",
    "True Gold Tone": "Calibrating 22k/18k color temperature for premium luster...",
    "Better Skin Match": "Averaging sub-surface scattering for natural model integration...",
    "Sharper Focus": "Adjusting depth-of-field focus stacking for microscopic detail...",
    "Less Shadow": "Deploying virtual diffusion panels for soft-lit studio look...",
    "Antique Patina": "Adding procedural oxidation and heritage finish layers..."
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleChip = (chip: string) => {
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
    router.push(`/jewellery/${segment}/${style}/views`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Approve Base Asset" />

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
                  Confirm the look. This leads the style for your entire catalog.
                </p>
              </section>

              <div className="relative w-full aspect-square max-w-[353px] rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,194,255,0.15)] mb-10 border border-white/10 group">
                <Image 
                  src="/golden-jewlary.jpg"
                  alt="Jewellery Prime Render"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  priority
                />
                
                {/* AI Directive Engine Expansion */}
                <AnimatePresence>
                  {feedback.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-x-4 bottom-4 bg-[#7C4DFF]/90 backdrop-blur-md p-3 rounded-xl border border-white/20 z-10 shadow-2xl"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Check className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-bold uppercase text-white tracking-widest">AI Directive Engine</span>
                      </div>
                      <p className="text-[11px] text-white/90 leading-tight">
                        {chipPrompts[feedback[feedback.length - 1]] || "Enhancing carat fidelity..."}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-[#FF00C7]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF00C7]">Luxury Render v2.4</span>
                </div>
              </div>

              {/* SaaS Rule 6.7: Feedback UI */}
              <div className="w-full max-w-[353px] mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-roboto font-semibold text-base text-white">Improve this result</h3>
                  <button 
                    onClick={() => setShowTextBox(!showTextBox)}
                    className="flex items-center gap-1 text-[#00C2FF] text-sm font-medium"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {showTextBox ? "Hide Note" : "Add Note"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.keys(chipPrompts).map((chip: string) => (
                    <button
                      key={chip}
                      onClick={() => toggleChip(chip)}
                      className={`px-4 py-2 rounded-full border text-xs font-medium transition-all ${
                        feedback.includes(chip)
                        ? "bg-[#7C4DFF] border-transparent text-white shadow-[0_0_15px_rgba(124,77,255,0.4)]"
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
                      className="overflow-hidden"
                    >
                      <textarea 
                        placeholder="E.g. Make the stones reflect more blue light..."
                        className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#00C2FF] outline-none transition-all placeholder:text-[#C2C6D6]/40 resize-none"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full max-w-[353px] flex flex-col gap-4 mb-20">
                <LoadingActionButton
                  isLoading={isApproving}
                  onClick={handleApprove}
                  className="w-full h-[61px] text-[18px]"
                  icon={<Check className="w-5 h-5" />}
                >
                  Approve & Spend 5 Credits
                </LoadingActionButton>

                <button 
                  onClick={() => {
                    const success = spendCredits(1);
                    if (success) {
                      setIsGenerating(true);
                      setFeedback([]);
                    } else {
                      alert("Insufficient credits. Please top up.");
                    }
                  }}
                  className="flex items-center justify-center gap-2 h-14 rounded-full border border-white/10 text-white/40 hover:text-white transition-all hover:bg-white/5 bg-white/[0.02]"
                >
                  <RefreshCcw className="w-4 h-4" />
                  <span className="font-medium text-[14px]">Regenerate (1 Credit)</span>
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
