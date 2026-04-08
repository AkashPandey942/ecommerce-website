"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { useInteraction } from "@/hooks/useInteraction";

interface BackgroundGridProps {
  selectedTitle: string | null;
  onSelect: (bg: { title: string; image: string }) => void;
  onPreview?: (bg: { title: string; image: string }) => void;
}

const BackgroundGrid = ({ selectedTitle, onSelect, onPreview }: BackgroundGridProps) => {
  const backgrounds = [
    { title: "White Studio", image: "/category_placeholder.png" }, // rectangle 45
    { title: "Premium Studio", image: "/hero_image.png" }, // rectangle 46
    { title: "Saree Festival", image: "/category_placeholder.png" }, // rectangle 47
    { title: "Outdoor", image: "/hero_image.png" }, // rectangle 48
    { title: "Modern Office", image: "/category_placeholder.png" }, // rectangle 49
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
      {backgrounds.map((bg, idx) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const interaction = useInteraction({
          onSingleClick: () => onSelect(bg),
          onDoubleClick: () => onPreview?.(bg),
          onLongPress: () => onPreview?.(bg),
        });

        return (
          <motion.div
            key={idx}
            {...interaction}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex flex-col gap-2 group cursor-pointer"
          >
            {/* Image Container (Rectangle 45/etc) */}
            <div className={`relative w-full aspect-[111/99] rounded-[6px] overflow-hidden border transition-all ${
              selectedTitle === bg.title ? "border-[#7C4DFF]" : "border-white/5 group-hover:border-[#7C4DFF]"
            }`}>
              <Image
                src={bg.image}
                alt={bg.title}
                fill
                className="object-cover"
                loading="lazy"
              />
            </div>
            
            {/* Label (Group 15/48/49/etc) */}
            <span className={`font-roboto font-medium text-[13px] leading-[15px] text-center transition-colors ${
              selectedTitle === bg.title ? "text-[#7C4DFF]" : "text-white"
            }`}>
              {bg.title}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BackgroundGrid;
