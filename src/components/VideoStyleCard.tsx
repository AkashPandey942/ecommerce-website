"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

interface VideoStyleCardProps {
  title: string;
  image: string;
  selected: boolean;
  onClick: () => void;
}

const VideoStyleCard = ({ title, image, selected, onClick }: VideoStyleCardProps) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative flex flex-col items-center gap-3 cursor-pointer group"
    >
      {/* Rectangle 27 Container */}
      <div className={`relative w-[166px] h-[207px] rounded-[10px] overflow-hidden border-2 transition-all ${
        selected ? "border-[#7C4DFF] shadow-[0_0_20px_rgba(124,77,255,0.3)]" : "border-white/5 group-hover:border-[#7C4DFF]/50"
      }`}>
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
         loading="lazy" />

        {/* Play Icon/Ellipse 6 Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
          <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all ${
            selected ? "bg-white border-transparent" : "bg-transparent border border-white"
          }`}>
            <Play className={`w-5 h-5 transition-colors ${
              selected ? "text-[#7C4DFF] fill-[#7C4DFF]" : "text-white"
            }`} />
          </div>
        </div>
      </div>

      {/* Style Label (Straight Walk etc) */}
      <span className={`font-roboto font-medium text-[13px] leading-[15px] text-center transition-colors ${
        selected ? "text-[#7C4DFF]" : "text-white"
      }`}>
        {title}
      </span>
    </motion.div>
  );
};

export default VideoStyleCard;
