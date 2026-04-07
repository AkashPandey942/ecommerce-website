"use client";

import Image from "next/image";

interface SegmentCardProps {
  title: string;
  image: string;
  fullWidth?: boolean;
}

const SegmentCard = ({ title, image, fullWidth = false }: SegmentCardProps) => {
  return (
    <div className={`relative ${fullWidth ? "w-full" : "w-full aspect-[171/135]"} h-[135px] rounded-[10px] overflow-hidden group cursor-pointer border border-white/5`}>
      {/* Background Image (Rectangle 8/9/10) */}
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover transition-transform group-hover:scale-105"
      />
      
      {/* Target Audience Overlay (Rectangle 9/10 in Figma) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
      
      {/* Label (Ladies/Gents/Kids) - Roboto 16px, 500/600 weight */}
      <div className="absolute inset-x-0 bottom-0 py-2.5 flex items-center justify-center">
        <span className={`font-roboto ${fullWidth ? "font-semibold" : "font-medium"} text-base leading-[19px] text-white`}>
          {title}
        </span>
      </div>
    </div>
  );
};

export default SegmentCard;
