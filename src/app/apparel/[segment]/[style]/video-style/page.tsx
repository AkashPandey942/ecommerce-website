"use client";

import FlowHeader from "@/components/FlowHeader";
import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import LoadingActionButton from "@/components/LoadingActionButton";
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
      <FlowHeader title="Video Treatment" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={10} />

        <section className="mt-8 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-roboto font-semibold text-3xl lg:text-[36px] leading-tight lg:leading-[45px] tracking-[-0.9px] text-[#E2E2E8] mb-4">
              Choose Video Style
            </h1>
            <p className="font-roboto font-normal text-base leading-[19px] text-[#C2C6D6]">
              Select a motion preset to bring your approved prime image to life.
            </p>
          </motion.div>
        </section>

        {/* Video Styles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {videoStyles.map((style, idx) => (
            <motion.div
              key={style.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedStyle(style.id)}
              className={`relative overflow-hidden rounded-[20px] cursor-pointer border-2 transition-all h-[240px] group ${
                selectedStyle === style.id 
                  ? "border-[#7C4DFF] shadow-[0_0_30px_rgba(124,77,255,0.3)]" 
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <Image 
                src={style.image}
                alt={style.title}
                fill
                className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
              />
              
              {/* Overlay Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
                <div className="flex items-center gap-2 mb-2">
                  <Play className={`w-5 h-5 ${selectedStyle === style.id ? "text-[#7C4DFF]" : "text-white"}`} />
                  <h3 className="font-roboto font-bold text-xl text-white">{style.title}</h3>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">{style.description}</p>
              </div>

              {/* Selection Badge */}
              {selectedStyle === style.id && (
                <div className="absolute top-4 right-4 bg-[#7C4DFF] p-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Action Area */}
        <div className="w-full mt-auto mb-10 lg:mb-16">
          <div className="w-full max-w-[353px] mx-auto lg:max-w-[400px] flex flex-col gap-4">
            <LoadingActionButton
              isLoading={isLoading}
              onClick={handleGenerate}
              className="w-full h-[61px] text-lg"
              disabled={!selectedStyle}
            >
              Synthesize Video
            </LoadingActionButton>
            <button 
              onClick={() => router.push(`/apparel/${segment}/${styleParam}/final-results`)}
              className="text-white/40 text-sm hover:text-white transition-colors"
            >
              Skip video for now
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
