// src/app/result/[id]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Share2, RefreshCw, Home, ZoomIn, Maximize } from "lucide-react";
import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import ProtectedRoute from "@/frontend/components/ProtectedRoute";

export default function GenerationResultPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<{
    status: "pending" | "processing" | "completed" | "failed";
    outputImage?: string;
    outputStyle?: string;
    modelId?: string;
    background?: string;
    error?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/status?jobId=${jobId}`);
      if (!response.ok) throw new Error("Failed to fetch status");
      
      const data = await response.json();
      setJob(data);

      // Stop polling if finished
      if (data.status === "completed" || data.status === "failed") {
        if (pollInterval.current) clearInterval(pollInterval.current);
      }
    } catch (err: unknown) {
      console.error("❌ [Result] Polling Error:", err);
      const message = err instanceof Error ? err.message : "Failed to fetch generation status";
      setError(message);
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;

    // Initial fetch
    fetchStatus();

    // Start polling every 3 seconds
    pollInterval.current = setInterval(fetchStatus, 3000);

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [fetchStatus, jobId]);

  const handleDownload = () => {
    if (job?.outputImage) {
      window.open(job.outputImage, "_blank");
    }
  };

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 flex flex-col">
        <FlowHeader title="Generated Result" />

        <main className="w-full flex-1 max-w-[393px] mx-auto pt-[120px] px-5 flex flex-col items-center">
          {/* Segmented Progress Bar - Match Figma Design */}
          <div className="w-full flex gap-2 mb-8 items-center justify-center">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div 
                key={step} 
                className={`h-1 w-full rounded-full transition-all duration-500 ${
                  step <= 5 
                    ? "bg-gradient-to-r from-[#7C3AED] to-[#EC4899]" 
                    : "bg-white/10"
                } ${step === 5 ? "w-1/2 bg-gradient-to-r from-[#7C3AED] to-[#EC4899]/50" : ""}`} 
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center py-12 text-center"
              >
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                  <RefreshCw className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                <p className="text-[#99A1AF] mb-8">{error}</p>
                <button 
                  onClick={() => router.push("/")}
                  className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
                >
                  Back to Lab
                </button>
              </motion.div>
            ) : !job || job.status === "pending" || job.status === "processing" ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center py-20 w-full"
              >
                <div className="relative w-24 h-24 mb-10">
                  <div className="absolute inset-0 rounded-full border-4 border-white/5 animate-pulse" />
                  <Loader2 className="w-full h-full text-[#A52FFF] animate-spin" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white via-[#CB87FF] to-white bg-clip-text text-transparent animate-gradient text-center">
                  Generating your Masterpiece...
                </h2>
                <p className="text-[#99A1AF] text-center max-w-sm">
                  Our AI is meticulously crafting your {job?.outputStyle || "premium"} image.
                </p>
                
                <div className="w-full h-1 bg-white/5 rounded-full mt-10 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#7C4DFF] to-[#A52FFF]"
                    initial={{ width: "0%" }}
                    animate={{ width: "90%" }}
                    transition={{ duration: 15, ease: "linear" }}
                  />
                </div>
              </motion.div>
            ) : job.status === "failed" ? (
              <motion.div 
                key="failed"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center py-12 text-center"
              >
                 <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                  <RefreshCw className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-white">Generation Failed</h2>
                <p className="text-[#99A1AF] mb-8">{job.error || "The AI model encountered an error."}</p>
                <button 
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-white text-black rounded-full font-semibold"
                >
                  Try Again
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="completed"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center w-full"
              >
                {/* Result Image Container (Rectangle 26) */}
                <div className="relative w-full max-w-[353px] aspect-[353/502] rounded-[24px] overflow-hidden border border-[#2E1C4D] bg-[#1A1E29] group shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8">
                  <Image 
                    src={job.outputImage!} 
                    alt="AI Generated Fashion Image" 
                    fill 
                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                    priority
                    unoptimized
                  />
                  
                  {/* Action Tooltips inside image */}
                  <div className="absolute right-[32px] top-[157px] flex flex-col gap-[8px] w-[42px] h-[92px]">
                    <button className="w-[42px] h-[42px] rounded-full bg-white/50 backdrop-blur-[12px] flex items-center justify-center border border-white/20 hover:bg-white/60 transition-colors shadow-lg">
                      <ZoomIn className="w-[18px] h-[18px] text-black" />
                    </button>
                    <button className="w-[42px] h-[42px] rounded-full bg-white/50 backdrop-blur-[12px] flex items-center justify-center border border-white/20 hover:bg-white/60 transition-colors shadow-lg">
                      <Maximize className="w-[18px] h-[18px] text-black" />
                    </button>
                  </div>
                </div>

                {/* Secondary Actions (Figma Style) */}
                <div className="w-full grid grid-cols-2 gap-3 mb-10">
                  <button 
                    onClick={() => router.back()}
                    className="h-[54px] rounded-full border border-[#424754] bg-[#121212]/30 flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-[#E2E2E8]"
                  >
                    <RefreshCw className="w-[12px] h-[12px]" />
                    <span className="font-roboto font-semibold text-[14px]">Regenerate</span>
                  </button>
                  <button 
                    onClick={() => router.back()}
                    className="h-[54px] rounded-full border border-[#424754] bg-[#121212]/30 flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-[#E2E2E8]"
                  >
                    <Share2 className="w-[13.5px] h-[12px]" />
                    <span className="font-roboto font-semibold text-[14px]">Edit Prompt</span>
                  </button>
                </div>

                <div className="w-full mb-10">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/result/${jobId}/views`)}
                    className="w-full h-[61px] bg-figma-gradient rounded-[100px] shadow-[0_10px_40px_rgba(124,77,255,0.4)] flex items-center justify-center font-roboto font-semibold text-[18px] text-white"
                  >
                    Approve & Continue
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
