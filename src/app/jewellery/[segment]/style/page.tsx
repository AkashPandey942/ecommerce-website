"use client";

import ApparelHeader from "@/components/ApparelHeader";
import ProgressStepper from "@/components/ProgressStepper";
import StyleCard from "@/components/StyleCard";
import Footer from "@/components/Footer";
import { Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function JewelleryStyleSelectionPage() {
  const params = useParams();
  const segmentParam = params?.segment;
  const segment = typeof segmentParam === 'string' ? decodeURIComponent(segmentParam).toLowerCase() : 'bridal';
  
  const jewelleryStyles = [
    { 
      title: "Sets and pieces", 
      subtitle: "Traditional and festive styles", 
      image: (segment.includes("bridal") || segment === "bridal")
        ? "/golden-jewlary.jpg" 
        : "/elegant-woman-showcasing-silver-necklace-with-vibrant-amethyst-aquamarine-stones-set-against-deep-background-dramatic-effect.jpg" 
    },
    { 
      title: "Custom", 
      subtitle: "Unlisted styles or custom workflow", 
      icon: Sparkles 
    },
  ];

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="relative flex flex-col min-h-screen bg-black text-white">
        <ApparelHeader title="Select Style" />
        <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5"></main>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <ApparelHeader title="Select Style" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5">
        {/* Step 2 partially progress per Figma (Step 1 full, Step 2 50%) */}
        <ProgressStepper currentStep={2} partialStep={true} />

        {/* Heading Section */}
        <section className="mt-8 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-roboto font-semibold text-3xl lg:text-[36px] leading-tight lg:leading-[45px] tracking-[-0.9px] text-[#E2E2E8] mb-4">
              Select Wear Type
            </h1>
            <p className="font-roboto font-normal text-base leading-[19px] lg:leading-[24px] text-[#C2C6D6] max-w-sm">
              Choose how your products are categorized in the AI editorial catalog
            </p>
          </motion.div>
        </section>

        {/* Style Selection List */}
        <section className="mb-20">
          <div className="flex flex-col gap-4 max-w-[353px] mx-auto">
            {jewelleryStyles.map((style, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={`/jewellery/${segment}/${style.title.toLowerCase().replace(' ', '-')}/upload`}>
                  <StyleCard 
                    title={style.title} 
                    subtitle={style.subtitle} 
                    image={style.image} 
                    icon={style.icon} 
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <Footer />
        <div className="h-[120px] lg:hidden" />
      </main>
    </div>
  );
}
