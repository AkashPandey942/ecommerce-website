"use client";

import FlowHeader from "@/components/FlowHeader";
import Footer from "@/components/Footer";
import ProgressStepper from "@/components/ProgressStepper";
import { Download, Share2, CornerUpRight, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import StackedImagePreview from "@/components/StackedImagePreview";

export default function AccessoriesResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const style = (params.style as string) || "bags";
  const product = searchParams.get("product") || "Handbag";

  const results = [
    { id: 1, type: "Prime", image: "/assets/categories/handbag.png" },
    { id: 2, type: "Side View", image: "/assets/categories/footwear.png" },
    { id: 3, type: "Detail", image: "/assets/categories/watch.png" },
    { id: 4, type: "Category Pan (Video)", image: "/assets/categories/handbag.png", isVideo: true },
  ];

  const ResultCard = ({ res, idx }: { res: typeof results[0], idx: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="group relative flex flex-col gap-4"
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
              <span className="sr-only">Play Video</span>
              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
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
          <CornerUpRight className="w-3 h-3" />
          Export to Store
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0 font-roboto">
      <FlowHeader title="Generation Results" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col">
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
              <span>Download All</span>
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
