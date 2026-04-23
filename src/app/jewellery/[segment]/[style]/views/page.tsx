"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import { Check, Sparkles, Wand2, AlertCircle, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useProject } from "@/frontend/context/ProjectContext";
import { useState, useEffect } from "react";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { TAXONOMY } from "@/registry/taxonomy";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

export default function JewelleryOutputViewsPage() {
  const params = useParams();
  const router = useRouter();
  const { currentProject, updateProject } = useProject();
  const segment = (params.segment as string) || "bridal";
  const styleParam = (params.style as string) || "sets-and-pieces";

  const { status, outputImages, outputImage, error, generate, reset } = useGenerationPolling();
  const isGenerating = status === "submitting" || status === "polling";
  const isFailed = status === "failed";
  const isCompleted = status === "completed";

  const getRecommendedViews = () => {
    const res = TAXONOMY.jewellery.recommendedViews || ["Front View", "Side View", "Detail shot"];
    return res.map((title: string) => ({
      id: title.toLowerCase().replace(/\s+/g, "-"),
      title,
      previewImage: currentProject?.primeImage || null,
    }));
  };

  const views = getRecommendedViews();
  const [selectedViews, setSelectedViews] = useState<string[]>(views.slice(0, 3).map((v: any) => v.id));
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const MAX_VIEWS = 4;

  useEffect(() => {
    if (isCompleted) {
      const imgs = outputImages.length > 0 ? outputImages : outputImage ? [outputImage] : [];
      updateProject({ outputViews: imgs });
      router.push(`/jewellery/${segment}/${styleParam}/video-style`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted]);

  const handleGenerate = () => {
    if (!currentProject?.garmentImageUrl && !currentProject?.productImageUrl) return;
    reset();
    const count = selectedViews.length + (isCustomMode ? 1 : 0);
    generate({
      garmentImageUrl: currentProject?.garmentImageUrl || currentProject?.productImageUrl || "",
      modelImageUrl: currentProject?.modelImageUrl || currentProject?.garmentImageUrl || "",
      mode: "AI Studio" as const,
      hub: "Jewellery" as const,
      jewelleryGenre: segment.charAt(0).toUpperCase() + segment.slice(1),
      jewelleryStyle: styleParam.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      style: currentProject?.styleId || "Premium",
      background: currentProject?.backgroundId || "Studio Black",
      outputFormat: count <= 1 ? "single" : count <= 3 ? "triple" : "multi-view",
      outputCount: Math.min(count, 6),
      outputViews: selectedViews,
      prompt: customPrompt,
    });
  };

  const toggleView = (id: string) => setSelectedViews(prev => {
    if (prev.includes(id)) return prev.filter(v => v !== id);
    if (prev.length + (isCustomMode ? 1 : 0) >= MAX_VIEWS) {
      setShowMaxWarning(true); setTimeout(() => setShowMaxWarning(false), 2000); return prev;
    }
    return [...prev, id];
  });

  const totalSelectedCount = selectedViews.length + (isCustomMode ? 1 : 0);

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 font-roboto">
      <FlowHeader title="Choose Views" />
      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[105px] px-5">
        <ProgressStepper currentStep={9} />

        <AnimatePresence>
          {showMaxWarning && (
            <motion.div initial={{ opacity: 0, y: 50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 20, x: "-50%" }}
              className="fixed bottom-24 left-1/2 z-[100] px-6 py-3 bg-[#E5484D] rounded-full shadow-2xl flex items-center gap-3 border border-white/20"
            >
              <Sparkles className="w-3 h-3 text-white" />
              <span className="text-white font-medium text-sm">Maximum 4 views can be selected</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                <motion.div className="absolute inset-0 border-2 border-t-[#00C2FF] border-b-[#FF00C7] rounded-full"
                  animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Generating Jewelry Photoshoot</h2>
                <p className="text-[#99A1AF] text-sm animate-pulse">Rendering {totalSelectedCount} editorial views...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isFailed && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error || "Generation failed."}</p>
            <button onClick={handleGenerate} className="ml-auto text-red-400 text-sm underline flex items-center gap-1">
              <RefreshCcw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        <section className="mt-8 mb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-semibold text-3xl lg:text-[36px] leading-tight tracking-[-0.9px] text-[#E2E2E8] mb-4">Select Output Views</h1>
            <p className="font-normal text-base text-[#C2C6D6]">Choose how you want to showcase your jewellery in the final editorial.</p>
          </motion.div>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {views.map((view: any, idx: number) => {
            const isSelected = selectedViews.includes(view.id);
            return (
              <motion.div key={view.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }} onClick={() => toggleView(view.id)}
                className="flex flex-col items-center gap-3 group cursor-pointer"
              >
                <div className={`relative w-full aspect-[166/207] rounded-[10px] overflow-hidden border-2 transition-all ${isSelected ? "border-transparent" : "border-white/5 hover:border-white/20"}`}>
                  {view.previewImage ? (
                    <Image src={view.previewImage} alt={view.title} fill className="object-cover transition-transform group-hover:scale-105" loading="lazy" unoptimized />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white/20" />
                    </div>
                  )}
                  {isSelected && <><div className="absolute inset-0 border-[3px] border-figma-gradient rounded-[8px]" /><div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-figma-gradient flex items-center justify-center shadow-lg"><Check className="w-3.5 h-3.5 text-white" /></div></>}
                </div>
                <span className={`font-medium text-[13px] transition-colors ${isSelected ? "text-white" : "text-[#E2E2E8]"}`}>{view.title}</span>
              </motion.div>
            );
          })}

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
            onClick={() => setIsCustomMode(!isCustomMode)} className="flex flex-col items-center gap-3 group cursor-pointer"
          >
            <div className={`relative w-full aspect-[166/207] bg-[#1A1E29] rounded-[10px] overflow-hidden border-2 transition-all flex flex-col items-center justify-center gap-4 ${isCustomMode ? "border-transparent" : "border-white/5 hover:border-white/20"}`}>
              <div className={`w-[45px] h-[45px] rounded-full flex items-center justify-center ${isCustomMode ? "bg-figma-gradient" : "bg-black/40"}`}>
                <Sparkles className={`w-5 h-5 ${isCustomMode ? "text-white" : "text-[#00C2FF]"}`} />
              </div>
              <span className="font-medium text-[15px] text-white">Custom View</span>
              {isCustomMode && <><div className="absolute inset-0 border-[3px] border-figma-gradient rounded-[8px]" /><div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-figma-gradient flex items-center justify-center shadow-lg"><Check className="w-3.5 h-3.5 text-white" /></div></>}
            </div>
            <span className={`font-medium text-[13px] transition-colors ${isCustomMode ? "text-white" : "text-[#E2E2E8]"}`}>Request Perspective</span>
          </motion.div>
        </div>

        <AnimatePresence>
          {isCustomMode && (
            <motion.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-12 overflow-hidden">
              <h2 className="font-semibold text-xl text-white mb-4">AI Custom Lens <span className="text-xs text-[#C5B6DE] uppercase">(Expert Mode)</span></h2>
              <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-figma-gradient outline-none placeholder:text-white/20 resize-none text-sm mb-3"
                placeholder="E.g. Dynamic bird's eye view of the jewelry layout on velvet fabric..."
              />
              <div className="flex items-center gap-2 text-[#99A1AF] bg-white/5 border border-white/5 p-3 rounded-lg">
                <Wand2 className="w-4 h-4 text-[#00C2FF]" />
                <p className="text-[12px] font-medium italic">Professional output depends on the precision of your prompt.</p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="w-full mt-16 mb-20 flex justify-center">
          <LoadingActionButton isLoading={isGenerating} onClick={handleGenerate}
            className="w-full max-w-full sm:max-w-[353px] h-[61px]"
            icon={<Wand2 className="w-5 h-5" />} disabled={selectedViews.length === 0 || isGenerating}
          >Generate Photoshoot</LoadingActionButton>
        </div>
        <Footer />
      </main>
    </div>
  );
}
