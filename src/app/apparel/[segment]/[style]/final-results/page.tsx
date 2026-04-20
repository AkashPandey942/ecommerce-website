"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import { Download, Plus, Play } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import StackedImagePreview from "@/frontend/components/StackedImagePreview";

export default function FinalResultsPage() {
  const params = useParams();
  const router = useRouter();
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
        {/* Progress Dots (Figma Style) */}
        <div className="flex justify-center gap-2 mb-8">
           {[1, 2, 3, 4, 5].map((dot) => (
             <div key={dot} className="h-1 w-8 rounded-full bg-[#7C4DFF]" />
           ))}
        </div>

        <div className="relative w-full aspect-[4/5] max-w-full sm:max-w-[353px] rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8 border border-white/5">
           <Image 
              src={segment.toLowerCase() === "gents" 
                ? "/assets/men/western-wear/men-fashion-editorial-outdoors.jpg" 
                : "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg"}
              alt="Final Result"
              fill
              className="object-contain"
           />
        </div>

        <div className="w-full max-w-full sm:max-w-[353px] flex gap-3 mb-10">
           <button 
             onClick={() => router.back()}
             className="flex-1 h-[51px] bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-sm font-medium"
           >
              <Plus className="w-4 h-4" /> More Angles
           </button>
           <button 
             onClick={() => router.push(`/result/mock-id/video-style`)}
             className="flex-1 h-[51px] bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-sm font-medium"
           >
              <Play className="w-4 h-4 ml-0.5" /> Create Video
           </button>
        </div>

        {/* Dashboard Actions */}
        <div className="w-full max-w-full sm:max-w-[353px] flex flex-col gap-4 mt-auto mb-10">
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
              className="w-full h-[61px] border border-white/10 rounded-full flex items-center justify-center gap-3 bg-transparent transition-colors text-white font-semibold text-lg"
            >
              Create New Project
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
