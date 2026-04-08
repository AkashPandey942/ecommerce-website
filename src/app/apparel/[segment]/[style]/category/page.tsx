"use client";

import ApparelHeader from "@/components/ApparelHeader";
import ProgressStepper from "@/components/ProgressStepper";
import ProductTag from "@/components/ProductTag";
import Footer from "@/components/Footer";
import LoadingActionButton from "@/components/LoadingActionButton";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

export default function CategorySelectionPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "ladies";
  const style = (params.style as string) || "ethnic-wear";

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);

  // Taxonomy Level 4: Leaf examples per Handoff Brief section 3.2
  const getApparelCategories = () => {
    const s = segment.toLowerCase();
    const isEthnic = style.toLowerCase().includes("ethnic");
    
    if (s === "gents" || s === "men") {
      return isEthnic 
        ? ["Kurta", "Sherwani", "Nehru Jacket", "Ethnic Set", "Other"]
        : ["Shirt", "T-shirt", "Blazer", "Jacket", "Trousers", "Casual Set", "Other"];
    }
    
    if (s === "kids") {
      return isEthnic
        ? ["Kids Kurta Set", "Kids Lehenga", "Festive Set", "Other"]
        : ["Frock", "Shirt", "Top", "Bottomwear", "Partywear Set", "Other"];
    }

    // Default: Ladies
    return isEthnic
      ? ["Saree", "Kurti", "Kurta Set", "Salwar Suit", "Lehenga", "Dupatta Set", "Blouse", "Other"]
      : ["Dress", "Top", "Shirt", "Blouse", "Skirt", "Co-ord Set", "Gown / Partywear", "Other"];
  };

  const categories = getApparelCategories();

  const handleContinue = async () => {
    setIsContinuing(true);
    // Mimic processing delay for premium feel
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push(`/apparel/${segment}/${style}/upload`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 overflow-x-hidden">
      {/* Header with Title and Credits Badge */}
      <ApparelHeader title="Select Product" />

      <main className="w-full flex-1 max-w-[393px] md:max-w-7xl mx-auto pt-[99px] px-5 flex flex-col">
        {/* Progress Stepper - Step 3 of 6 */}
        <div className="mt-4 mb-2">
          <ProgressStepper currentStep={3} />
        </div>

        {/* Hero Visual Section */}
        <div className="relative w-full aspect-[353/354] max-h-[400px] mb-8 group">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-full rounded-[10px] overflow-hidden shadow-2xl"
          >
            <Image 
              src="/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg"
              alt="Category Preview"
              fill
              className="object-cover"
              priority
            />
            {/* Dark Gradient Overlay for text readability on top/bottom */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>

          {/* Carousel Pagination Dots (Mock) */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className="w-8 h-[3px] bg-figma-gradient rounded-full" />
            <div className="w-2 h-2 rounded-full bg-[#D9D9D9]" />
            <div className="w-2 h-2 rounded-full bg-[#D9D9D9]" />
          </div>
        </div>

        {/* Category Selection Area */}
        <section className="mt-8 mb-10 flex-1">
          <motion.h2 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-roboto font-semibold text-xl leading-[23px] text-white mb-6"
          >
            Choose Product Type
          </motion.h2>

          <div className="flex flex-wrap gap-[14px]">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ProductTag 
                  label={cat}
                  selected={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer Action Button */}
        <div className="mt-auto mb-10 md:mb-16">
          <div className="w-full max-w-[353px] mx-auto">
            <LoadingActionButton
              isLoading={isContinuing}
              onClick={handleContinue}
              disabled={!selectedCategory || isContinuing}
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
