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

export default function JewelleryVideoStyleSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "bridal";
  const style = (params.style as string) || "sets-and-pieces";

  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const videoStyles = [
    { 
      id: "shine-closeup", 
      title: "Jewellery Shine Close-up", 
      description: "Macro focus on gemstones with dynamic light refraction.",
      image: "/golden-jewlary.jpg" 
    },
    { 
      id: "slow-pan", 
      title: "Studio Pan", 
      description: "Cinematic horizontal pan across the entire piece.",
      image: "/hero_image.png" 
    },
    { 
      id: "float-rotate", 
      title: "Floating Rotation", 
      description: "Graceful 360° hover rotation in a dreamlike setting.",
      image: "/golden-jewlary.jpg" 
    },
    { 
      id: "detail-zoom", 
      title: "Elegant Detail Zoom", 
      description: "Slow zoom-in on the most intricate parts of the design.",
      image: "/hero_image.png" 
    }
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    router.push(`/jewellery/${segment}/${style}/final-results`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Video Treatment" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={10} />

        <section className="mt-8 mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-roboto font-semibold text-3xl text-white mb-4">
              Select Motion Style
            </h1>
            <p className="text-[#C2C6D6] max-w-md mx-auto">
              Choose how you want your jewelry piece to move in the video.
            </p>
          </motion.div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {videoStyles.map((vs, idx) => (
            <motion.div
              key={vs.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedStyle(vs.id)}
              className={`relative h-[220px] rounded-2xl overflow-hidden cursor-pointer border-2 shadow-2xl transition-all group ${
                selectedStyle === vs.id ? "border-[#FF00C7]" : "border-white/10 hover:border-white/20"
              }`}
            >
              <Image src={vs.image} alt={vs.title} fill className="object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black via-black/30 to-transparent">
                <div className="flex items-center gap-2 mb-1">
                  <Play className={`w-4 h-4 ${selectedStyle === vs.id ? "text-[#FF00C7]" : "text-white"}`} />
                  <h3 className="font-bold text-lg">{vs.title}</h3>
                </div>
                <p className="text-xs text-gray-300">{vs.description}</p>
              </div>
              {selectedStyle === vs.id && (
                <div className="absolute top-4 right-4 bg-[#FF00C7] p-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="w-full mt-auto mb-10 flex flex-col items-center gap-4">
          <div className="w-full max-w-[353px]">
            <LoadingActionButton
              isLoading={isLoading}
              onClick={handleGenerate}
              className="w-full h-[61px]"
              disabled={!selectedStyle}
            >
              Generate Luxury Video
            </LoadingActionButton>
          </div>
          <button onClick={() => router.push(`/jewellery/${segment}/${style}/final-results`)} className="text-white/40 text-sm">
            Skip to final results
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
