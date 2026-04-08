"use client";

import FlowHeader from "@/components/FlowHeader";
import Footer from "@/components/Footer";
import { Download, Share2, CornerUpRight, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";

export default function AccessoriesResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const style = (params.style as string) || "bags";
  const product = searchParams.get("product") || "Handbag";

  const results = [
    { id: 1, type: "Prime", image: "/assets/accessories/bags/tote_prime_example.jpg" },
    { id: 2, type: "Side View", image: "/assets/accessories/bags/tote_prime_example.jpg" },
    { id: 3, type: "Detail", image: "/assets/accessories/bags/tote_prime_example.jpg" },
    { id: 4, type: "Lifestyle", image: "/assets/accessories/bags/tote_prime_example.jpg" },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0 font-roboto">
      <FlowHeader title="Generation Results" />

      <main className="w-full max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col">
        {/* Header Section */}
        <section className="mt-8 mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Success!</h1>
            <p className="text-[#99A1AF]">Your {product} assets are ready for cataloging.</p>
          </motion.div>
          
          <div className="flex gap-4">
            <button className="flex-1 lg:flex-none h-12 px-6 rounded-full border border-white/10 bg-white/5 flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
              <Share2 className="w-4 h-4" />
              <span>Share Pack</span>
            </button>
            <button className="flex-1 lg:flex-none h-12 px-6 rounded-full bg-figma-gradient flex items-center justify-center gap-2 hover:brightness-110 transition-all">
              <Download className="w-4 h-4" />
              <span>Download All</span>
            </button>
          </div>
        </section>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20">
          {results.map((res, idx) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative flex flex-col gap-4"
            >
              <div className="relative aspect-[1/1.2] rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-[#1A1E29]">
                <Image src={res.image} alt={res.type} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-medium border border-white/10">
                  {res.type}
                </div>
              </div>
              
              <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-xs text-[#99A1AF] hover:text-white flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  View High-res
                </button>
                <button className="text-xs text-[#7C4DFF] font-semibold flex items-center gap-1">
                  <CornerUpRight className="w-3 h-3" />
                  Export to Store
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <Footer />
      </main>
    </div>
  );
}
