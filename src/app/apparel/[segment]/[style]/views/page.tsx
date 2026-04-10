"use client";

import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import { Check, Sparkles, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import LoadingActionButton from "@/components/LoadingActionButton";
import FlowHeader from "@/components/FlowHeader";
import { TAXONOMY } from "@/registry/taxonomy";

export default function SelectOutputViewsPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "ladies";
  const styleParam = (params.style as string) || "ethnic-wear";

  const getRecommendedViews = () => {
    const s = segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
    const styleKey = styleParam.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    const styles = TAXONOMY.apparel.styles[s] || [];
    const matchedStyle = styles.find((st: any) => st.title === styleKey);
    
    const viewTitles = matchedStyle?.recommendedViews || ["Front View", "Side View", "Detail shot"];
    return viewTitles.map((title: string) => ({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      image: matchedStyle?.samples?.[0] || "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg"
    }));
  };

  const views = getRecommendedViews();

  // Rule 6.8: Pre-select sensible bundle (First 3 recommended views)
  const [selectedViews, setSelectedViews] = useState<string[]>(
    views.slice(0, 3).map((v: any) => v.id)
  );
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMaxWarning, setShowMaxWarning] = useState(false);

  const MAX_VIEWS = 4;

  const handleGenerate = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push(`/apparel/${segment}/${styleParam}/video-style`);
  };

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

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Output Views" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        {/* Step 7: Alternate Views selection */}
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

        {/* Heading Section */}
        <section className="mt-8 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="font-roboto font-semibold text-3xl lg:text-[36px] leading-tight lg:leading-[45px] tracking-[-0.9px] text-[#E2E2E8] mb-4">
                  Select Output Views
                </h1>
                <p className="font-roboto font-normal text-base leading-[19px] text-[#C2C6D6]">
                  Choose the outputs you want to generate for your high-fashion catalog.
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
                  Premium Limit
                </span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-[#7C4DFF]/5 border border-[#7C4DFF]/20 rounded-xl flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-[#7C4DFF]/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#7C4DFF]" />
               </div>
               <p className="text-sm text-[#C5B6DE]">
                 <span className="font-bold text-white">Pro Tip:</span> Selecting up to 4 views ensures maximum consistency and rendering quality across your collection.
               </p>
            </div>
          </motion.div>
        </section>

        {/* Views Grid (2-column mobile, responsive desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                <div className={`relative w-full aspect-[166/207] rounded-[10px] overflow-hidden border-2 transition-all ${
                  isSelected ? "border-transparent" : "border-white/5 hover:border-white/20"
                }`}>
                  <Image 
                    src={view.image} 
                    alt={view.title} 
                    fill 
                    loading="lazy" 
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  
                  {/* Selection Indicator Overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 border-[3px] border-figma-gradient rounded-[8px]" />
                  )}
                  
                  {/* Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-figma-gradient flex items-center justify-center shadow-lg">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <span className={`font-roboto font-medium text-[13px] leading-[15px] transition-colors ${
                  isSelected ? "text-white" : "text-[#E2E2E8]"
                }`}>
                  {view.title}
                </span>
              </motion.div>
            );
          })}

          {/* Custom Option Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="flex flex-col items-center gap-3 group cursor-pointer"
          >
            <div className={`relative w-full aspect-[166/207] bg-[#1A1E29] rounded-[10px] overflow-hidden border-2 transition-all flex flex-col items-center justify-center gap-4 ${
              isCustomMode ? "border-transparent" : "border-white/5 hover:border-white/20"
            }`}>
              <div className={`w-[45px] h-[45px] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(35,161,255,0.3)] transition-all ${
                isCustomMode ? "bg-figma-gradient" : "bg-black/40"
              }`}>
                <Sparkles className={`w-5 h-5 transition-colors ${
                  isCustomMode ? "text-white" : "text-[#00C2FF]"
                }`} />
              </div>
              <span className="font-roboto font-medium text-[15px] text-white">Custom</span>
              
              {/* Selection Indicator Overlay */}
              {isCustomMode && (
                <div className="absolute inset-0 border-[3px] border-figma-gradient rounded-[8px]" />
              )}
              
              {/* Checkmark Badge */}
              {isCustomMode && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-figma-gradient flex items-center justify-center shadow-lg">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
            <span className={`font-roboto font-medium text-[13px] transition-colors ${
              isCustomMode ? "text-white" : "text-[#E2E2E8]"
            }`}>
              Request Tool
            </span>
          </motion.div>
        </div>

        {/* AI Custom Angle Prompt (Appears when Custom is clicked) */}
        {isCustomMode && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white">
                  AI Custom Angle
                </h2>
                <span className="font-roboto font-semibold text-xs leading-[14px] text-[#C5B6DE]">
                  (Expert Mode)
                </span>
              </div>
            </div>

            <div className="relative group mb-4">
              <textarea
                className="w-full h-[120px] bg-black/30 border border-white/20 rounded-[10px] p-4 font-roboto text-sm focus:border-[#7C4DFF] focus:ring-1 focus:ring-[#7C4DFF] outline-none transition-all placeholder:text-[#C2C6D6]/40 resize-none shadow-inner"
                placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
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

        {/* Inline Generate Button */}
        <div className="w-full mt-12 mb-10 lg:mb-16">
          <div className="w-full max-w-full sm:max-w-[353px] mx-auto lg:max-w-[400px]">
            <LoadingActionButton
              isLoading={isLoading}
              onClick={handleGenerate}
              className="w-full h-[61px]"
              disabled={selectedViews.length === 0}
            >
              Generate Outputs
            </LoadingActionButton>
          </div>
        </div>
      </main>

      {/* Desktop Footer */}
      <Footer />
    </div>
  );
}
