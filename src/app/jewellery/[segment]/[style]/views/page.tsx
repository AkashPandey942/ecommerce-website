"use client";

import FlowHeader from "@/components/FlowHeader";
import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import { Check, Sparkles, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoadingActionButton from "@/components/LoadingActionButton";
import { TAXONOMY } from "@/registry/taxonomy";

export default function JewelleryOutputViewsPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "bridal";
  const styleParam = (params.style as string) || "sets-and-pieces";

  const getRecommendedViews = () => {
    // Lookup in jewellery registry
    const res = TAXONOMY.jewellery.recommendedViews || ["Front View", "Side View", "Detail shot"];
    return res.map((title: string) => ({
      id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      image: "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg" // Fallback high-fidelity asset
    }));
  };

  const views = getRecommendedViews();

  const [selectedViews, setSelectedViews] = useState<string[]>([]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push(`/jewellery/${segment}/${styleParam}/result`);
  };

  const toggleView = (id: string) => {
    setSelectedViews(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  if (!mounted) return null;

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 font-roboto">
      <FlowHeader title="Choose Views" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[105px] px-5">
        <ProgressStepper currentStep={9} />

        {/* Heading Section */}
        <section className="mt-8 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-semibold text-3xl lg:text-[36px] leading-tight lg:leading-[45px] tracking-[-0.9px] text-[#E2E2E8] mb-4">
              Select Output Views
            </h1>
            <p className="font-normal text-base leading-[19px] text-[#C2C6D6]">
              Choose how you want to showcase your jewellery in the final editorial.
            </p>
          </motion.div>
        </section>

        {/* Views Grid */}
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
                  
                  {isSelected && (
                    <>
                      <div className="absolute inset-0 border-[3px] border-figma-gradient rounded-[8px]" />
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-figma-gradient flex items-center justify-center shadow-lg">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    </>
                  )}
                </div>
                <span className={`font-medium text-[13px] transition-colors ${
                  isSelected ? "text-white" : "text-[#E2E2E8]"
                }`}>
                  {view.title}
                </span>
              </motion.div>
            );
          })}

          {/* Custom Option Card */}
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
                <span className="font-medium text-[15px] text-white">Custom View</span>
              </div>
              <span className="font-medium text-[13px] text-[#E2E2E8]">
                Request Perspective
              </span>
            </motion.div>
          )}
        </div>

        {/* AI Custom Angle Prompt */}
        <AnimatePresence>
          {isCustomMode && (
            <motion.section 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-12 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-semibold text-xl text-white">AI Custom Lens</h2>
                <span className="font-semibold text-xs text-[#C5B6DE] uppercase tracking-wider">(Personalized)</span>
              </div>

              <div className="relative">
                <textarea
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-figma-gradient outline-none transition-all placeholder:text-white/20 resize-none text-sm shadow-inner"
                  placeholder="E.g. Dynamic bird's eye view of the jewelry layout on velvet fabric..."
                />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Action Button */}
        <div className="w-full mt-16 mb-20 flex justify-center">
          <LoadingActionButton
            isLoading={isGenerating}
            onClick={handleGenerate}
            className="w-full max-w-[353px] h-[61px]"
            icon={<Wand2 className="w-5 h-5" />}
            disabled={selectedViews.length === 0}
          >
            Generate Photoshoot
          </LoadingActionButton>
        </div>

        <Footer />
        <div className="h-[120px] lg:hidden" />
      </main>
    </div>
  );
}

