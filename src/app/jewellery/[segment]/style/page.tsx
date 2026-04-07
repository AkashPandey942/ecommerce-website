"use client";

import ApparelHeader from "@/components/ApparelHeader";
import ProgressStepper from "@/components/ProgressStepper";
import StyleCard from "@/components/StyleCard";
import Footer from "@/components/Footer";
import { Sparkles, X, Wand2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingActionButton from "@/components/LoadingActionButton";

export default function JewelleryStyleSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const segmentParam = params?.segment;
  const segment = typeof segmentParam === 'string' ? decodeURIComponent(segmentParam).toLowerCase() : 'bridal';
  
  const [mounted, setMounted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // ... (existing dialogue/state logic remains same)

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI thinking time for premium feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    router.push(`/jewellery/${segment}/custom/upload?prompt=${encodeURIComponent(customPrompt)}`);
  };

  const jewelleryStyles = [
// ... (lines truncated for brevity but remain unchanged in file)

    { 
      id: "sets",
      title: "Sets and pieces", 
      subtitle: "Traditional and festive styles", 
      image: (segment.includes("bridal") || segment === "bridal")
        ? "/golden-jewlary.jpg" 
        : "/elegant-woman-showcasing-silver-necklace-with-vibrant-amethyst-aquamarine-stones-set-against-deep-background-dramatic-effect.jpg" 
    },
    { 
      id: "custom",
      title: "Custom", 
      subtitle: "Unlisted styles or custom workflow", 
      icon: Sparkles 
    },
  ];

  useEffect(() => setMounted(true), []);

  const handleStyleSelect = (styleId: string, styleTitle: string) => {
    if (styleId === "custom") {
      setShowPrompt(true);
    } else {
      router.push(`/jewellery/${segment}/${styleTitle.toLowerCase().replace(' ', '-')}/upload`);
    }
  };

  if (!mounted) {
    return (
      <div className="relative flex flex-col min-h-screen bg-black text-white">
        <ApparelHeader title="Select Style" />
        <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5"></main>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <ApparelHeader title="Select Style" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5">
        {/* Step 2 partially progress per Figma (Step 1 full, Step 2 50%) */}
        <ProgressStepper currentStep={2} partialStep={true} />

        {/* Heading Section */}
        <section className="mt-8 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-roboto font-semibold text-3xl lg:text-[36px] leading-tight lg:leading-[45px] tracking-[-0.9px] text-[#E2E2E8] mb-4">
              Select Wear Type
            </h1>
            <p className="font-roboto font-normal text-base leading-[19px] lg:leading-[24px] text-[#C2C6D6] max-w-sm">
              Choose how your products are categorized in the AI editorial catalog
            </p>
          </motion.div>
        </section>

        {/* Style Selection List / Prompt UI */}
        <section className="mb-20">
          <AnimatePresence mode="wait">
            {!showPrompt ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4 max-w-[353px] mx-auto"
              >
                {jewelleryStyles.map((style, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStyleSelect(style.id, style.title)}
                  >
                    <StyleCard 
                      title={style.title} 
                      subtitle={style.subtitle} 
                      image={style.image} 
                      icon={style.icon} 
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-[353px] mx-auto"
              >
                <div className="relative p-6 bg-[#1A1E29] border border-white/10 rounded-[20px] shadow-2xl overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                    <button 
                      onClick={() => setShowPrompt(false)} 
                      className="p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-white/50" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-figma-gradient/20 rounded-lg">
                        <Sparkles className="w-5 h-5 text-[#00C2FF]" />
                      </div>
                      <h3 className="font-roboto font-semibold text-lg text-white">Custom Style Prompt</h3>
                    </div>
                    <p className="text-[#C2C6D6] text-xs leading-relaxed">
                      Describe the specific type of jewellery you want to generate. Be as detailed as possible (e.g. "Diamond choker with emerald drops").
                    </p>
                  </div>

                  <div className="relative mb-6">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Enter your custom request..."
                      className="w-full h-32 bg-black/40 border border-white/5 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-figma-gradient/50 transition-all resize-none text-sm"
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] text-white/20 uppercase tracking-widest font-medium">
                      AI ENGINE READY
                    </div>
                  </div>

                  <LoadingActionButton
                    isLoading={isGenerating}
                    onClick={handleGenerate}
                    disabled={!customPrompt.trim()}
                    className="w-full h-12"
                    icon={<Wand2 className="w-4 h-4" />}
                  >
                    GENERATE STYLE
                  </LoadingActionButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <Footer />
        <div className="h-[120px] lg:hidden" />
      </main>
    </div>
  );
}
