"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import VideoStyleCard from "@/frontend/components/VideoStyleCard";
import Footer from "@/frontend/components/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Film } from "lucide-react";

export default function VideoStylePage() {
  const params = useParams();
  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "Ethnic Wear";

  const [selectedVideoStyle, setSelectedVideoStyle] = useState<string>("Straight Walk");

  const videoStyles = [
    { 
      title: "Straight Walk", 
      image: "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg", 
      desc: "Classic runway walk directly towards camera.",
      storyboard: [
        "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg",
        "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg",
        "/assets/ladies/ethnic-wear/ChatGPT Image Apr 1, 2026, 05_49_51 PM.png"
      ]
    },
    { 
      title: "Slow Turn", 
      image: "/assets/ladies/ethnic-wear/ChatGPT Image Apr 1, 2026, 05_49_51 PM.png", 
      desc: "360-degree rotation to show all garment angles.",
      storyboard: [
        "/assets/ladies/ethnic-wear/ChatGPT Image Apr 1, 2026, 05_49_51 PM.png",
        "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg",
        "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg"
      ]
    },
    { 
      title: "Elegant Reveal", 
      image: "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg", 
      desc: "Soft pan up from feet to head with pose change.",
      storyboard: [
        "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg",
        "/assets/ladies/ethnic-wear/ChatGPT Image Apr 1, 2026, 06_05_22 PM.png",
        "/assets/ladies/ethnic-wear/ChatGPT Image Apr 1, 2026, 06_21_52 PM.png"
      ]
    },
    { 
      title: "Fabric Flow", 
      image: "/assets/ladies/ethnic-wear/ChatGPT Image Apr 1, 2026, 06_21_52 PM.png", 
      desc: "Focus on cloth movement and physics." 
    },
  ];

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Motion Treatment" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={10} />

        <div className="mt-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-roboto font-semibold text-[36px] leading-[45px] text-[#E2E2E8] tracking-[-0.9px]"
          >
            Video Storyboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="font-roboto font-normal text-[16px] leading-[19px] text-[#C2C6D6] mt-2"
          >
            Select a motion preset for your AI animation
          </motion.p>
        </div>

        {/* Video Animation Style Grid (2x2 Mobile, Dynamic Desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
          {videoStyles.map((vs, idx) => (
            <VideoStyleCard
              key={idx}
              title={vs.title}
              image={vs.image}
              storyboard={vs.storyboard}
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

        {/* Inline Generate Button */}
        <div className="w-full mt-10 mb-10 lg:mb-16">
          <div className="w-full max-w-full sm:max-w-[353px] mx-auto lg:max-w-[400px]">
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
