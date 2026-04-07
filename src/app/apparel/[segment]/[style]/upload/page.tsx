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
import { useParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export default function UploadProductPage() {
  const params = useParams();
  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "Ethnic Wear";

  const [selectedStyle, setSelectedStyle] = useState<string>("Saree");
  const [selectedModel, setSelectedModel] = useState<string>("1");
  const [selectedBackground, setSelectedBackground] = useState<string>("White Studio");

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const styles = ["Saree", "Western", "Fusion", "Minimal", "Premium", "Other"];

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
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 pb-[120px] lg:pb-0">
      <ApparelHeader title="Upload Product" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5 overflow-hidden">
        {/* Step 4 in progress */}
        <ProgressStepper currentStep={4} />

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
                Output Style
              </h2>
              <div className="flex flex-wrap gap-3">
                {styles.map((item) => (
                  <ProductTag
                    key={item}
                    label={item}
                    selected={selectedStyle === item}
                    onClick={() => setSelectedStyle(item)}
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

        {/* Responsive Generate Button */}
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent z-50 lg:static lg:bg-none lg:p-0 lg:mt-16 lg:mb-16">
          <div className="max-w-lg mx-auto lg:max-w-[400px]">
            <Link href={`/apparel/${segment}/${style}/result`}>
              <button className="w-full h-[61px] bg-figma-gradient rounded-full shadow-[0_0_30px_rgba(124,77,255,0.4)] hover:brightness-110 transition-all flex items-center justify-center">
                <span className="font-roboto font-semibold text-lg leading-[21px] text-white text-center">
                  Generate Image
                </span>
              </button>
            </Link>
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
