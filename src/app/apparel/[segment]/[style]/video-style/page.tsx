"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { Play, Sparkles } from "lucide-react";

export default function VideoStyleSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "ladies";
  const styleParam = (params.style as string) || "ethnic-wear";

  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const videoStyles = [
    { 
      id: "straight-walk", 
      title: "Straight Walk", 
      description: "Classic catwalk motion showing fabric flow.",
      image: "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg" 
    },
    { 
      id: "slow-turn", 
      title: "Slow 360° Turn", 
      description: "Elegant rotation to highlight all garment details.",
      image: "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg" 
    },
    { 
      id: "detail-pan", 
      title: "Studio Pan", 
      description: "Cinematic close-up panning across embroidery and texture.",
      image: "/hero_image.png" 
    },
    { 
      id: "festive-motion", 
      title: "Festive Motion", 
      description: "Slow-motion aesthetic with particles and warm lighting.",
      image: "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg" 
    }
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    // Simulate Video Synthesis
    await new Promise(resolve => setTimeout(resolve, 3000));
    router.push(`/apparel/${segment}/${styleParam}/final-results`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Video Style" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        {/* Progress Dots (Figma Style) */}
        <div className="flex justify-center gap-2 mb-8">
           {[1, 2, 3, 4, 5].map((dot) => (
             <div key={dot} className={`h-1 w-8 rounded-full ${dot <= 5 ? "bg-[#7C4DFF]" : "bg-white/10"}`} />
           ))}
        </div>

        <section className="mb-10 lg:text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-roboto font-semibold text-3xl lg:text-[36px] leading-tight lg:leading-[45px] tracking-[-0.9px] text-[#E2E2E8] mb-4">
              Select Video Style
            </h1>
            <p className="font-roboto font-normal text-base leading-[19px] text-[#C2C6D6]">
              Choose video animation style
            </p>
          </motion.div>
        </section>

        {/* Video Styles Grid (2-column mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {videoStyles.map((style, idx) => (
            <motion.div
              key={style.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedStyle(style.id)}
              className={`relative aspect-[166/207] rounded-[10px] overflow-hidden cursor-pointer border-2 transition-all group ${
                selectedStyle === style.id 
                  ? "border-[#7C4DFF] shadow-[0_0_30px_rgba(124,77,255,0.3)]" 
                  : "border-white/5 hover:border-white/10"
              }`}
            >
              <Image 
                src={style.image}
                alt={style.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 ${
                  selectedStyle === style.id ? "bg-[#7C4DFF]" : "bg-black/40"
                }`}>
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </div>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <span className="text-[12px] font-medium text-white block text-center italic">{style.title}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Custom / Prompt Section (Figma Style) */}
        <section className="w-full max-w-full sm:max-w-[353px] mx-auto flex flex-col gap-6 mb-16">
          <div className="flex flex-col gap-3">
             <div className="flex">
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] uppercase font-bold tracking-widest text-[#99A1AF]">
                   Use Prompt
                </span>
             </div>
             <p className="text-[10px] text-red-400 flex items-center gap-1 italic">
                <span>⚠️</span> Custom prompts may vary. Use at your own risk.
             </p>
          </div>

          <div>
             <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-bold text-white">AI Custom</h2>
                <span className="text-[10px] text-[#C5B6DE] uppercase">(Optional)</span>
             </div>
             <textarea 
               className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-[12px] text-white outline-none focus:border-[#7C4DFF] transition-all resize-none placeholder:text-white/20"
               placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
             />
          </div>

          <LoadingActionButton
            isLoading={isLoading}
            onClick={handleGenerate}
            className="w-full h-[61px] text-lg font-bold rounded-full"
            disabled={!selectedStyle}
          >
            Generate Video
          </LoadingActionButton>
        </section>
      </main>

      <Footer />
    </div>
  );
}
