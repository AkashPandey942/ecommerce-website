"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import { Download, Play, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function FinalResultsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const results = [
    { title: "Front View", image: "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg", isVideo: false },
    { title: "Left View", image: "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg", isVideo: false },
    { title: "Right View", image: "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg", isVideo: false },
    { title: "Straight Walk", image: "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg", isVideo: true },
  ];

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 pb-20 lg:pb-0">
      <FlowHeader title="Results" />

      <main className="w-full flex-1 max-w-[393px] mx-auto pt-[120px] px-5 flex flex-col items-center">
        {/* Progress Dots - All 6 segments filled */}
        <div className="w-full flex gap-2 mb-10 items-center justify-center">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div 
              key={step} 
              className="h-1 w-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899]" 
            />
          ))}
        </div>

        {/* Results Grid (2-column, iPhone 16-12 Style) */}
        <div className="w-full grid grid-cols-2 gap-x-4 gap-y-8 mb-16 px-1">
          {results.map((res, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <div className="relative w-full aspect-[166/207] rounded-[10px] overflow-hidden border border-white/5 bg-[#1A1E29] group shadow-xl">
                <Image 
                  src={res.image} 
                  alt={res.title} 
                  fill 
                  className="object-cover transition-transform group-hover:scale-105 duration-700"
                />
                
                {res.isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[44px] h-[44px] rounded-full bg-figma-gradient flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
              <span className="font-roboto font-medium text-[13px] leading-[15px] text-white">
                {res.title}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Action Dashboard (Group 53) */}
        <div className="w-full flex flex-col gap-4 mb-20 mt-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-[61px] bg-figma-gradient rounded-[100px] shadow-[0_10px_40px_rgba(124,77,255,0.4)] flex items-center justify-center gap-2 font-roboto font-semibold text-[18px] text-white"
          >
            <Download className="w-5 h-5" /> Download All
          </motion.button>
          
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-[61px] border border-[#424754] rounded-[100px] flex items-center justify-center font-roboto font-semibold text-[18px] text-[#E2E2E8] transition-colors"
            >
              Create New Project
            </motion.button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
