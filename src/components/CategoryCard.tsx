"use client";

import Image from "next/image";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  image: string;
}

const CategoryCard = ({ title, icon: Icon, image }: CategoryCardProps) => {
  return (
    <div className="relative w-full aspect-[169/141] rounded-[10px] overflow-hidden shadow-[0px_7.06px_28.24px_rgba(0,0,0,0.3)] transition-transform hover:scale-[1.02]">
      {/* Background Image */}
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover"
        loading="lazy"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/80" />
      
      {/* Content (Auto Layout) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[7.06px]">
        {/* Glow Icon */}
        <div className="glow-pink">
          <Icon className="w-[32px] h-[32px] text-white" />
        </div>
        
        {/* Label (Apparel/Jewellery/etc) */}
        <span className="font-roboto font-semibold text-base md:text-lg leading-tight text-center text-white">
          {title}
        </span>
      </div>
    </div>
  );
};

export default CategoryCard;
