"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import { Download, Share2, CornerUpRight, LayoutTemplate, CheckCircle2, Play } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import StackedImagePreview from "@/frontend/components/StackedImagePreview";

export default function ProductsResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const style = (params.style as string) || "home";
  const product = searchParams.get("product") || "Product";

  const results = [
    { id: 1, type: "Prime shot", image: "/assets/categories/home_decor.png", isVideo: false },
    { id: 2, type: "Side Angle", image: "/assets/categories/beauty.png", isVideo: false },
    { id: 3, type: "Top Down", image: "/assets/categories/handicrafts.png", isVideo: false },
    { id: 4, type: "Contextual (Video)", image: "/assets/categories/home_decor.png", isVideo: true },
  ];

  const ResultCard = ({ res, idx }: { res: typeof results[0], idx: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="group relative flex flex-col gap-4 w-full"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-[#1A1E29]">
        <Image 
          src={res.image} 
          alt={res.type} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
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
      
      <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity px-1">
        <button className="text-[11px] text-[#99A1AF] hover:text-white flex items-center gap-1 font-medium">
          <LayoutTemplate className="w-3 h-3" />
          Save Template
        </button>
        <button className="text-[11px] text-[#7C4DFF] font-bold flex items-center gap-1 hover:underline">
          <CornerUpRight className="w-3 h-3" />
          Direct Export
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0 font-roboto">
      <FlowHeader title="Production Results" />

      <main className="w-full max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col">
        <ProgressStepper currentStep={11} />

        {/* Header Section */}
        <section className="mt-8 mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-6 h-6 text-[#00E676]" />
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Photoshoot Complete!</h1>
            </div>
            <p className="text-[#99A1AF]">Your high-fidelity assets are ready for export.</p>
          </motion.div>
          
          <div className="flex gap-4">
            <button className="flex-1 lg:flex-none h-12 px-6 rounded-full border border-white/10 bg-white/5 flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-medium">
              <Share2 className="w-4 h-4" />
              <span>Share Pack</span>
            </button>
            <button className="flex-1 lg:flex-none h-12 px-6 rounded-full bg-figma-gradient flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(124,77,255,0.4)] transition-all font-semibold">
              <Download className="w-4 h-4" />
              <span>Download Suite</span>
            </button>
          </div>
        </section>

        {/* Stacked Fan Preview (Rule 6.10 Style Enhancement) */}
        <div className="w-full flex justify-center mb-12">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 min-h-[220px]">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {results.filter(r => r.isVideo).map((res, idx) => (
                <ResultCard key={res.id} res={res} idx={idx} />
              ))}
            </div>
          </section>
        </div>

        <Footer />
      </main>
    </div>
  );
}
