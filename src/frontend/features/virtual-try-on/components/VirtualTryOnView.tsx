"use client";

import React, { useState } from "react";
import FlowHeader from "@/frontend/components/FlowHeader";
import UploadZone from "@/frontend/components/UploadZone";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Image as ImageIcon, Sparkles, User, Layout, UserCircle, ChevronDown, Check, MousePointer2 } from "lucide-react";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import SegmentCard from "@/frontend/components/SegmentCard";
import ProductScroll from "@/frontend/components/ProductScroll";
import ModelScroll from "@/frontend/components/ModelScroll";
import Footer from "@/frontend/components/Footer";
import Image from "next/image";
import { useEffect } from "react";
import { storageService } from "@/backend/services/storageService";
import { useSession } from "next-auth/react";

type StatusResponse = {
  success?: boolean;
  status?: "pending" | "processing" | "completed" | "failed";
  outputImage?: string;
  error?: string;
};

const GENDERS = ["Men", "Women", "Boys", "Girls"];
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

export const VirtualTryOnView = () => {
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [clothingPhoto, setClothingPhoto] = useState<File | null>(null);
  const [gender, setGender] = useState<string>("Men");
  const [category, setCategory] = useState<string>("Tops (Shirts)");
  const [productType, setProductType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [activeTab, setActiveTab] = useState<"Virtual Try-On" | "AI Studio">("Virtual Try-On");
  const [userPoint, setUserPoint] = useState<{x: number, y: number} | null>(null);
  const [clothingPoint, setClothingPoint] = useState<{x: number, y: number} | null>(null);
  const [fashionPrompt, setFashionPrompt] = useState("");
  const [resolution, setResolution] = useState("2048x2048 (1:1)");
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [backgroundStyle, setBackgroundStyle] = useState<string | null>(null);
  const [outputStyle, setOutputStyle] = useState<string>("Catalog");
  const [directorNotes, setDirectorNotes] = useState("");
  const [userCredits, setUserCredits] = useState<number | null>(null);

  const { data: session } = useSession();

  // Fetch user credits on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (data.user) {
          setUserCredits(data.user.credits);
        }
      } catch (err) {
        console.error("Failed to fetch user credits:", err);
      }
    };
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const handleGenerateTryOn = async () => {
    // Basic validation
    if (activeTab === "Virtual Try-On" && (!userPhoto || !clothingPhoto)) return;
    if (activeTab === "AI Studio" && !clothingPhoto) return;

    if (!session?.user) {
      console.warn("User is not signed in, proceeding without authentication.");
    }

    setLoading(true);
    setResults(null); // Clear previous results

    try {
      const userId = session?.user?.id ?? "guest-user";
      let modelUrl = selectedModel; // Use selected model URL by default
      let garmentUrl = "";

      // 1. Upload images if they are files (user uploaded custom images)
      if (clothingPhoto instanceof File) {
        garmentUrl = await storageService.uploadGarment(userId, clothingPhoto);
      }
      
      if (userPhoto instanceof File) {
        modelUrl = await storageService.uploadGarment(userId, userPhoto);
      }

      // Step 2: Call your internal API which connects to RunComfy
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId: selectedModel,
          background: backgroundStyle,
          style: outputStyle,
          prompt: directorNotes || fashionPrompt,
          garmentImageUrl: garmentUrl, 
          modelImageUrl: modelUrl,    
          mode: activeTab,
          userPoint,        // Send coordinates to the backend payload
          clothingPoint     // Send coordinates to the backend payload
        }),
      });

      if (!response.ok) {
        const failed = await response.json().catch(() => ({}));
        throw new Error(failed.error || "API Connection Error");
      }

      const data = await response.json();
      
      // Start polling for the real AI result
      const pollResult = async (jobId: string) => {
        try {
          const statusRes = await fetch(`/api/status?jobId=${jobId}`);
          const statusData = (await statusRes.json()) as StatusResponse;

          if (!statusRes.ok || statusData.success === false) {
            throw new Error(statusData.error || "Failed to fetch generation status");
          }

          if (statusData.status === "completed" && statusData.outputImage) {
            setResults({
              "Front View": statusData.outputImage,
              "Left View": statusData.outputImage,
              "Right View": statusData.outputImage,
              "Drape Detail": statusData.outputImage,
              "Borree Detail": statusData.outputImage,
              "Border Close-up": statusData.outputImage,
            });
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
          alert(err instanceof Error ? err.message : "Failed to check generation status.");
        }
      };

      if (data.jobId) {
        pollResult(data.jobId);
      } else {
        throw new Error("No Job ID returned from AI service");
      }

    } catch (error) {
      console.error("AI Generation Error:", error);
      
      // Removed fallback to demo results on startup error to prevent mismatched results
      setLoading(false);
      alert("Failed to start AI generation. Please check your connection.");
    }
  };

  const isFormValid = userPhoto && clothingPhoto;

  return (
    <div className="min-h-screen bg-black text-[#E2E2E8] font-roboto selection:bg-[#5B45FF]/30 relative overflow-hidden">
      <FlowHeader title=" " showBack={true} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-[120px] lg:pt-[140px] pb-20 relative z-10">
        
        <div className="flex bg-[#1A1D2B]/40 border border-white/5 rounded-full p-1 mb-16 w-fit mx-auto relative">
          <motion.div 
            layoutId="tabBackground"
            className="absolute inset-y-1 bg-gradient-to-r from-[#5B45FF] to-[#7C4DFF] rounded-full shadow-lg"
            initial={false}
            animate={{
              left: activeTab === "Virtual Try-On" ? 4 : "calc(50% + 2px)",
              width: "calc(50% - 6px)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <button 
            onClick={() => setActiveTab("Virtual Try-On")}
            className={`px-6 sm:px-10 py-3.5 font-bold text-xs sm:text-sm transition-all relative z-10 w-[140px] sm:w-[180px] cursor-pointer ${
              activeTab === "Virtual Try-On" ? "text-white" : "text-[#9CA3AF] hover:text-white"
            }`}
          >
            Virtual Try-On
          </button>
          <button 
            onClick={() => {
              setActiveTab("AI Studio");
              setProductType(null);
            }}
            className={`px-6 sm:px-10 py-3.5 font-bold text-xs sm:text-sm transition-all relative z-10 w-[140px] sm:w-[180px] cursor-pointer ${
              activeTab === "AI Studio" ? "text-white" : "text-[#9CA3AF] hover:text-white"
            }`}
          >
            AI Studio
          </button>
        </div>

        {activeTab === "AI Studio" && !productType ? (
          <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                
                <button className="flex items-center justify-center px-[10px] py-[5px] h-6 bg-black/30 shadow-[2px_2px_2px_rgba(0,0,0,0.54)] rounded-full group cursor-pointer">
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16"
          >
            {/* 1. Setup Phase */}
            <div className="space-y-10">
              <div className="max-w-xl">
                 <ProgressStepper currentStep={2} />
              </div>
                
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  {activeTab === "Virtual Try-On" ? "Virtual Try-On" : "AI Studio"}
                </h1>
                {activeTab === "AI Studio" && (
                  <button 
                    onClick={() => setProductType(null)}
                    className="text-[10px] font-bold text-figma-gradient hover:underline uppercase tracking-widest cursor-pointer"
                  >
                    Change Type
                  </button>
                )}
              </div>
              
              <div className="space-y-16">
                {/* Model Selection (Always show for AI Studio Apparel, or contextually) */}
                {activeTab === "AI Studio" && productType === "Apparel" && (
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white uppercase tracking-wide">Select Model</h3>
                        <p className="text-sm text-[#99A1AF]">Choose a model to showcase your product design.</p>
                      </div>
                      <ModelScroll 
                        selectedId={selectedModelId || ""} 
                        onSelect={(m) => {
                          setSelectedModel(m.image);
                          setSelectedModelId(m.id);
                        }} 
                      />
                   </div>
                )}

                {/* 1. Upload User Photo (Only for Virtual Try-On) */}
                {activeTab === "Virtual Try-On" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-roboto font-bold text-xl text-white">Upload Your Photo</h3>
                      <p className="text-sm text-[#99A1AF] leading-relaxed">Upload a clear photo of yourself to try on clothing digitally.</p>
                    </div>
                    <UploadZone 
                      onFileSelect={setUserPhoto} 
                      hideText={false} 
                      allowPointSelection={true}
                      onPointSelect={setUserPoint}
                      title="Upload Your Image"
                      subTitle="Drag and drop or click to select"
                    />
                  </div>
                )}

                {/* 2. Upload Clothing (Both modes) */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-roboto font-bold text-xl text-white">Upload {activeTab === "Virtual Try-On" ? "Clothing" : "Product"}</h3>
                    <p className="text-sm text-[#99A1AF] leading-relaxed">Upload the item you want to see generated in high fidelity.</p>
                  </div>
                  <UploadZone 
                    onFileSelect={setClothingPhoto} 
                    hideText={false} 
                    allowPointSelection={true}
                    onPointSelect={setClothingPoint}
                    title={activeTab === "Virtual Try-On" ? "Upload Clothing" : "Upload Product Image"}
                    subTitle="Drag and drop or click to select"
                  />
                </div>
              </div>
            </div>

            {/* Settings & Controls Phase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {/* Left Column Settings */}
               <div className="space-y-12">
                  <div className="space-y-10">
                      {/* Background Style Section (Only for AI Studio) */}
                      {activeTab === "AI Studio" && productType && (
                        <div className="space-y-6">
                          <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Background Style</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {BACKGROUNDS.map((bg, idx) => (
                              <div key={idx} className="space-y-2 group">
                                <button
                                  onClick={() => setBackgroundStyle(bg.name)}
                                  className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${
                                    backgroundStyle === bg.name ? "border-[#5B45FF] scale-102" : "border-white/5 opacity-60 hover:opacity-90"
                                  }`}
                                >
                                  <img src={bg.img} alt={bg.name} className="w-full h-full object-cover" />
                                </button>
                                <p className={`text-[10px] font-bold text-center ${backgroundStyle === bg.name ? "text-[#5B45FF]" : "text-[#9CA3AF]"}`}>
                                  {bg.name}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-10">
                          {/* Category selection */}
                          {(activeTab === "Virtual Try-On" || productType === "Apparel") && (
                            <div className="space-y-5">
                              <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Clothing Category</h3>
                              <div className="flex flex-wrap gap-2 sm:gap-3">
                                {CATEGORIES.map((c, idx) => (
                                  <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={c}
                                    onClick={() => setCategory(c)}
                                    className={`px-5 py-2.5 rounded-full text-[12px] font-bold transition-all border cursor-pointer ${
                                      category === c 
                                        ? "bg-gradient-to-r from-[#7C4DFF] to-[#EC4899] border-transparent text-white shadow-lg" 
                                        : "bg-[#1A1D2B] border-white/10 text-[#9CA3AF] hover:border-white/20"
                                    }`}
                                  >
                                    {c}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Output Style */}
                          <div className="space-y-5">
                            <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">Output Style</h3>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                               {OUTPUT_STYLES.map((s, idx) => (
                                 <motion.button
                                   initial={{ opacity: 0, y: 10 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: 0.2 + (idx * 0.1) }}
                                   key={s}
                                   onClick={() => setOutputStyle(s)}
                                   className={`px-5 py-2.5 rounded-full text-[12px] font-bold transition-all border cursor-pointer ${
                                     outputStyle === s 
                                       ? "bg-gradient-to-r from-[#7C4DFF] to-[#EC4899] border-transparent text-white shadow-lg" 
                                       : "bg-[#1A1D2B] border-white/10 text-[#9CA3AF] hover:border-white/20"
                                   }`}
                                 >
                                   {s}
                                 </motion.button>
                               ))}
                            </div>
                          </div>

                          {/* AI Director Notes */}
                          <div className="space-y-5">
                             <div className="flex items-center gap-2">
                               <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">AI Director Notes</h3>
                               <span className="text-[10px] text-[#FF9E45] font-bold tracking-widest">(OPTIONAL)</span>
                             </div>
                             <textarea 
                               value={directorNotes}
                               onChange={(e) => setDirectorNotes(e.target.value)}
                               placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare..."
                               className="w-full bg-[#0F111A] border border-white/10 rounded-2xl p-6 text-sm text-gray-300 placeholder-gray-700 focus:ring-1 focus:ring-[#5B45FF] transition-all min-h-[140px] resize-none"
                             />
                          </div>

                          {/* Generate Button Container */}
                          <div className="pt-4">
                             <button
                                 onClick={handleGenerateTryOn}
                                 disabled={loading}
                                 className={`w-full py-5 rounded-full font-bold text-sm tracking-wide transition-all cursor-pointer ${
                                 ((activeTab === "Virtual Try-On" && isFormValid) || (activeTab === "AI Studio" && clothingPhoto)) && !loading
                                     ? "bg-gradient-to-r from-[#5B45FF] to-[#7C4DFF] text-white shadow-[0_12px_28px_rgba(91,69,255,0.4)] hover:scale-[1.02]"
                                     : "bg-[#2D324D]/50 text-[#6E7180] border border-white/5 cursor-not-allowed"
                                 }`}
                             >
                                 {loading ? (
                                   <div className="flex items-center justify-center gap-2">
                                     <Loader2 className="w-5 h-5 animate-spin" />
                                     <span>AI is processing...</span>
                                   </div>
                                 ) : "Generate Prime Results"}
                             </button>
                          </div>
                      </div>
                  </div>
               </div>

               {/* Right Column Results (Mobile will stack below) */}
               <div className="space-y-8">
                   <div className="flex items-center justify-between">
                     <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">Studio Results</h2>
                     <span className="bg-[#5B45FF]/10 text-[#5B45FF] text-[9px] font-bold px-3 py-1 rounded-full border border-[#5B45FF]/20 tracking-widest">360° ENGINE</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                    {(results ? Object.entries(results) : Array.from({ length: 6 }).map((_, i) => [`View Placeholder ${i}`, ""])).map(([label, url], idx) => (
                      <div key={idx} className="space-y-3 group cursor-pointer">
                         <div className="relative aspect-[3/4] bg-[#0F111A] rounded-[24px] overflow-hidden border border-white/5 shadow-inner">
                          {url ? (
                              <>
                                  <Image 
                                      src={url as string} 
                                      alt={label as string} 
                                      fill 
                                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                                      unoptimized
                                      onError={(e) => {
                                        // Handle image load error
                                        console.error(`Failed to load image: ${url}`);
                                      }}
                                  />
                                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 bg-black/40 backdrop-blur-md rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Layout className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                                  </div>
                              </>
                          ) : (
                              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                  <ImageIcon className="w-6 sm:w-8 h-6 sm:h-8" />
                              </div>
                          )}
                          {loading && (
                               <div className="absolute inset-0 bg-[#1A1D2B] animate-pulse" />
                          )}
                         </div>
                         <p className="text-[9px] sm:text-[10px] font-bold text-center text-[#9CA3AF] tracking-widest uppercase py-1.5 sm:py-2 bg-[#1A1D2B] rounded-lg sm:rounded-xl border border-white/5 group-hover:text-white transition-colors">{(label as string).includes('View Placeholder') ? 'Preview' : label}</p>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VirtualTryOnView;