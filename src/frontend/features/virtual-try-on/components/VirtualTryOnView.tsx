"use client";

import React, { useState } from "react";
import FlowHeader from "@/frontend/components/FlowHeader";
import UploadZone from "@/frontend/components/UploadZone";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Image as ImageIcon, Sparkles, User, Layout, Check, Download, Share2 } from "lucide-react";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import SegmentCard from "@/frontend/components/SegmentCard";
import ProductScroll from "@/frontend/components/ProductScroll";
import Footer from "@/frontend/components/Footer";
import Image from "next/image";
import { storageService } from "@/backend/services/storageService";
import { useSession } from "next-auth/react";

type StatusResponse = {
  success?: boolean;
  status?: "pending" | "processing" | "completed" | "failed";
  outputImage?: string;
  outputImages?: string[];
  error?: string;
};

type FormErrors = {
  userImage?: string;
  clothingImage?: string;
  category?: string;
  style?: string;
  format?: string;
  submit?: string;
};

const CATEGORIES = ["Tops (Shirts)", "Bottoms (Pants)", "Dresses"];
const PRODUCT_TYPES = [
  { title: "Apparel", image: "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg", fullWidth: false },
  { title: "Jewellery", image: "/home_jewellery.png", fullWidth: false },
  { title: "Accessories", image: "/home_accessories.png", fullWidth: true },
  { title: "Products", image: "/home_products.png", fullWidth: true },
];

const MODELS = [
  "/Model_1.jpg", "/Model_2.jpg", "/Model_3.jpg", 
  "/Model_4.jpg", "/Model_5.jpg", "/Model_6.jpg",
  "/Model_7.jpg", "/Model_8.jpg"
];

const BACKGROUNDS = [
  { name: "White Studio", img: "/bg_white_studio.png" },
  { name: "Premium Studio", img: "/bg_premium_studio.png" },
  { name: "Saree Festival", img: "/bg_saree_festival.png" },
  { name: "Outdoor", img: "/bg_outdoor.png" },
  { name: "Modern Office", img: "/bg_modern_office.png" }
];

const OUTPUT_STYLES = ["Catalog", "Premium", "Social Media", "Lifestyle"];
const OUTPUT_FORMATS = [
  { label: "Single", value: "single", count: 1 },
  { label: "3 Views", value: "triple", count: 3 },
  { label: "6 Views", value: "multi-view", count: 6 },
];
const RESULT_LABELS = ["Front View", "Left View", "Right View", "Drape Detail", "Borree Detail", "Border Close-up"];

export const VirtualTryOnView = () => {
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [clothingPhoto, setClothingPhoto] = useState<File | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [productType, setProductType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [activeTab, setActiveTab] = useState<"Virtual Try-On" | "AI Studio">("Virtual Try-On");
  const [userPoint, setUserPoint] = useState<{x: number, y: number} | null>(null);
  const [clothingPoint, setClothingPoint] = useState<{x: number, y: number} | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [backgroundStyle, setBackgroundStyle] = useState<string | null>(null);
  const [outputStyle, setOutputStyle] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>("multi-view");
  const [directorNotes, setDirectorNotes] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeResultLabel, setActiveResultLabel] = useState<string>(RESULT_LABELS[0]);

  const { data: session } = useSession();

  const isVirtualFlow = activeTab === "Virtual Try-On";
  const hasUserImage = Boolean(userPhoto);
  const hasClothingImage = Boolean(clothingPhoto);
  const hasCategory = Boolean(category);
  const hasStyle = Boolean(outputStyle);
  const hasFormat = Boolean(outputFormat);

  const canSelectCategory = !isVirtualFlow || (hasUserImage && hasClothingImage);
  const canSelectStyle = !isVirtualFlow || (canSelectCategory && hasCategory);
  const canAddNotes = !isVirtualFlow || (canSelectStyle && hasStyle && hasFormat);
  const canGenerateVirtual = hasUserImage && hasClothingImage && hasCategory && hasStyle && hasFormat;
  const canGenerateAIStudio = Boolean(clothingPhoto && hasStyle && hasFormat);
  const canGenerate = loading ? false : (isVirtualFlow ? canGenerateVirtual : canGenerateAIStudio);

  const validateVirtualTryOnInputs = () => {
    const nextErrors: FormErrors = {};

    if (!userPhoto) {
      nextErrors.userImage = "User image is required";
    }

    if (!clothingPhoto) {
      nextErrors.clothingImage = "Clothing image is required";
    }

    if (!category) {
      nextErrors.category = "Please select a clothing category";
    }

    if (!outputStyle) {
      nextErrors.style = "Please select an output style";
    }

    if (!outputFormat) {
      nextErrors.format = "Please select an output format";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleGenerateTryOn = async () => {
    setSubmitError(null);

    if (isVirtualFlow && !validateVirtualTryOnInputs()) {
      return;
    }

    if (!isVirtualFlow && !clothingPhoto) {
      setFormErrors({ clothingImage: "Clothing image is required" });
      return;
    }

    if (!session?.user) {
      console.warn("User is not signed in, proceeding without authentication.");
    }

    setLoading(true);
    setResults(null);

    try {
      const userId = session?.user?.id ?? "guest-user";
      let modelUrl = selectedModel;
      let garmentUrl = "";

      // Public assets selected from the model picker are stored as relative paths.
      // Convert them to absolute URLs so backend URL validation accepts them.
      if (modelUrl && modelUrl.startsWith("/")) {
        modelUrl = `${window.location.origin}${modelUrl}`;
      }

      if (clothingPhoto instanceof File) {
        garmentUrl = await storageService.uploadGarment(userId, clothingPhoto);
      }
      
      if (userPhoto instanceof File) {
        modelUrl = await storageService.uploadGarment(userId, userPhoto);
      }

      const payload = {
        userImage: modelUrl || undefined,
        clothImage: garmentUrl || undefined,
        category: category || "",
        style: outputStyle || "",
        outputFormat,
        outputCount: OUTPUT_FORMATS.find((option) => option.value === outputFormat)?.count || 6,
        notes: directorNotes.trim() || undefined,
        modelId: selectedModel ?? undefined,
        background: backgroundStyle ?? undefined,
        prompt: directorNotes.trim() || undefined,
        garmentImageUrl: garmentUrl,
        modelImageUrl: modelUrl || undefined,
        mode: activeTab,
        userPoint,
        clothingPoint,
      };

      console.log("[VirtualTryOn] Sending payload", {
        category: payload.category,
        style: payload.style,
        outputFormat: payload.outputFormat,
        outputCount: payload.outputCount,
        hasUserImage: Boolean(payload.userImage),
        hasClothImage: Boolean(payload.clothImage),
        mode: payload.mode,
      });

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const failed = await response.json().catch(() => ({}));
        console.error("[VirtualTryOn] Generate request failed", failed);
        throw new Error(failed.error || "API Connection Error");
      }

      const data = await response.json();
      console.log("[VirtualTryOn] Generate response", data);
      
      // Start polling for the real AI result
      const pollResult = async (jobId: string) => {
        try {
          const statusRes = await fetch(`/api/status?jobId=${jobId}`);
          const statusData = (await statusRes.json()) as StatusResponse;

          if (!statusRes.ok || statusData.success === false) {
            throw new Error(statusData.error || "Failed to fetch generation status");
          }

          if (statusData.status === "completed" && statusData.outputImage) {
            const images = statusData.outputImages?.filter(Boolean) || [statusData.outputImage];
            const mappedResults = RESULT_LABELS.reduce<Record<string, string>>((acc, label, index) => {
              if (images.length === 1) {
                acc[label] = images[0] || "";
              } else {
                acc[label] = images[index] || images[0] || "";
              }
              return acc;
            }, {});
            setResults(mappedResults);
            const firstAvailableLabel = RESULT_LABELS.find((label) => mappedResults[label]);
            setActiveResultLabel(firstAvailableLabel || RESULT_LABELS[0]);
            setLoading(false);
          } else if (statusData.status === "failed") {
            throw new Error(statusData.error || "AI generation failed");
          } else {
            // Still processing, poll again only if the result was successful so far
            if (statusData.error) {
              throw new Error(statusData.error);
            }
            setTimeout(() => pollResult(jobId), 3000);
          }
        } catch (err) {
          console.error("Polling error:", err);
          setLoading(false);
          const message = err instanceof Error ? err.message : "Failed to check generation status.";
          setSubmitError(message);
        }
      };

      if (data.jobId) {
        pollResult(data.jobId);
      } else {
        throw new Error("No Job ID returned from AI service");
      }

    } catch (error) {
      console.error("AI Generation Error:", error);
      setLoading(false);
      const message = error instanceof Error ? error.message : "Failed to start AI generation. Please check your connection.";
      setSubmitError(message);
    }
  };

  const resultItems = RESULT_LABELS.map((label) => ({
    label,
    url: results?.[label] || "",
  }));

  const activeResultUrl =
    resultItems.find((item) => item.label === activeResultLabel)?.url ||
    resultItems.find((item) => item.url)?.url ||
    "";

  const handleDownloadResult = () => {
    if (!activeResultUrl) return;
    const link = document.createElement("a");
    link.href = activeResultUrl;
    link.download = `${activeResultLabel.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  const handleShareResult = async () => {
    if (!activeResultUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Virtual Try-On Result",
          text: `Check my ${activeResultLabel}`,
          url: activeResultUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(activeResultUrl);
      setSubmitError("Result link copied. You can now share it.");
    } catch (error) {
      console.error("Share failed:", error);
      setSubmitError("Unable to share result right now.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F111A] text-[#E2E2E8] font-roboto">
      <FlowHeader title=" " showBack={true} />
      
      <div className="max-w-[1400px] mx-auto px-6 pt-[120px] pb-10">
        
        <div className="flex border-b border-white/5 mb-8">
          <button 
            onClick={() => setActiveTab("Virtual Try-On")}
            className={`px-8 py-4 font-bold text-sm transition-all relative ${
              activeTab === "Virtual Try-On" 
                ? "text-white" 
                : "text-[#9CA3AF] hover:text-white"
            }`}
          >
            Virtual Try-On
            {activeTab === "Virtual Try-On" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-figma-gradient shadow-[0_0_10px_rgba(124,77,255,0.5)]" />
            )}
          </button>
          <button 
            onClick={() => {
              setActiveTab("AI Studio");
              setProductType(null);
            }}
            className={`px-8 py-4 font-bold text-sm transition-all relative ${
              activeTab === "AI Studio" 
                ? "text-white" 
                : "text-[#9CA3AF] hover:text-white"
            }`}
          >
            AI Studio
            {activeTab === "AI Studio" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-figma-gradient shadow-[0_0_10px_rgba(124,77,255,0.5)]" />
            )}
          </button>
        </div>

        {activeTab === "AI Studio" && !productType ? (
          <div className="w-full max-w-full lg:max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Progress Indication (Stepper) - Step 1 for Selective Hub */}
            <ProgressStepper currentStep={1} />

            {/* Heading Section */}
            <section className="mt-8 mb-10 text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="font-roboto font-semibold text-3xl lg:text-[36px] leading-tight lg:leading-[45px] tracking-[-0.9px] text-[#E2E2E8] mb-4">
                  Creative Hubs
                </h1>
                <p className="font-roboto font-normal text-base leading-[19px] text-[#C2C6D6]">
                  Choose your product category to start high-fidelity AI generation
                </p>
              </motion.div>
            </section>

            {/* Hub Selection Grid - Matching Apparel/Jewellery selection flow */}
            <section className="mb-20">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {PRODUCT_TYPES.map((type, idx) => (
                  <motion.div 
                    key={idx} 
                    className={`${type.fullWidth ? "col-span-2 lg:col-span-1" : "col-span-1"}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setProductType(type.title)}
                  >
                    <SegmentCard 
                      title={type.title} 
                      image={type.image} 
                      fullWidth={type.fullWidth} 
                    />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Trending Section - Matching structural pattern */}
            <section className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white">
                  Trending in AI Lab
                </h2>
                
                <button className="flex items-center justify-center px-[10px] py-[5px] h-6 bg-black/30 shadow-[2px_2px_2px_rgba(0,0,0,0.54)] rounded-full group">
                  <span className="font-roboto font-medium text-[12px] leading-[14px] text-center uppercase text-figma-gradient group-hover:scale-105 transition-transform">
                    See gallery
                  </span>
                </button>
              </div>

              <div className="-mx-5">
                <ProductScroll />
              </div>
            </section>

            <Footer />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
            
            {/* Left Panel - Uploads */}
            <aside className="w-full lg:w-[320px] space-y-6">
              <div className="bg-[#1A1D2B] border border-white/5 rounded-[24px] p-6 space-y-8">
                <ProgressStepper currentStep={2} />
                
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h2 className="text-xl font-bold tracking-tight text-white px-1">
                    {activeTab === "Virtual Try-On" ? "Virtual Try-On" : productType}
                  </h2>
                  {activeTab === "AI Studio" && (
                    <button 
                      onClick={() => setProductType(null)}
                      className="text-[10px] font-bold text-figma-gradient hover:underline uppercase tracking-widest"
                    >
                      Change Type
                    </button>
                  )}
                </div>
                
                <div className="space-y-6">
                {/* 1. Upload User Photo (Only for Virtual Try-On) */}
                {activeTab === "Virtual Try-On" && (
                  <div className="space-y-4">
                    <div className="relative aspect-[4/3] bg-[#0F111A] rounded-[20px] border border-dashed border-white/10 overflow-hidden group">
                        <UploadZone 
                          onFileSelect={(file) => {
                            setUserPhoto(file);
                            setFormErrors((prev) => ({ ...prev, userImage: undefined }));
                          }}
                          hideText={true} 
                          allowPointSelection={true}
                          onPointSelect={setUserPoint}
                        />
                      {!userPhoto && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pointer-events-none text-center bg-black/40">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                              <User className="w-5 h-5 text-gray-400" />
                          </div>
                          <p className="text-sm font-bold text-white mb-1">Upload Your Image</p>
                        </div>
                      )}
                    </div>
                    {formErrors.userImage && <p className="text-xs text-red-400">{formErrors.userImage}</p>}
                  </div>
                )}

                {/* 2. Upload Clothing (Both modes) */}
                <div className="space-y-4">
                  <div className="relative aspect-[4/3] bg-[#0F111A] rounded-[20px] border border-dashed border-white/10 overflow-hidden group">
                      <UploadZone 
                        onFileSelect={(file) => {
                          setClothingPhoto(file);
                          setFormErrors((prev) => ({ ...prev, clothingImage: undefined }));
                        }}
                        hideText={true} 
                        allowPointSelection={true}
                        onPointSelect={setClothingPoint}
                      />
                    {!clothingPhoto && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pointer-events-none text-center bg-black/40">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                            <Layout className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-bold text-white mb-1">Upload Clothing</p>
                      </div>
                    )}
                  </div>
                  {formErrors.clothingImage && <p className="text-xs text-red-400">{formErrors.clothingImage}</p>}
                </div>

                {/* 3. Choose Product Type (Removed from sidebar since it's the primary selector now) */}
              </div>
            </div>
          </aside>

          {/* Right Panel - Results & Controls */}
          <main className="flex-grow bg-[#1A1D2B] border border-white/5 rounded-[24px] p-8 shadow-2xl relative transition-all duration-500">
            <div className="space-y-12">
              
              {/* Select Model Section (Only for AI Studio "Apparel") */}
              {activeTab === "AI Studio" && productType === "Apparel" && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Model</h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                    {MODELS.map((model, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedModel(model)}
                        className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                          selectedModel === model ? "border-[#5B45FF] scale-105 shadow-[0_0_20px_rgba(91,69,255,0.4)]" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={model} alt={`Model ${idx + 1}`} className="w-full h-full object-cover" />
                        {selectedModel === model && (
                          <div className="absolute top-1 right-1 bg-[#5B45FF] rounded-md p-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Settings Based on Product Type */}
              {activeTab === "AI Studio" && productType && productType !== "Apparel" && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="p-8 border border-[#5B45FF]/20 rounded-2xl bg-[#5B45FF]/5"
                 >
                   <h3 className="text-xl font-bold text-white mb-2">Customizing for {productType}</h3>
                   <p className="text-sm text-[#9CA3AF]">The AI is prepared to generate high-fidelity results specializing in {productType.toLowerCase()} studio lighting and textures.</p>
                 </motion.div>
              )}

              {/* Background Style Section (Only for AI Studio) */}
              {activeTab === "AI Studio" && productType && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Background Style</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {BACKGROUNDS.map((bg, idx) => (
                      <div key={idx} className="space-y-2 group">
                        <button
                          onClick={() => setBackgroundStyle(bg.name)}
                          className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                            backgroundStyle === bg.name ? "border-[#5B45FF] scale-102 shadow-[0_0_15px_rgba(91,69,255,0.3)]" : "border-transparent opacity-60 hover:opacity-90"
                          }`}
                        >
                          <img src={bg.img} alt={bg.name} className="w-full h-full object-cover" />
                        </button>
                        <p className={`text-[10px] font-bold text-center transition-colors ${backgroundStyle === bg.name ? "text-[#5B45FF]" : "text-[#9CA3AF]"}`}>
                          {bg.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Controls and Output Section */}
              <div className="flex flex-col xl:flex-row gap-12">
                <div className="w-full xl:w-[350px] space-y-12">
                   {/* Gender and Category */}
                   <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 gap-8">
                      {/* Category selection (Only relevant for apparel-like items) */}
                      {(activeTab === "Virtual Try-On" || productType === "Apparel") && (
                        <div className="space-y-5">
                          <h3 className="text-sm font-bold text-white">Clothing Category</h3>
                          <div className="flex flex-col gap-3">
                            {CATEGORIES.map((c) => (
                              <button
                                key={c}
                                onClick={() => {
                                  if (!canSelectCategory) return;
                                  setCategory(c);
                                  setFormErrors((prev) => ({ ...prev, category: undefined }));
                                }}
                                disabled={!canSelectCategory}
                                className={`px-6 py-4 rounded-2xl text-left text-[12px] font-bold transition-all border ${
                                  category === c 
                                    ? "bg-[#5B45FF] border-transparent text-white shadow-lg" 
                                    : "bg-[#2D324D]/40 border-white/5 text-[#9CA3AF] hover:border-white/20"
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                          {formErrors.category && <p className="text-xs text-red-400">{formErrors.category}</p>}
                        </div>
                      )}
                   </div>

                   {/* Output Style (Both modes) */}
                   <div className="space-y-5">
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider">Output Style</h3>
                     <div className="flex flex-wrap gap-3">
                        {OUTPUT_STYLES.map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              if (!canSelectStyle) return;
                              setOutputStyle(s);
                              setFormErrors((prev) => ({ ...prev, style: undefined }));
                            }}
                            disabled={!canSelectStyle}
                            className={`px-5 py-2.5 rounded-full text-[12px] font-bold transition-all border ${
                              outputStyle === s 
                                ? "bg-gradient-to-r from-[#7C4DFF] to-[#EC4899] border-transparent text-white shadow-lg" 
                                : "bg-[#2D324D]/40 border-white/5 text-[#9CA3AF] hover:border-white/20"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                     </div>
                     {formErrors.style && <p className="text-xs text-red-400">{formErrors.style}</p>}
                   </div>

                   <div className="space-y-5">
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider">Output Format</h3>
                     <div className="flex flex-wrap gap-3">
                        {OUTPUT_FORMATS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setOutputFormat(option.value);
                              setFormErrors((prev) => ({ ...prev, format: undefined }));
                            }}
                            className={`px-5 py-2.5 rounded-full text-[12px] font-bold transition-all border ${
                              outputFormat === option.value
                                ? "bg-[#5B45FF] border-transparent text-white shadow-lg"
                                : "bg-[#2D324D]/40 border-white/5 text-[#9CA3AF] hover:border-white/20"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                     </div>
                     {formErrors.format && <p className="text-xs text-red-400">{formErrors.format}</p>}
                   </div>

                   {/* AI Director Notes (Both modes) */}
                   <div className="space-y-5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">AI Director Notes</h3>
                        <span className="text-[10px] text-[#FF9E45] font-bold tracking-widest">(OPTIONAL)</span>
                      </div>
                      <textarea 
                        value={directorNotes}
                        onChange={(e) => setDirectorNotes(e.target.value)}
                        placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
                        disabled={!canAddNotes}
                        className="w-full bg-[#0F111A] border border-white/10 rounded-2xl p-5 text-sm text-gray-300 placeholder-gray-700 focus:ring-1 focus:ring-[#5B45FF] transition-all min-h-[120px] resize-none"
                      />
                   </div>

                   {/* Generate Button Container */}
                   <div className="space-y-6 pt-4">
                      <button
                          onClick={handleGenerateTryOn}
                          disabled={!canGenerate}
                          className={`w-full py-5 rounded-[24px] font-bold text-sm tracking-wide transition-all ${
                          canGenerate
                              ? "bg-gradient-to-r from-[#5B45FF] to-[#7C4DFF] text-white shadow-[0_12px_28px_rgba(91,69,255,0.4)] hover:scale-[1.02]"
                              : "bg-[#2D324D]/50 text-[#6E7180] border border-white/5 cursor-not-allowed"
                          }`}
                      >
                          {loading ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>AI Processing...</span>
                            </div>
                          ) : "Generate Prime Image"}
                      </button>

                      {submitError && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                          {submitError}
                        </div>
                      )}

                      {!results && !loading && (
                          <div className="flex flex-col items-center text-center">
                              <Sparkles className="w-8 h-8 text-[#FF9E45] opacity-50 mb-3" />
                              <h4 className="text-sm font-bold text-white mb-2 font-roboto">Studio Results</h4>
                              <p className="text-[11px] text-[#9CA3AF] leading-relaxed max-w-[200px]">
                                  Generate your look once to see Front, Side, Back, and Detail views instantly.
                              </p>
                          </div>
                      )}
                   </div>
                </div>

                {/* Grid Column */}
                <div className="flex-grow bg-[#0F111A] rounded-[24px] p-6 border border-white/5 min-h-[600px] h-fit">
                  <div className="flex items-center gap-3 mb-8">
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">Trial Results</h2>
                    <span className="bg-[#5B45FF] text-[9px] font-bold px-2 py-0.5 rounded-md text-white">360° STUDIO</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {resultItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => item.url && setActiveResultLabel(item.label)}
                        disabled={!item.url}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          activeResultLabel === item.label
                            ? "bg-[#5B45FF] border-transparent text-white"
                            : item.url
                              ? "bg-[#2D324D]/60 border-white/10 text-[#C2C6D6] hover:border-white/30"
                              : "bg-[#2D324D]/30 border-white/5 text-[#667085] cursor-not-allowed"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative min-h-[430px] bg-[#1A1D2B] rounded-[20px] border border-white/5 overflow-hidden">
                    {loading && !results && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                        <Loader2 className="w-12 h-12 animate-spin text-[#7C4DFF] mb-6" />
                        <p className="text-2xl font-bold text-white mb-2">Stitching 360° Studio Look</p>
                        <p className="text-sm text-[#9CA3AF]">Creating 360° Studio Views... Wait</p>
                      </div>
                    )}

                    {!loading && activeResultUrl && (
                      <>
                        <div className="absolute inset-0">
                          <Image
                            src={activeResultUrl}
                            alt={activeResultLabel}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>

                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                          <button
                            onClick={handleDownloadResult}
                            className="h-10 px-4 rounded-lg bg-black/55 border border-white/20 text-white text-sm font-semibold flex items-center gap-2 hover:bg-black/70"
                          >
                            <Download className="w-4 h-4" /> Download
                          </button>
                          <button
                            onClick={handleShareResult}
                            className="h-10 px-4 rounded-lg bg-black/55 border border-white/20 text-white text-sm font-semibold flex items-center gap-2 hover:bg-black/70"
                          >
                            <Share2 className="w-4 h-4" /> Share
                          </button>
                        </div>
                      </>
                    )}

                    {!loading && !activeResultUrl && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-15">
                        <ImageIcon className="w-14 h-14" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTryOnView;