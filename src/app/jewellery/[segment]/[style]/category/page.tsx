"use client";

import ApparelHeader from "@/components/ApparelHeader";
import ProgressStepper from "@/components/ProgressStepper";
import ProductTag from "@/components/ProductTag";
import Footer from "@/components/Footer";
import LoadingActionButton from "@/components/LoadingActionButton";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";

// Taxonomy Level 4: Leaf examples per screenshot 3
function getJewelleryProductTypes(segment: string) {
  const s = segment.toLowerCase();
  if (s.includes("bridal")) return ["Full Set", "Choker Set", "Necklace Set", "Earrings", "Bangles", "Maang Tikka", "Other"];
  if (s.includes("fashion")) return ["Earrings", "Rings", "Bracelets", "Necklaces", "Office-wear Sets", "Other"];
  if (s.includes("traditional") || s.includes("vintage")) return ["Temple", "Kundan", "Antique Finish", "Polki-style", "Festive Sets", "Other"];
  if (s.includes("daily") || s.includes("minimal")) return ["Studs", "Thin Chains", "Light Bracelets", "Minimal Rings", "Other"];
  return ["Necklace", "Earrings", "Ring", "Bracelet", "Other"];
}

const CAROUSEL_IMAGES = [
  "/golden-jewlary.jpg",
  "/assets/ladies/ethnic-wear/beautiful-indian-bride-wearing-bridal-lehenga-portrait.jpg",
  "/assets/ladies/ethnic-wear/bride-wearing-gold-orange-sari-is-wearing-gold-headband.jpg"
];

export default function JewelleryCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "bridal";
  const style = (params.style as string) || "sets-and-pieces";

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const productTypes = getJewelleryProductTypes(segment);

  const handleContinue = async () => {
    setIsContinuing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push(`/jewellery/${segment}/${style}/upload`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <ApparelHeader title="Select Product" />

      <main className="w-full flex-1 max-w-[393px] md:max-w-7xl mx-auto pt-[99px] px-5 flex flex-col">
        <div className="mt-4 mb-2">
          <ProgressStepper currentStep={3} />
        </div>

        {/* Hero Visual Section (Rectangle 13) */}
        <section className="relative w-full aspect-square max-h-[353px] mb-8 group">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative w-full h-full rounded-[10px] overflow-hidden shadow-2xl"
            >
              <Image 
                src={CAROUSEL_IMAGES[currentSlide]}
                alt="Jewellery Preview"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots (Group 36) */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {CAROUSEL_IMAGES.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx 
                  ? "w-8 bg-figma-gradient rounded-full" 
                  : "w-1.5 bg-[#D9D9D9]"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Category Selection Area */}
        <section className="mt-8 mb-10 flex-1">
          <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white mb-6">
            Choose Product Type
          </h2>

          <div className="flex flex-wrap gap-[14px]">
            {productTypes.map((type) => (
              <ProductTag 
                key={type}
                label={type}
                selected={selectedType === type}
                onClick={() => setSelectedType(type)}
              />
            ))}
          </div>
        </section>

        <div className="mt-auto mb-10 md:mb-16">
          <div className="w-full max-w-[353px] mx-auto">
            <LoadingActionButton
              isLoading={isContinuing}
              onClick={handleContinue}
              disabled={!selectedType || isContinuing}
              className="w-full h-[61px] text-[18px]"
            >
              Continue
            </LoadingActionButton>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
