"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { Play, Sparkles } from "lucide-react";
import { TAXONOMY } from "@/registry/taxonomy";

export default function ProductsVideoStyleSelectionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const styleParam = (params.style as string) || "home";
  const product = searchParams.get("product") || "Product";

  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Determine fallback image from taxonomy
  const matchedFamily = TAXONOMY.products.families.find(
    (f: any) => f.title.toLowerCase().replace(/\s+/g, '-') === styleParam.toLowerCase()
  );
  const previewImage = matchedFamily?.image || "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg";

  const videoStyles = [
    { 
      id: "staged-motion", 
      title: "Staged Motion", 
      description: "Atmospheric motion in a lifestyle or studio setting.",
      image: previewImage
    },
    { 
      id: "detail-zoom", 
      title: "Texture Zoom", 
      description: "Extreme close-up zoom highlighting product surface and finish.",
      image: previewImage
    },
    { 
      id: "slow-rotation", 
      title: "Slow Rotation", 
      description: "Smooth 360° turn for full product dimensionality.",
      image: previewImage
    },
    { 
      id: "ambient-mood", 
      title: "Ambient Mood", 
      description: "Slow-motion lighting shifts and soft decorative focus.",
      image: previewImage
    }
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    router.push(`/products/${styleParam}/final-results?product=${product}`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Video Treatment" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={10} />

        <section className="mt-8 mb-10 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-roboto font-semibold text-3xl text-white mb-4">
              Motion Treatment
            </h1>
            <p className="text-[#C2C6D6] max-w-md mx-auto">
              Choose how your {product} should move in the final catalog video.
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
          <div className="w-full max-w-full sm:max-w-[353px]">
            <LoadingActionButton
              isLoading={isLoading}
              onClick={handleGenerate}
              className="w-full h-[61px] text-lg font-bold"
              disabled={!selectedStyle}
            >
              Synthesize Video
            </LoadingActionButton>
          </div>
          <button onClick={() => router.push(`/products/${styleParam}/final-results?product=${product}`)} className="text-white/40 text-sm hover:text-white transition-colors">
            Skip video step
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
