"use client";

import FlowHeader from "@/components/FlowHeader";
import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import LoadingActionButton from "@/components/LoadingActionButton";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { Play, Sparkles } from "lucide-react";
import { TAXONOMY } from "@/registry/taxonomy";

export default function AccessoriesVideoStyleSelectionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const styleParam = (params.style as string) || "bags";
  const product = searchParams.get("product") || "Handbag";

  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Determine fallback image from taxonomy
  const matchedStyle = TAXONOMY.accessories.styles.find(
    (s: any) => s.title.toLowerCase() === styleParam.toLowerCase()
  );
  const previewImage = matchedStyle?.image || "/assets/categories/handbag.png";

  const videoStyles = [
    { 
      id: "product-showcase", 
      title: "Product Showcase", 
      description: "Clean, professional look focusing on product form and detail.",
      image: previewImage
    },
    { 
      id: "slow-pan", 
      title: "Cinematic Pan", 
      description: "Slow horizontal camera movement highlighting design curves.",
      image: previewImage
    },
    { 
      id: "dynamic-zoom", 
      title: "Detail Zoom", 
      description: "Slow zoom-in on the texture and premium finish of the material.",
      image: previewImage
    },
    { 
      id: "lifestyle-motion", 
      title: "Lifestyle Aesthetic", 
      description: "Soft focus motion with natural studio lighting presets.",
      image: previewImage
    }
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    router.push(`/accessories/${styleParam}/final-results?product=${product}`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Video Treatment" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={10} />

        <section className="mt-8 mb-10 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-roboto font-semibold text-3xl text-white mb-4">
              Motion Previews
            </h1>
            <p className="text-[#C2C6D6] max-w-md mx-auto">
              Select a motion treatment for your {product}.
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
              className={`relative h-[220px] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group ${
                selectedStyle === vs.id ? "border-[#7C4DFF]" : "border-white/10 hover:border-white/20"
              }`}
            >
              <Image src={vs.image} alt={vs.title} fill className="object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black via-black/30 to-transparent">
                <div className="flex items-center gap-2 mb-1">
                  <Play className={`w-4 h-4 ${selectedStyle === vs.id ? "text-[#7C4DFF]" : "text-white"}`} />
                  <h3 className="font-bold text-lg">{vs.title}</h3>
                </div>
                <p className="text-xs text-gray-300">{vs.description}</p>
              </div>
              {selectedStyle === vs.id && (
                <div className="absolute top-4 right-4 bg-[#7C4DFF] p-2 rounded-full shadow-lg">
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
              className="w-full h-[61px] text-lg font-bold"
              disabled={!selectedStyle}
            >
              Synthesize Video
            </LoadingActionButton>
          </div>
          <button onClick={() => router.push(`/accessories/${styleParam}/final-results?product=${product}`)} className="text-white/40 text-sm hover:text-white transition-colors">
            Skip video style
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
