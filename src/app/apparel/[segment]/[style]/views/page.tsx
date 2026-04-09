"use client";

import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
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

  // Rule 6.8: Pre-select sensible bundle
  const [selectedViews, setSelectedViews] = useState<string[]>([]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push(`/apparel/${segment}/${styleParam}/final-results`);
  };

  const toggleView = (id: string) => {
    setSelectedViews(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Output Views" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5">
        {/* Step 7: Alternate Views selection */}
        <ProgressStepper currentStep={9} />

        {/* Heading Section */}
        <section className="mt-8 mb-10">
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

          {/* Custom Option Card (Hidden when custom mode active) */}
          {!isCustomMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setIsCustomMode(true)}
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="relative w-full aspect-[166/207] bg-[#1A1E29] rounded-[10px] overflow-hidden border border-white/5 flex flex-col items-center justify-center gap-4 group-hover:border-white/20 transition-all">
                <div className="w-[45px] h-[45px] rounded-full bg-black/40 flex items-center justify-center shadow-[0_0_20px_rgba(35,161,255,0.3)]">
                  <Sparkles className="w-5 h-5 text-[#00C2FF]" />
                </div>
                <span className="font-roboto font-medium text-[15px] text-white">Custom</span>
              </div>
              <span className="font-roboto font-medium text-[13px] text-[#E2E2E8]">
                Request Tool
              </span>
            </motion.div>
          )}
        </div>

        {/* AI Custom Angle Prompt (Appears when Custom is clicked) */}
        {isCustomMode && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white">
                AI Custom Angle
              </h2>
              <span className="font-roboto font-semibold text-xs leading-[14px] text-[#C5B6DE]">
                (Optional)
              </span>
            </div>

            <div className="relative group">
              <textarea
                className="w-full h-[95px] bg-black/30 border border-white/20 rounded-[10px] p-4 font-roboto text-sm focus:border-[#7C4DFF] focus:ring-1 focus:ring-[#7C4DFF] outline-none transition-all placeholder:text-[#C2C6D6]/40 resize-none"
                placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
              />
            </div>
          </motion.section>
        )}

        {/* Inline Generate Button */}
        <div className="w-full mt-12 mb-10 lg:mb-16">
          <div className="w-full max-w-[353px] mx-auto lg:max-w-[400px]">
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
