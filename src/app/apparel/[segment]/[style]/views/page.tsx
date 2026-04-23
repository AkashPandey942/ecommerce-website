"use client";

import Footer from "@/frontend/components/Footer";
import { Check, Sparkles, Wand2, AlertCircle, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import FlowHeader from "@/frontend/components/FlowHeader";
import { TAXONOMY } from "@/registry/taxonomy";
import { useProject } from "@/frontend/context/ProjectContext";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

export default function SelectOutputViewsPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "ladies";
  const styleParam = (params.style as string) || "ethnic-wear";

  const { currentProject, updateProject } = useProject();
  const { status, outputImages, outputImage, error, generate, reset } = useGenerationPolling();

  const isGenerating = status === "submitting" || status === "polling";
  const isFailed = status === "failed";
  const isCompleted = status === "completed";

  const getRecommendedViews = () => {
    const s = segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
    const styleKey = styleParam.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    const styles = TAXONOMY.apparel.styles[s] || [];
    const matchedStyle = styles.find((st: { title: string; recommendedViews?: string[] }) => st.title === styleKey);
    const viewTitles = matchedStyle?.recommendedViews || ["Front View", "Left View", "Right View", "Back View", "Swipe Detail"];
    return viewTitles.slice(0, 5).map((title: string) => ({
      id: title.toLowerCase().replace(/\s+/g, "-"),
      title,
      previewImage: currentProject?.primeImage || null,
    }));
  };

  const views = getRecommendedViews();
  const [selectedViews, setSelectedViews] = useState<string[]>(
    (currentProject?.selectedOutputViews && currentProject.selectedOutputViews.length > 0)
      ? currentProject.selectedOutputViews
      : views.slice(0, 4).map((v: { id: string }) => v.id)
  );
  const [isCustomMode, setIsCustomMode] = useState(Boolean(currentProject?.isCustomViewEnabled));
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(currentProject?.customViewPrompt || "");
  const MAX_VIEWS = 4;

  const normalizeModelImageUrl = (value: string | undefined, fallback: string) => {
    if (value && (value.startsWith("http://") || value.startsWith("https://"))) {
      return value;
    }
    return fallback;
  };

  useEffect(() => {
    if (!currentProject?.primeImage) {
      router.replace(`/apparel/${segment}/${styleParam}/approve-prime`);
    }
  }, [currentProject?.primeImage, router, segment, styleParam]);

  // When generation completes, save output views to context and navigate
  useEffect(() => {
    if (isCompleted) {
      const allImages = outputImages.length > 0 ? outputImages : outputImage ? [outputImage] : [];
      const selectedTitles = views
        .filter((view: { id: string; title: string }) => selectedViews.includes(view.id))
        .map((view: { title: string }) => view.title);

      if (isCustomMode) {
        selectedTitles.push("Custom");
      }

      const generatedViewLabels = allImages.map((_, index) => selectedTitles[index] || `View ${index + 1}`);

      updateProject({
        outputViews: allImages,
        selectedOutputViews: selectedViews,
        isCustomViewEnabled: isCustomMode,
        customViewPrompt: customPrompt,
        generatedViewLabels,
      });
      router.push(`/apparel/${segment}/${styleParam}/result`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted]);

  const handleGenerate = () => {
    if (!currentProject?.garmentImageUrl && !currentProject?.productImageUrl) return;
    reset();
    const totalCount = selectedViews.length + (isCustomMode ? 1 : 0);
    const garmentUrl = currentProject?.garmentImageUrl || currentProject?.productImageUrl || "";
    generate({
      garmentImageUrl: garmentUrl,
      modelImageUrl: normalizeModelImageUrl(currentProject?.modelImageUrl, garmentUrl),
      mode: "AI Studio" as const,
      hub: "Apparel" as const,
      segment: segment.charAt(0).toUpperCase() + segment.slice(1),
      wearType: styleParam.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      style: currentProject?.styleId || "Catalog",
      background: currentProject?.backgroundId || "Studio White",
      outputFormat: totalCount === 1 ? "single" : totalCount <= 3 ? "triple" : "multi-view",
      outputCount: Math.min(totalCount, 6),
      outputViews: isCustomMode ? [...selectedViews, "custom"] : selectedViews,
      prompt: customPrompt,
    });
  };

  const toggleView = (id: string) => {
    setSelectedViews(prev => {
      if (prev.includes(id)) return prev.filter(v => v !== id);
      const total = prev.length + (isCustomMode ? 1 : 0);
      if (total >= MAX_VIEWS) { setShowMaxWarning(true); setTimeout(() => setShowMaxWarning(false), 2000); return prev; }
      return [...prev, id];
    });
  };

  const toggleCustom = () => {
    if (!isCustomMode && selectedViews.length + 1 > MAX_VIEWS) {
      setShowMaxWarning(true); setTimeout(() => setShowMaxWarning(false), 2000); return;
    }
    setIsCustomMode(!isCustomMode);
  };

  const totalSelectedCount = selectedViews.length + (isCustomMode ? 1 : 0);

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Output Views" />
      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <div className="flex justify-center gap-2 mb-8 mt-2">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div key={dot} className={`h-[3px] w-8 rounded-full ${dot <= 5 ? "bg-gradient-to-r from-[#7C3AED] to-[#EC4899]" : "bg-white/10"}`} />
          ))}
        </div>

        {/* Generating overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                <motion.div className="absolute inset-0 border-4 border-t-[#7C4DFF] rounded-full"
                  animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-[#7C4DFF] animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Generating {totalSelectedCount} Output Views</h2>
                <p className="text-[#99A1AF] text-sm animate-pulse">Running multi-view render pipeline...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error banner */}
        {isFailed && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error || "Generation failed."}</p>
            <button onClick={handleGenerate} className="ml-auto text-red-400 text-sm underline flex items-center gap-1">
              <RefreshCcw className="w-3 h-3" /> Retry
            </button>
          </motion.div>
        )}

        {showMaxWarning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 bg-[#7C4DFF]/15 border border-[#7C4DFF]/30 rounded-lg text-xs text-[#E2E2E8]"
          >
            You can select up to {MAX_VIEWS} views including Custom.
          </motion.div>
        )}

        <section className="mb-10 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-roboto font-semibold text-[32px] md:text-[36px] leading-tight tracking-[-0.9px] text-[#E2E2E8] mb-2">
              Select Output Views
            </h1>
            <p className="font-roboto font-normal text-[14px] leading-[19px] text-[#C2C6D6]">
              Choose the outputs you want to generate for your high-fashion catalog.
            </p>
          </motion.div>
        </section>

        <div className="grid grid-cols-2 gap-4 mb-10">
          {views.map((view: { id: string; title: string; previewImage: string | null }, idx: number) => {
            const isSelected = selectedViews.includes(view.id);
            return (
              <motion.div key={view.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => toggleView(view.id)}
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
                  {isSelected && <div className="absolute inset-0 border-[2px] border-[#7C4DFF] rounded-[10px] z-10" />}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-[#7C4DFF] flex items-center justify-center shadow-lg z-20">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <span className={`font-roboto font-medium text-[13px] leading-[15px] transition-colors ${isSelected ? "text-white" : "text-[#E2E2E8]"}`}>
                  {view.title}
                </span>
              </motion.div>
            );
          })}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: views.length * 0.05 }}
            onClick={toggleCustom}
            className="flex flex-col items-center gap-3 group cursor-pointer"
          >
            <div className={`relative w-full aspect-[166/207] rounded-[10px] overflow-hidden border-2 transition-all bg-[#060B18] ${isCustomMode ? "border-[#7C4DFF]" : "border-white/10 hover:border-white/20"}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-xl bg-black/40 border border-[#7C4DFF]/50 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-[#4CC6FF]" />
                </div>
              </div>
              {isCustomMode && <div className="absolute inset-0 border-[2px] border-[#7C4DFF] rounded-[10px] z-10" />}
              {isCustomMode && (
                <div className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-[#7C4DFF] flex items-center justify-center shadow-lg z-20">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <span className={`font-roboto font-medium text-[13px] leading-[15px] transition-colors ${isCustomMode ? "text-white" : "text-[#E2E2E8]"}`}>
              Custom
            </span>
          </motion.div>

        </div>

          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-roboto font-semibold text-[16px] text-white">AI Custom Angle</h2>
              <span className="font-roboto font-normal text-[12px] text-[#C5B6DE]">(Optional)</span>
            </div>
            <textarea 
              value={customPrompt} 
              onChange={e => setCustomPrompt(e.target.value)}
              className="w-full h-[100px] bg-[#0A0A0A] border border-white/5 rounded-[10px] p-4 font-roboto text-sm text-white focus:border-[#7C4DFF] focus:ring-1 focus:ring-[#7C4DFF] outline-none transition-all placeholder:text-[#C2C6D6]/40 resize-none"
              placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
            />
            <div className="flex items-center gap-2 text-[#99A1AF] mt-3">
              <Sparkles className="w-3 h-3 text-[#7C4DFF]" />
              <p className="text-[10px] font-medium italic opacity-60">Professional output depends on the precision of your prompt.</p>
            </div>
          </motion.section>


        <div className="w-full mt-12 mb-10 lg:mb-16">
          <div className="w-full max-w-full sm:max-w-[353px] mx-auto lg:max-w-[400px]">
            <LoadingActionButton 
              isLoading={isGenerating} 
              onClick={handleGenerate}
              className="w-full h-[61px] rounded-[100px] bg-gradient-to-r from-[#4CC6FF] to-[#FF00C7] font-roboto font-bold text-[18px] text-white shadow-[0_10px_40px_rgba(124,77,255,0.3)]" 
              disabled={totalSelectedCount === 0 || isGenerating}
            >
              Generate Outputs
            </LoadingActionButton>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
