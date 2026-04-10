"use client";

import FlowHeader from "@/components/FlowHeader";
import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import { Download, Plus, Play } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import StackedImagePreview from "@/components/StackedImagePreview";

export default function FinalResultsPage() {
  const params = useParams();
  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "Ethnic Wear";

  const results = [
    { title: "Prime Render", image: "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg", isVideo: false },
    { title: "Side View", image: "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg", isVideo: false },
    { title: "Drape Detail", image: "/assets/ladies/ethnic-wear/ChatGPT Image Apr 1, 2026, 06_21_52 PM.png", isVideo: false },
    { title: "Slow Turn", image: "/assets/ladies/ethnic-wear/ChatGPT Image Apr 1, 2026, 05_49_51 PM.png", isVideo: true },
  ];

  const ResultCard = ({ res, idx }: { res: typeof results[0], idx: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="flex flex-col items-center gap-3 w-full"
    >
      <div className="relative w-full aspect-[166/207] bg-[#1A1E29] rounded-[10px] overflow-hidden border border-white/5 shadow-xl group cursor-pointer hover:border-[#7C4DFF]/30 transition-all">
        <Image
          src={res.image}
          alt={res.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy" 
        />
        
        {res.isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-[44px] h-[44px] rounded-full bg-figma-gradient flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      </div>
      <span className="font-roboto font-medium text-[13px] leading-[15px] text-center text-[#E2E2E8]">
        {res.title}
      </span>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 pb-[100px] lg:pb-0">
      <FlowHeader title="Results" />

      <main className="w-full max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        {/* Step 6: Fully Completed */}
        <ProgressStepper currentStep={11} />

        {/* Header Message */}
        <div className="text-left w-full mt-8 mb-8">
          <h2 className="font-roboto font-semibold text-[32px] leading-[40px] text-white">
            Photoshoot Complete!
          </h2>
          <p className="font-roboto text-[#99A1AF] text-sm mt-1">
            Your high-fidelity assets are ready for export.
          </p>
        </div>

        {/* Stacked Fan Preview (Rule 6.10 Style Enhancement) */}
        <div className="w-full flex justify-center">
           <StackedImagePreview images={results.map(r => r.image)} />
        </div>

        {/* Results Sections Grouped by Type (Rule 6.10) */}
        <div className="w-full flex flex-col gap-12">
          {/* Images Section */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
              <h3 className="font-roboto font-semibold text-lg text-white">Image Assets</h3>
              <span className="text-xs text-[#99A1AF] bg-white/5 py-1 px-2 rounded-md">{results.filter(r => !r.isVideo).length} Files</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 min-h-[220px]">
              {results.filter(r => !r.isVideo).map((res, idx) => (
                <ResultCard key={idx} res={res} idx={idx} />
              ))}
            </div>
          </section>

          {/* Videos Section */}
          <section>
            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
              <h3 className="font-roboto font-semibold text-lg text-white">Motion Synthesis (Step 10)</h3>
              <span className="text-xs text-[#99A1AF] bg-white/5 py-1 px-2 rounded-md">{results.filter(r => r.isVideo).length} Files</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {results.filter(r => r.isVideo).map((res, idx) => (
                <ResultCard key={idx} res={res} idx={idx} />
              ))}
            </div>
          </section>
        </div>

        {/* Dashboard Actions */}
        <div className="w-full max-w-full sm:max-w-[393px] flex flex-col gap-4 mt-12 md:mt-20">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-[61px] bg-figma-gradient rounded-full shadow-[0_0_30px_rgba(124,77,255,0.4)] flex items-center justify-center gap-3"
          >
            <Download className="w-5 h-5 text-white" />
            <span className="font-roboto font-semibold text-lg text-white">
              Download All
            </span>
          </motion.button>

          <Link href="/" className="w-full">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-[61px] border border-white/10 rounded-full flex items-center justify-center gap-3 bg-transparent transition-colors"
            >
              <Plus className="w-5 h-5 text-[#C5B6DE]" />
              <span className="font-roboto font-semibold text-lg text-[#C5B6DE]">
                Create New Project
              </span>
            </motion.button>
          </Link>
        </div>

        {/* Global Footer */}
        <div className="w-full mt-24">
          <Footer />
        </div>
      </main>
    </div>
  );
}
