"use client";

import FlowHeader from "@/components/FlowHeader";
import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import { Check, Sparkles, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import LoadingActionButton from "@/components/LoadingActionButton";
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

  const [selectedViews, setSelectedViews] = useState<string[]>([]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleView = (id: string) => {
    setSelectedViews(prev => 
      prev.includes(id) ? (prev as string[]).filter(v => v !== id) : [...prev, id]
    );
  };


  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push(`/products/${styleParam}/result?product=${product}`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Generation Pack" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={9} />

        <section className="mt-8 mb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-roboto font-semibold text-3xl lg:text-[36px] leading-tight text-[#E2E2E8] mb-4">
              Select Secondary Angles
            </h1>
            <p className="font-roboto font-normal text-base text-[#C2C6D6]">
              Choose the derivative outputs for your {product} catalog.
            </p>
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


          {!isCustomMode && (
            <motion.div
              onClick={() => setIsCustomMode(true)}
              className="relative w-full aspect-square bg-[#1A1E29] rounded-xl border border-white/5 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-white/20 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#00C2FF]" />
              </div>
              <span className="text-sm font-medium text-white">Custom Goal</span>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {isCustomMode && (
            <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-12 overflow-hidden">
              <h2 className="text-xl font-semibold mb-4">AI Custom Lens</h2>
              <textarea
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-[#7C4DFF] outline-none transition-all placeholder:text-white/20 text-sm"
                placeholder="E.g. In a minimalist shelf setting with soft daylight shadowing..."
              />
            </motion.section>
          )}
        </AnimatePresence>

        <div className="w-full mt-16 mb-20 flex justify-center">
          <LoadingActionButton
            isLoading={isGenerating}
            onClick={handleGenerate}
            className="w-full max-w-[353px] h-[61px]"
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
