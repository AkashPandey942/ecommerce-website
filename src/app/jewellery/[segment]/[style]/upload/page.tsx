"use client";

import ApparelHeader from "@/components/ApparelHeader";
import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductTag from "@/components/ProductTag";
import LoadingActionButton from "@/components/LoadingActionButton";

// Taxonomy Level 4: Leaf examples per screenshot 3
function getJewelleryProductTypes(segment: string) {
  const s = segment.toLowerCase();
  
  if (s.includes("bridal")) {
    return ["Full Set", "Choker Set", "Necklace Set", "Earrings", "Bangles", "Maang Tikka", "Other"];
  }
  if (s.includes("fashion")) {
    return ["Earrings", "Rings", "Bracelets", "Necklaces", "Office-wear Sets", "Other"];
  }
  if (s.includes("traditional") || s.includes("vintage")) {
    return ["Temple", "Kundan", "Antique Finish", "Polki-style", "Festive Sets", "Other"];
  }
  if (s.includes("daily") || s.includes("minimal")) {
    return ["Studs", "Thin Chains", "Light Bracelets", "Minimal Rings", "Other"];
  }
  
  return ["Necklace", "Earrings", "Ring", "Bracelet", "Other"];
}

const CAROUSEL_IMAGES = [
  "/indian-bride-9-2025-12-2fd0a5885b204639c8156089c6d2ebad-16x9.avif",
  "/assets/ladies/ethnic-wear/beautiful-indian-bride-wearing-bridal-lehenga-portrait.jpg",
  "/assets/ladies/ethnic-wear/bride-wearing-gold-orange-sari-is-wearing-gold-headband.jpg"
];

export default function JewelleryProductSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params?.segment as string) || "bridal";
  const style = (params?.style as string) || "sets-and-pieces";
  
  const productTypes = getJewelleryProductTypes(segment);

  const [mounted, setMounted] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleContinue = async () => {
    setIsContinuing(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    router.push(`/jewellery/${segment}/${style}/views`);
  };

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="relative flex flex-col min-h-screen bg-black text-white">
        <ApparelHeader title="Select Product" />
        <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[105px] px-5"></main>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <ApparelHeader title="Select Product" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[105px] px-5">
        {/* Step 3 partial progress per Figma (Step 1&2 full, Step 3 50%) */}
        <ProgressStepper currentStep={3} partialStep={true} />

        {/* Image Carousel (Rectangle 13) */}
        <section className="relative w-full aspect-square max-w-[353px] mx-auto mt-6 mb-10 group overflow-hidden rounded-[10px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-full"
            >
              <Image
                src={CAROUSEL_IMAGES[currentSlide]}
                alt={`Product Preview ${currentSlide + 1}`}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots (Group 36) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {CAROUSEL_IMAGES.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx 
                  ? "w-6 bg-gradient-to-r from-[#00C2FF] via-[#7C4DFF] to-[#FF00C7]" 
                  : "w-1.5 bg-[#D9D9D9]"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Product Type Selection */}
        <section className="mb-10 lg:max-w-2xl lg:mx-auto">
          <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white mb-6">
            Choose Product Type
          </h2>
          
          <div className="flex flex-wrap gap-2.5">
            {productTypes.map((type) => (
              <ProductTag
                key={type}
                label={type}
                selected={selectedType === type}
                onClick={() => setSelectedType(prev => prev === type ? null : type)}
              />
            ))}
          </div>
        </section>

        {/* Continue Button */}
        <section className="mb-20">
          <LoadingActionButton
            isLoading={isContinuing}
            onClick={handleContinue}
            disabled={!selectedType || isContinuing}
            className="w-full max-w-[353px] mx-auto h-[61px]"
          >
            Continue
          </LoadingActionButton>
        </section>

        <Footer />
        <div className="h-[120px] lg:hidden" />
      </main>
    </div>
  );
}
