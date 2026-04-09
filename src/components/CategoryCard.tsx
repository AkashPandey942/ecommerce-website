"use client";

import Image from "next/image";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  icon: LucideIcon;
  image: string;
  description?: string;
}

const CategoryCard = ({ title, icon: Icon, image, description }: CategoryCardProps) => {
  return (
    <div className="relative w-full aspect-[169/141] rounded-[10px] overflow-hidden shadow-[0px_7.06px_28.24px_rgba(0,0,0,0.3)] transition-all hover:scale-[1.02] group">
      {/* Background Image */}
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/90 focus:from-black/10 transition-colors" />
      
      {/* Content (Auto Layout) */}
      <div className="absolute inset-x-4 inset-y-0 flex flex-col items-center justify-center gap-[7.06px] text-center">
        {/* Glow Icon */}
        <div className="glow-pink">
          <Icon className="w-[32px] h-[32px] text-white" />
        </div>
        
        {/* Label (Apparel/Jewellery/etc) */}
        <span className="font-roboto font-semibold text-lg leading-tight text-white uppercase tracking-wider">
          {title}
        </span>

        {/* Descriptor (SaaS Rule 6.1) */}
        {description && (
          <p className="font-roboto font-normal text-[11px] leading-tight text-[#C2C6D6] max-w-[140px] opacity-70 group-hover:opacity-100 transition-opacity">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;
