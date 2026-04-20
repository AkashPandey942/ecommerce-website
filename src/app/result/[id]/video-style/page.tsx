"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { Play, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function SelectVideoStylePage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const styles = [
    { id: "straight-walk", title: "Straight Walk", image: "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg" },
    { id: "slow-turn", title: "Slow Turn", image: "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg" },
    { id: "elegant-reveal", title: "Elegant Reveal", image: "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg" },
    { id: "fabric-flow", title: "Fabric Flow", image: "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg" },
  ];

  const [selectedStyle, setSelectedStyle] = useState<string>("straight-walk");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    router.push(`/result/${jobId}/video/result`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Video Style" />

      <main className="w-full flex-1 max-w-[393px] mx-auto pt-[120px] px-5 flex flex-col">
        {/* Progress Dots */}
        <div className="w-full flex gap-2 mb-8 items-center justify-center">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div 
              key={step} 
              className={`h-1 w-full rounded-full transition-all duration-500 ${
                step <= 5 ? "bg-gradient-to-r from-[#7C3AED] to-[#EC4899]" : "bg-white/10"
              }`} 
            />
          ))}
        </div>

        {/* Heading Section */}
        <section className="mb-10 text-left">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-roboto font-semibold text-[36px] leading-[45px] tracking-[-0.9px] text-[#E2E2E8] mb-4">
              Select Video Style
            </h1>
            <p className="font-roboto font-normal text-[16px] leading-[19px] text-[#C2C6D6]">
              Choose video animation style
            </p>
          </motion.div>
        </section>

        {/* Video Styles Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {styles.map((style, idx) => {
            const isSelected = selectedStyle === style.id;
            return (
              <motion.div
                key={style.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedStyle(style.id)}
                className="flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div className={`relative w-full aspect-[166/207] rounded-[10px] overflow-hidden border-2 transition-all ${
                  isSelected ? "border-[#7C4DFF]" : "border-white/5"
                }`}>
                  <Image 
                    src={style.image} 
                    alt={style.title} 
                    fill 
                    className="object-cover opacity-80"
                  />
                  
                  {/* Play Interface Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center border transition-all ${
                      isSelected 
                        ? "bg-figma-gradient border-none shadow-[0_0_20px_rgba(124,77,255,0.5)]" 
                        : "border-white/50 backdrop-blur-sm"
                    }`}>
                      <Play className={`w-5 h-5 ${isSelected ? "text-white fill-white" : "text-white"}`} />
                    </div>
                  </div>
                </div>
                <span className={`font-roboto font-medium text-[13px] leading-[15px] transition-colors ${
                  isSelected ? "text-white" : "text-[#7C4DFF]/30"
                }`}>
                  {style.title}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Prompt Options */}
        <section className="mb-10">
          <button className="h-[36px] px-5 rounded-full border border-[#424754] bg-[#121212]/30 font-roboto font-semibold text-[14px] text-[#E2E2E8] mb-4 hover:bg-white/5 transition-all">
            Use Prompt
          </button>
          
          <div className="flex items-center gap-2 mb-8 px-1">
            <AlertCircle className="w-4 h-4 text-[#FF6565]" />
            <p className="text-[12px] text-[#FF6565] font-roboto">
              Custom prompts may vary. Use at your own risk
            </p>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-roboto font-semibold text-[20px] text-white">
              AI Custom
            </h2>
            <span className="text-[12px] text-[#C5B6DE] font-semibold">(Optional)</span>
          </div>

          <textarea 
            className="w-full h-[95px] bg-black/30 border border-white/5 rounded-[10px] p-4 font-roboto text-[16px] leading-[19px] text-white focus:border-[#7C4DFF] focus:ring-1 focus:ring-[#7C4DFF] outline-none transition-all placeholder:text-[#C2C6D6]/40 resize-none"
            placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
          />
        </section>

        {/* Generate Button */}
        <div className="w-full mb-20">
          <LoadingActionButton
            isLoading={isLoading}
            onClick={handleGenerate}
            className="w-full h-[61px] rounded-[100px] font-roboto font-semibold text-[18px] text-white shadow-[0_10px_40px_rgba(124,77,255,0.3)]"
          >
            Generate Video
          </LoadingActionButton>
        </div>
      </main>

      <Footer />
    </div>
  );
}
