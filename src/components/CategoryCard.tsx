"use client";

import Image from "next/image";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  image: string;
  svgOverlay?: React.ReactNode;
}

const CategoryCard = ({ title, icon: Icon, image, svgOverlay }: CategoryCardProps) => {
  return (
    <div className="relative w-full aspect-[169/141] rounded-[10px] overflow-hidden shadow-[0px_7.06px_28.24px_rgba(0,0,0,0.3)] transition-transform hover:scale-[1.02]">
      {/* Background Image */}
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover"
       loading="lazy" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80" />
      
      {/* Content (Auto Layout or custom SVG overlay) */}
      {svgOverlay ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white w-full h-full">
          {svgOverlay}
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[7.06px]">
          {/* Glow Icon (Group 12/11/13/14) */}
          <div className="glow-pink">
            <Icon className="w-[28px] h-[28.97px] text-white" />
          </div>
          
          {/* Label (Apparel/Jewellery/etc) */}
          <span className="font-roboto font-semibold text-base leading-[19px] text-center text-white">
            {title}
          </span>
        </div>
      )}
    </div>
  );
};

export default CategoryCard;
