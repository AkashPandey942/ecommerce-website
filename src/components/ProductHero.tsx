"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductHeroProps {
  image?: string;
  images?: string[];
}

const ProductHero = ({ image, images = [] }: ProductHeroProps) => {
  const displayImages = images.length > 0 ? images : (image ? [image] : ["/hero_image.png"]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <div className="relative w-full max-w-[353px] h-[354px] mx-auto group flex flex-col items-center">
      {/* Featured Image (Rectangle 13) */}
      <div className="relative w-full h-[340px] rounded-[10px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.25)] border border-white/5 mb-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={displayImages[currentIndex]}
              alt={`Featured Product ${currentIndex + 1}`}
              fill
              className="object-cover"
              loading="lazy"
            />
          </motion.div>
        </AnimatePresence>
        
        {displayImages.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Pagination Indicators (Group 36) */}
      <div className="w-full flex justify-center items-center gap-2 h-[6px]">
        {displayImages.length > 1 ? (
          displayImages.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`cursor-pointer transition-all duration-300 rounded-full ${
                currentIndex === index 
                  ? "w-[24px] h-[6px] bg-figma-gradient shadow-[0_0_8px_rgba(124,77,255,0.6)]" 
                  : "w-[6px] h-[6px] bg-[#D9D9D9] hover:bg-white/80"
              }`}
            />
          ))
        ) : (
          <>
            <div className="w-[24px] h-[6px] bg-figma-gradient rounded-full" />
            <div className="w-[6px] h-[6px] bg-[#D9D9D9] rounded-full" />
            <div className="w-[6px] h-[6px] bg-[#D9D9D9] rounded-full" />
          </>
        )}
      </div>
    </div>
  );
};

export default ProductHero;
