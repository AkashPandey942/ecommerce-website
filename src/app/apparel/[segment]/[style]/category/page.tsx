"use client";

import FlowHeader from "@/components/FlowHeader";
import ProgressStepper from "@/components/ProgressStepper";
import ProductTag from "@/components/ProductTag";
import Footer from "@/components/Footer";
import LoadingActionButton from "@/components/LoadingActionButton";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { useRecentBranch } from "@/hooks/useRecentBranch";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TAXONOMY } from "@/registry/taxonomy";

export default function CategorySelectionPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "ladies";
  const styleParam = (params.style as string) || "ethnic-wear";

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // SaaS Rule 6.1: Memory
  useRecentBranch(`${segment} ${styleParam}`, `/apparel/${segment}/${styleParam}/category`);

  const getTaxonomyCategories = () => {
    // Staff level improvement: Data-driven lookup
    const s = segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
    const styleKey = styleParam.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    const styles = TAXONOMY.apparel.styles[s] || [];
    const matchedStyle = styles.find((st: any) => st.title === styleKey);
    
    return matchedStyle?.leafNodes || ["Saree", "Kurti", "Other"];
  };

  const categories = getTaxonomyCategories();
  const visibleCategories = showAll ? categories : categories.slice(0, 7);
  const hasMore = categories.length > 8;

  const handleContinue = async () => {
    setIsContinuing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push(`/apparel/${segment}/${styleParam}/upload`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 overflow-x-hidden">
      <FlowHeader title="Select Product" />

      <main className="w-full flex-1 max-w-[393px] md:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col">
        <div className="mt-4 mb-2">
          <ProgressStepper currentStep={3} />
        </div>

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
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
          </motion.div>
        </div>

        <section className="mt-8 mb-10 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white">
              Choose Product Type
            </h2>
            {hasMore && (
              <button 
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-1 text-[#7C4DFF] text-sm font-medium hover:opacity-80 transition-opacity"
              >
                {showAll ? (
                  <><ChevronUp className="w-4 h-4" /> Less</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> See More</>
                )}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-[14px]">
            <AnimatePresence>
              {(showAll ? categories : visibleCategories).map((cat: string, idx: number) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ProductTag 
                    label={cat}
                    selected={selectedCategory === cat}
                    onClick={() => setSelectedCategory(prev => prev === cat ? null : cat)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

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
