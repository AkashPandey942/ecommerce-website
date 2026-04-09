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

  const getTaxonomyData = () => {
    const s = segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
    const styleKey = styleParam.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    const styles = TAXONOMY.apparel.styles[s] || [];
    const matchedStyle = styles.find((st: any) => st.title === styleKey);
    
    return {
      categories: matchedStyle?.leafNodes || ["Saree", "Kurti", "Other"],
      samples: matchedStyle?.samples || ["/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg"],
      description: matchedStyle?.description || `High-fidelity ${styleKey} generation for marketplace-safe catalogs.`
    };
  };

  const [activeSample, setActiveSample] = useState(0);

  const { categories, samples, description } = getTaxonomyData();
  const visibleCategories = showAll ? categories : categories.slice(0, 7);
  const hasMore = categories.length > 8;

  const handleContinue = async () => {
    setIsContinuing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push(`/apparel/${segment}/${styleParam}/upload`);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const index = Math.round(scrollLeft / width);
    setActiveSample(index);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 overflow-x-hidden">
      <FlowHeader title="Select Product" />

      <main className="w-full flex-1 max-w-[393px] md:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col">
        <div className="mt-4 mb-2">
          <ProgressStepper currentStep={3} />
        </div>

        {/* SaaS Step 3: Gallery Carousel */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[10px] uppercase tracking-widest text-[#AF8CFF] font-bold">Sample Deliverables</h3>
            <span className="text-[10px] text-white/70 italic" aria-hidden="true">Swipe to explore</span>
          </div>
          
          <div 
            onScroll={handleScroll}
            role="region"
            aria-label="Sample image gallery"
            className="flex overflow-x-auto gap-4 no-scrollbar pb-2 snap-x snap-mandatory cursor-grab active:cursor-grabbing"
          >
            {samples.map((img: string, idx: number) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative flex-none w-[280px] md:w-[400px] aspect-[4/5] rounded-[10px] overflow-hidden shadow-2xl snap-center border border-white/5"
              >
                <Image 
                  src={img}
                  alt={`High-fidelity sample shoot ${idx + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />
              </motion.div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-1.5 mt-4" role="tablist" aria-label="Gallery pagination">
            {samples.map((_: any, idx: number) => (
              <div 
                key={idx}
                role="tab"
                aria-selected={activeSample === idx}
                aria-label={`Go to sample ${idx + 1}`}
                className={`h-1 rounded-full transition-all duration-300 ${
                  activeSample === idx ? "w-6 bg-[#7C4DFF]" : "w-1 bg-white/10"
                }`}
              />
            ))}
          </div>

          <div className="mt-4 px-1">
            <p className="font-roboto text-sm text-[#C2C6D6] italic opacity-80 leading-relaxed">
              {description}
            </p>
          </div>
        </section>

        <section className="mt-4 mb-10 flex-1">
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
