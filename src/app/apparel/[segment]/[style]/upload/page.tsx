"use client";

import ApparelHeader from "@/components/ApparelHeader";
import ProgressStepper from "@/components/ProgressStepper";
import UploadZone from "@/components/UploadZone";
import ModelScroll from "@/components/ModelScroll";
import BackgroundGrid from "@/components/BackgroundGrid";
import ProductTag from "@/components/ProductTag";
import AIDirectorNotes from "@/components/AIDirectorNotes";
import Footer from "@/components/Footer";
import SelectionPreviewModal from "@/components/SelectionPreviewModal";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import LoadingActionButton from "@/components/LoadingActionButton";

export default function UploadProductPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "Ethnic Wear";

  const [isContinuing, setIsContinuing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("1");
  const [selectedBackground, setSelectedBackground] = useState<string>("White Studio");

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Taxonomy Level 4: Leaf examples per screenshot 2
  const getProductTypes = () => {
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

  const productTypes = getProductTypes();
  const [selectedProduct, setSelectedProduct] = useState<string>(productTypes[0]);

  const handleContinue = async () => {
    setIsContinuing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    router.push(`/apparel/${segment}/${style}/views`);
  };

  const handleModelSelect = (model: { id: string; image: string }) => {
    setSelectedModel(model.id);
    setPreviewImage(model.image);
    setIsPreviewOpen(true);
  };

  const handleBackgroundSelect = (bg: { title: string; image: string }) => {
    setSelectedBackground(bg.title);
    setPreviewImage(bg.image);
    setIsPreviewOpen(true);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <ApparelHeader title="Upload Product" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5">
        {/* Step 3 in progress */}
        <ProgressStepper currentStep={3} partialStep={true} />

        <div className="md:grid md:grid-cols-[1.2fr_1.8fr] lg:grid-cols-[1fr_2fr] gap-8 lg:gap-16 mt-8">
          {/* Column 1: Main Input (Sticky on Desktop) */}
          <div className="flex flex-col gap-8 md:sticky md:top-[140px] md:h-fit">
            {/* 1. Upload Zone */}
            <section>
              <UploadZone />
            </section>

            {/* 5. AI Director Notes */}
            <section className="hidden md:block">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white">
                  AI Director Notes
                </h2>
                <span className="font-roboto font-semibold text-xs leading-[14px] text-[#C5B6DE]">
                  (Optional)
                </span>
              </div>
              <AIDirectorNotes />
            </section>
          </div>

          {/* Column 2: Configuration */}
          <div className="flex flex-col gap-10 mt-10 md:mt-0">
            {/* 2. Select Model Selection */}
            <section>
              <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white mb-6">
                Select Model
              </h2>
              <div className="-mx-5 px-5">
                <ModelScroll
                  selectedId={selectedModel}
                  onSelect={handleModelSelect}
                />
              </div>
            </section>

            {/* 3. Background Style Selection */}
            <section>
              <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white mb-6">
                Background Style
              </h2>
              <BackgroundGrid
                selectedTitle={selectedBackground}
                onSelect={handleBackgroundSelect}
              />
            </section>

            {/* 4. Output Style Selection */}
            <section>
              <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white mb-6">
                Choose Product Type
              </h2>
              <div className="flex flex-wrap gap-3">
                {productTypes.map((item) => (
                  <ProductTag
                    key={item}
                    label={item}
                    selected={selectedProduct === item}
                    onClick={() => setSelectedProduct(item)}
                  />
                ))}
              </div>
            </section>

            {/* 5. AI Director Notes (Mobile Only) */}
            <section className="md:hidden">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white">
                  AI Director Notes
                </h2>
                <span className="font-roboto font-semibold text-xs leading-[14px] text-[#C5B6DE]">
                  (Optional)
                </span>
              </div>
              <AIDirectorNotes />
            </section>
          </div>
        </div>

        {/* Inline Generate Button */}
        <div className="w-full mt-10 mb-10 lg:mb-16">
          <div className="w-full max-w-[353px] mx-auto lg:max-w-[400px]">
            <LoadingActionButton
              isLoading={isContinuing}
              onClick={handleContinue}
              className="w-full h-[61px]"
            >
              Continue
            </LoadingActionButton>
          </div>
        </div>
      </main>

      {/* Desktop Footer */}
      <Footer />

      {/* AI Selection Preview Modal */}
      <SelectionPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        image={previewImage}
      />
    </div>
  );
}
