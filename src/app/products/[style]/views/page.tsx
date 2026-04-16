"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import { Check, Sparkles, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { TAXONOMY } from "@/registry/taxonomy";

export default function ProductsOutputViewsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const styleParam = (params.style as string) || "home";
  const product = searchParams.get("product") || "Product";

  const getRecommendedViews = () => {
    // Find style in products (family format in taxonomy)
    const matchedFamily = TAXONOMY.products.families.find(
      (f: any) => f.title.toLowerCase().replace(/\s+/g, '-') === styleParam.toLowerCase() || f.leafNodes?.some((node: string) => node.toLowerCase() === product.toLowerCase())
    );
    
    const viewTitles = matchedFamily?.recommendedViews || ["Front View", "Staged Setting", "Texture Detail"];
    return viewTitles.map((title: string) => ({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      image: matchedFamily?.image || "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg"
    }));
  };

  const views = getRecommendedViews();

  // Rule 6.8: Pre-select sensible bundle (First 3 recommended views)
  const [selectedViews, setSelectedViews] = useState<string[]>(
    views.slice(0, 3).map((v: any) => v.id)
  );
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMaxWarning, setShowMaxWarning] = useState(false);

  const MAX_VIEWS = 4;

  const toggleView = (id: string) => {
    setSelectedViews(prev => {
      if (prev.includes(id)) {
        return prev.filter(v => v !== id);
      }
      if (prev.length >= MAX_VIEWS) {
        setShowMaxWarning(true);
        setTimeout(() => setShowMaxWarning(false), 2000);
        return prev;
      }
      return [...prev, id];
    });
  };


  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push(`/products/${styleParam}/video-style?product=${product}`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Generation Pack" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={9} />
        
        {/* Max Selection Toast */}
        <AnimatePresence>
          {showMaxWarning && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 20, x: "-50%" }}
              className="fixed bottom-24 left-1/2 z-[100] px-6 py-3 bg-[#E5484D] rounded-full shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-md"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-white font-medium text-sm">
                Maximum 4 views can be selected
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="mt-8 mb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="font-roboto font-semibold text-3xl lg:text-[36px] leading-tight text-[#E2E2E8] mb-4">
                  Select Secondary Angles
                </h1>
                <p className="font-roboto font-normal text-base text-[#C2C6D6]">
                  Choose how you want to showcase your {product} in the final setting.
                </p>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full h-fit">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[13px] font-bold ${selectedViews.length === MAX_VIEWS ? "text-figma-gradient bg-clip-text text-transparent" : "text-white"}`}>
                    {selectedViews.length}
                  </span>
                  <span className="text-[13px] text-[#C2C6D6]">/</span>
                  <span className="text-[13px] text-[#C2C6D6]">{MAX_VIEWS}</span>
                </div>
                <div className="w-[1px] h-3 bg-white/10" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#99A1AF]">
                  View Slots
                </span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-[#7C4DFF]/5 border border-[#7C4DFF]/20 rounded-xl flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-[#7C4DFF]/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#7C4DFF]" />
               </div>
               <p className="text-sm text-[#C5B6DE]">
                 <span className="font-bold text-white">Staging Tip:</span> Selecting up to 4 angles provides the most comprehensive staged catalog while keeping the AI focused on material detail.
               </p>
            </div>
          </motion.div>
        </section>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {views.map((view: any, idx: number) => {
            const isSelected = selectedViews.includes(view.id);
            return (
              <motion.div
                key={view.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => toggleView(view.id)}
                className="flex flex-col items-center gap-3 group cursor-pointer"
              >
                <div className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  isSelected ? "border-transparent" : "border-white/5 hover:border-white/20"
                }`}>
                  <Image src={view.image} alt={view.title} fill className="object-cover transition-transform group-hover:scale-105" />
                  {isSelected && (
                    <>
                      <div className="absolute inset-0 border-[3px] border-figma-gradient rounded-[8px]" />
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-figma-gradient flex items-center justify-center shadow-lg">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    </>
                  )}
                </div>
                <span className={`text-[13px] font-medium transition-colors ${isSelected ? "text-white" : "text-[#E2E2E8]"}`}>
                  {view.title}
                </span>
              </motion.div>
            );
          })}


          {/* Custom Angle Card */}
          <motion.div
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="flex flex-col items-center gap-3 group cursor-pointer"
          >
            <div className={`relative w-full aspect-square bg-[#1A1E29] rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-4 ${
              isCustomMode ? "border-transparent" : "border-white/5 hover:border-white/20"
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(35,161,255,0.3)] transition-all ${
                isCustomMode ? "bg-figma-gradient" : "bg-black/40"
              }`}>
                <Sparkles className={`w-5 h-5 transition-colors ${
                  isCustomMode ? "text-white" : "text-[#00C2FF]"
                }`} />
              </div>
              <span className="text-sm font-medium text-white">Custom Goal</span>
              
              {/* Selection Indicator Overlay */}
              {isCustomMode && (
                <>
                  <div className="absolute inset-0 border-[3px] border-figma-gradient rounded-[8px]" />
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-figma-gradient flex items-center justify-center shadow-lg">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                </>
              )}
            </div>
            <span className={`text-[13px] font-medium transition-colors ${isCustomMode ? "text-white" : "text-[#E2E2E8]"}`}>
              Request Tool
            </span>
          </motion.div>
        </div>

        <AnimatePresence>
          {isCustomMode && (
            <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-12 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold text-white">AI Custom Lens</h2>
                <span className="font-semibold text-xs text-[#C5B6DE] uppercase tracking-wider">(Expert Mode)</span>
              </div>

              <div className="relative mb-4">
                <textarea
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-[#7C4DFF] outline-none transition-all placeholder:text-white/20 text-sm shadow-inner"
                  placeholder="E.g. In a minimalist shelf setting with soft daylight shadowing..."
                />
              </div>

              <div className="flex items-center gap-2 text-[#99A1AF] bg-white/5 border border-white/5 p-3 rounded-lg">
                <Wand2 className="w-4 h-4 text-[#7C4DFF]" />
                <p className="text-[12px] font-medium italic">
                  Professional output depends on the precision of your prompt. Be descriptive for cinematic results.
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="w-full mt-16 mb-20 flex justify-center">
          <LoadingActionButton
            isLoading={isGenerating}
            onClick={handleGenerate}
            className="w-full max-w-full sm:max-w-[353px] h-[61px] text-lg font-bold"
            disabled={selectedViews.length === 0}
          >
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              <span>Generate Studio Pack</span>
            </div>
          </LoadingActionButton>
        </div>
      </main>

      <Footer />
    </div>
  );
}
