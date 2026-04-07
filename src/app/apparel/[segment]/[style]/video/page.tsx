"use client";

import ApparelHeader from "@/components/ApparelHeader";
import ProgressStepper from "@/components/ProgressStepper";
import VideoStyleCard from "@/components/VideoStyleCard";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function VideoStylePage() {
  const params = useParams();
  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "Ethnic Wear";

  const [selectedVideoStyle, setSelectedVideoStyle] = useState<string>("Straight Walk");

  const videoStyles = [
    { title: "Straight Walk", image: "/hero_image.png" },
    { title: "Slow Turn", image: "/category_placeholder.png" },
    { title: "Elegant Reveal", image: "/hero_image.png" },
    { title: "Fabric Flow", image: "/category_placeholder.png" },
  ];

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 pb-[120px] lg:pb-0">
      <ApparelHeader title="Video Style" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5 overflow-hidden">
        {/* Step 5 in progress */}
        <ProgressStepper currentStep={5} />

        <div className="mt-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-roboto font-semibold text-[36px] leading-[45px] text-[#E2E2E8] tracking-[-0.9px]"
          >
            Select Video Style
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="font-roboto font-normal text-[16px] leading-[19px] text-[#C2C6D6] mt-2"
          >
            Choose video animation style
          </motion.p>
        </div>

        {/* Video Animation Style Grid (2x2 Mobile, Dynamic Desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
          {videoStyles.map((vs, idx) => (
            <VideoStyleCard
              key={idx}
              title={vs.title}
              image={vs.image}
              selected={selectedVideoStyle === vs.title}
              onClick={() => setSelectedVideoStyle(vs.title)}
            />
          ))}
        </div>

        {/* AI Custom Prompt Section */}
        <section className="mt-16 max-w-2xl">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-3">
              <button className="h-[36px] px-5 border border-[#424754] rounded-full hover:bg-white/5 transition-colors">
                <span className="font-roboto font-semibold text-sm text-[#E2E2E8]">
                  Use Prompt
                </span>
              </button>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#FF6464]" />
                <span className="font-roboto font-normal text-[12px] leading-[14px] text-[#FF6565]">
                  Custom prompts may vary. Use at your own risk
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white">
                AI Custom
              </h2>
              <span className="font-roboto font-semibold text-xs leading-[14px] text-[#C5B6DE]">
                (Optional)
              </span>
            </div>
          </div>

          <div className="relative group">
            <textarea
              className="w-full h-[95px] bg-black/30 border border-white/20 rounded-[10px] p-4 font-roboto text-sm focus:border-[#7C4DFF] focus:ring-1 focus:ring-[#7C4DFF] outline-none transition-all placeholder:text-[#C2C6D6]/40 resize-none"
              placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
            />
          </div>
        </section>

        {/* Responsive Generate Button */}
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent z-50 lg:static lg:bg-none lg:p-0 lg:mt-16 lg:mb-16">
          <div className="max-w-lg mx-auto lg:max-w-[400px]">
            <Link href={`/apparel/${segment}/${style}/video/result`}>
              <button className="w-full h-[61px] bg-figma-gradient rounded-full shadow-[0_0_30px_rgba(124,77,255,0.4)] hover:brightness-110 transition-all flex items-center justify-center">
                <span className="font-roboto font-semibold text-lg leading-[21px] text-white text-center">
                  Generate Video
                </span>
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Desktop Footer */}
      <Footer />
    </div>
  );
}
