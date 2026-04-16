// src/app/result/[id]/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, Share2, RefreshCw, Home } from "lucide-react";
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
        <FlowHeader title="AI Generation Result" />

        <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
          
          <div className="w-full max-w-2xl bg-[#121212]/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl overflow-hidden mb-10">
            
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
                  className="flex flex-col items-center py-20"
                >
                  <div className="relative w-24 h-24 mb-10">
                    <div className="absolute inset-0 rounded-full border-4 border-white/5 animate-pulse" />
                    <Loader2 className="w-full h-full text-[#A52FFF] animate-spin" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white via-[#CB87FF] to-white bg-clip-text text-transparent animate-gradient">
                    Generating your Masterpiece...
                  </h2>
                  <p className="text-[#99A1AF] text-center max-w-sm">
                    Our AI is meticulously crafting your {job?.outputStyle || "premium"} {job?.modelId || "fashion"} image. This usually takes 5-10 seconds.
                  </p>
                  
                  <div className="w-full max-w-xs h-1 bg-white/5 rounded-full mt-10 overflow-hidden">
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
                  <h2 className="text-2xl font-bold mb-2">Generation Failed</h2>
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
                  initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 mb-8">
                    <Image 
                      src={job.outputImage!} 
                      alt="AI Generated Fashion Image" 
                      fill 
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-4 left-4">
                      <div className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[10px] uppercase tracking-widest font-bold">
                        AI Generated
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={handleDownload}
                      className="flex-1 h-[56px] bg-[#A52FFF] hover:bg-[#8B26D9] text-white rounded-xl flex items-center justify-center gap-2 font-semibold transition-all shadow-lg active:scale-95"
                    >
                      <Download size={20} /> Download
                    </button>
                    <button className="flex-1 h-[56px] bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all">
                      <Share2 size={20} /> Share
                    </button>
                  </div>

                  <div className="mt-8 flex justify-center gap-6">
                    <button 
                      onClick={() => router.push("/")}
                      className="flex items-center gap-2 text-sm text-[#99A1AF] hover:text-white transition-colors"
                    >
                      <RefreshCw size={14} /> Generate Another
                    </button>
                    <button 
                      onClick={() => router.push("/")}
                      className="flex items-center gap-2 text-sm text-[#99A1AF] hover:text-white transition-colors"
                    >
                      <Home size={14} /> Back Home
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {job?.status === "completed" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20"
            >
              {[
                { label: "Model", value: job.modelId },
                { label: "Background", value: job.background },
                { label: "Style", value: job.outputStyle },
                { label: "Segment", value: "Ladies" }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="block text-[10px] text-[#99A1AF] uppercase tracking-wider mb-1">{item.label}</span>
                  <span className="block text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </motion.div>
          )}

        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
