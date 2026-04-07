"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface ProductHeroProps {
  image: string;
}

const ProductHero = ({ image }: ProductHeroProps) => {
  return (
    <div className="relative w-full max-w-[353px] aspect-square mx-auto mb-8 group">
      {/* Featured Image (Rectangle 13) */}
      <div className="relative w-full h-[340px] rounded-[10px] overflow-hidden shadow-2xl border border-white/5">
        <Image
          src={image}
          alt="Featured Product"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Pagination Indicators (Group 36) */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-2 h-[14px]">
        {/* Active Indicator (Rectangle 16) */}
        <div className="w-6 h-1.5 bg-figma-gradient rounded-full" />
        {/* Inactive Indicators (Ellipse 4, 5) */}
        <div className="w-1.5 h-1.5 bg-[#D9D9D9] rounded-full" />
        <div className="w-1.5 h-1.5 bg-[#D9D9D9] rounded-full" />
      </div>
    </div>
  );
};

export default ProductHero;
