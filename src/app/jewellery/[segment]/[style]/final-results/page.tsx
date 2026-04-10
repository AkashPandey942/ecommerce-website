"use client";

import FlowHeader from "@/components/FlowHeader";
import Footer from "@/components/Footer";
import ProgressStepper from "@/components/ProgressStepper";
import { Download, Share2, Maximize2, Play, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import StackedImagePreview from "@/components/StackedImagePreview";

export default function JewelleryResultPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "bridal";
  const style = (params.style as string) || "sets-and-pieces";
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const results = [
    { id: 1, type: "Prime Render", image: "/golden-jewlary.jpg", isVideo: false },
    { id: 2, type: "Neckline View", image: "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg", isVideo: false },
    { id: 3, type: "Macro Detail", image: "/indian-bride-9-2025-12-2fd0a5885b204639c8156089c6d2ebad-16x9.avif", isVideo: false },
    { id: 4, type: "Motion Shine (Video)", image: "/golden-jewlary.jpg", isVideo: true },
  ];

  if (!mounted) return null;

  const ResultCard = ({ res, idx }: { res: typeof results[0], idx: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="group relative flex flex-col gap-4 w-full"
    >
      <div className="relative aspect-[1/1.2] rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-[#1A1E29]">
        <Image 
          src={res.image} 
          alt={res.type} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
          {res.type}
        </div>
        
        {res.isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-[44px] h-[44px] rounded-full bg-figma-gradient flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="text-xs text-[#99A1AF] hover:text-white flex items-center gap-1 font-medium">
          <ImageIcon className="w-3 h-3" />
          View High-res
        </button>
        <button className="text-xs text-[#7C4DFF] font-bold flex items-center gap-1 hover:underline">
          <Maximize2 className="w-3 h-3" />
          Full View
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 font-roboto lg:pb-0">
      <FlowHeader title="Production Results" />

      <main className="w-full max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col">
        <ProgressStepper currentStep={11} />

        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center text-center mt-8 mb-12"
        >
          <div className="flex items-center gap-2 mb-2 justify-center">
            <CheckCircle2 className="w-6 h-6 text-[#00E676]" />
            <h1 className="text-3xl lg:text-4xl font-bold text-white">Photoshoot Complete!</h1>
          </div>
          <p className="text-[#99A1AF] text-sm lg:text-base">High-fidelity jewelry assets ready for marketplace export.</p>
        </motion.div>

        {/* Stacked Fan Preview (Rule 6.10 Style Enhancement) */}
        <div className="w-full flex justify-center">
           <StackedImagePreview images={results.map(r => r.image)} />
        </div>

        {/* Results Sections Grouped by Type (Rule 6.10) */}
        <div className="w-full flex flex-col gap-12 mb-20">
          {/* Images Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl font-bold text-white">Image Assets</h3>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {results.filter(r => !r.isVideo).map((res, idx) => (
                <ResultCard key={res.id} res={res} idx={idx} />
              ))}
            </div>
          </section>

          {/* Videos Section (Step 10) */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl font-bold text-white">Motion Synthesis (Step 10)</h3>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {results.filter(r => r.isVideo).map((res, idx) => (
                <ResultCard key={res.id} res={res} idx={idx} />
              ))}
            </div>
          </section>
        </div>

        {/* Action Suite */}
        <div className="w-full flex flex-col lg:flex-row gap-4 mb-20">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 h-[61px] bg-figma-gradient rounded-[16px] shadow-[0_10px_30px_rgba(124,77,255,0.3)] flex items-center justify-center gap-3"
          >
            <Download className="w-5 h-5 text-white" />
            <span className="font-roboto font-semibold text-lg text-white">
              Download Full Suite
            </span>
          </motion.button>

          <Link href="/" className="flex-1">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-[61px] border border-white/10 rounded-[16px] flex items-center justify-center gap-2 bg-white/5"
            >
              <Share2 className="w-4 h-4 text-[#C2C6D6]" />
              <span className="font-roboto font-medium text-lg text-[#E2E2E8]">
                Share Project
              </span>
            </motion.button>
          </Link>
        </div>

        <Footer />
      </main>
    </div>
  );
}
