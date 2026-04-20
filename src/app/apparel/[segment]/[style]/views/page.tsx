"use client";

import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import { Check, Sparkles, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import FlowHeader from "@/frontend/components/FlowHeader";
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
    
    const viewTitles = matchedStyle?.recommendedViews || ["Front View", "Left View", "Right View", "Back View", "Drape Detail", "Border Close-up"];
    
    // SaaS Rule: Map specific titles to their provided assets
    const viewAssets: Record<string, string> = {
      "Front View": "/assets/front_view.jpg",
      "Left View": "/assets/left_view.png",
      "Right View": "/assets/right_view.png",
      "Close-up": "/assets/border_closeup.png",
      "Detail Shot": "/assets/detail_shot.png",
      "Back View": "/assets/back_view.png",
      "Drape Detail": "/assets/detail_shot.png",
      "Border Close-up": "/assets/border_closeup.png"
    };

    return viewTitles.map((title: string) => ({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      image: viewAssets[title] || matchedStyle?.samples?.[0] || "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg"
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
      const totalSelected = prev.length + (isCustomMode ? 1 : 0);
      if (totalSelected >= MAX_VIEWS) {
        setShowMaxWarning(true);
        setTimeout(() => setShowMaxWarning(false), 2000);
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleCustom = () => {
    if (!isCustomMode) {
      if (selectedViews.length >= MAX_VIEWS) {
        setShowMaxWarning(true);
        setTimeout(() => setShowMaxWarning(false), 2000);
        return;
      }
    }
    setIsCustomMode(!isCustomMode);
  };

  const totalSelectedCount = selectedViews.length + (isCustomMode ? 1 : 0);

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Output Views" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        {/* Progress Dots (Figma Style) */}
        <div className="flex justify-center gap-2 mb-8">
           {[1, 2, 3, 4, 5].map((dot) => (
             <div key={dot} className={`h-1 w-8 rounded-full ${dot <= 5 ? "bg-[#7C4DFF]" : "bg-white/10"}`} />
           ))}
        </div>

        {/* Heading Section */}
        <section className="mb-10 lg:text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-roboto font-semibold text-3xl lg:text-[36px] leading-tight lg:leading-[45px] tracking-[-0.9px] text-[#E2E2E8] mb-4">
              Select Output Views
            </h1>
            <p className="font-roboto font-normal text-base leading-[19px] text-[#C2C6D6]">
              Choose the outputs you want to generate for your high-fashion catalog.
            </p>
          </motion.div>
        </section>

        {/* Views Grid (2-column mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-20">
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
            onClick={toggleCustom}
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
              disabled={totalSelectedCount === 0}
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
