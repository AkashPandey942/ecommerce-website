"use client";

import ApparelHeader from "@/components/ApparelHeader";
import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import { Download, Plus, Play } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function FinalResultsPage() {
  const params = useParams();
  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "Ethnic Wear";

  const results = [
    { title: "Front View", image: "/hero_image.png", isVideo: false },
    { title: "Left View", image: "/category_placeholder.png", isVideo: false },
    { title: "Side View", image: "/hero_image.png", isVideo: false },
    { title: "Straight Walk", image: "/category_placeholder.png", isVideo: true },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 pb-[100px] lg:pb-0">
      <ApparelHeader title="Results" />

      <main className="w-full max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        {/* Step 6: Fully Completed */}
        <ProgressStepper currentStep={6} />

        {/* Header Message */}
        <div className="text-left w-full mt-8 mb-8">
          <h2 className="font-roboto font-semibold text-[32px] leading-[40px] text-white">
            Project Summary
          </h2>
          <p className="font-roboto text-[#99A1AF] text-sm mt-1">
            All your high-fidelity generations for this project.
          </p>
        </div>

        {/* 2-Column Grid of Results (Rectangle 27 Style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full">
          {results.map((res, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="relative w-full aspect-[166/207] bg-[#1A1E29] rounded-[10px] overflow-hidden border border-white/5 shadow-xl group cursor-pointer hover:border-[#7C4DFF]/30 transition-all">
                <Image
                  src={res.image}
                  alt={res.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Video Play Overlay */}
                {res.isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-[44px] h-[44px] rounded-full bg-figma-gradient flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                )}

                {/* Subtle Gradient Backdrop for Title */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              </div>
              <span className="font-roboto font-medium text-[13px] leading-[15px] text-center text-[#E2E2E8]">
                {res.title}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Dashboard Actions */}
        <div className="w-full max-w-[393px] flex flex-col gap-4 mt-12 md:mt-20">
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
