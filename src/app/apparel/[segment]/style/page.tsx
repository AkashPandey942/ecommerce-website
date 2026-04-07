"use client";

import ApparelHeader from "@/components/ApparelHeader";
import ProgressStepper from "@/components/ProgressStepper";
import StyleCard from "@/components/StyleCard";
import Footer from "@/components/Footer";
import { Settings } from "lucide-react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function StyleSelectionPage() {
  const params = useParams();
  const segment = (params.segment as string) || "Ladies";
  const formattedSegment = segment.charAt(0).toUpperCase() + segment.slice(1);

  const isGents = segment.toLowerCase() === "gents" || segment.toLowerCase() === "men";

  const styles = [
    { 
      title: "Ethnic Wear", 
      subtitle: "Traditional and festive styles", 
      image: isGents 
        ? "/assets/men/ethnic-wear/indian-man-traditional-wear-kurta-pyjama-cloths.jpg" 
        : "/hero_slide_1.png" 
    },
    { 
      title: "Western Wear", 
      subtitle: "Modern and casual styles", 
      image: isGents 
        ? "/assets/men/western-wear/men-fashion-editorial-outdoors.jpg" 
        : "/assets/ladies/western-wear/western-clothes.jpg" 
    },
    { 
      title: "Custom", 
      subtitle: "Unlisted styles or custom workflow", 
      icon: Settings 
    },
  ];

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0">
      {/* Update title to Select Style as per Group 9 variation */}
      <ApparelHeader title="Select Wear Type" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5">
        {/* Step 2 in progress */}
        <ProgressStepper currentStep={2} />

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
              Choose how your products are categorized in the AI editorial catalog for {formattedSegment}
            </p>
          </motion.div>
        </section>

        {/* Style Selection List/Grid */}
        <section className="mb-20">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {styles.map((style, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={`/apparel/${segment}/${style.title.toLowerCase().replace(' ', '-')}`}>
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

      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
