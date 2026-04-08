"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useInteraction } from "@/hooks/useInteraction";

interface ModelItem {
  id: string;
  image: string;
}

interface ModelScrollProps {
  selectedId: string;
  onSelect: (model: ModelItem) => void;
  onPreview?: (model: ModelItem) => void;
}

const ModelScroll = ({ selectedId, onSelect, onPreview }: ModelScrollProps) => {
  const models = [
    { id: "1", image: "/hero_image.png" }, // photorealistic-hyper-realistic
    { id: "2", image: "/category_placeholder.png" }, // woman-white-sweater
    { id: "3", image: "/hero_image.png" }, // emerald-green-satin
    { id: "4", image: "/category_placeholder.png" }, // woman-with-long-brown
    { id: "5", image: "/hero_image.png" }, // woman-wearing-yellow
  ];

  return (
    <div className="w-full flex items-center justify-start gap-[10px] overflow-x-auto no-scrollbar scroll-smooth">
      {models.map((model) => {
        // Use custom interaction hook for each model item
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const interaction = useInteraction({
          onSingleClick: () => onSelect(model),
          onDoubleClick: () => onPreview?.(model),
          onLongPress: () => onPreview?.(model),
        });

        return (
          <motion.div
            key={model.id}
            {...interaction}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative w-[131px] h-[169px] rounded-md overflow-hidden flex-none group cursor-pointer border transition-all ${
              selectedId === model.id ? "border-[#7C4DFF]" : "border-white/5 shadow-inner"
            }`}
          >
            <Image
              src={model.image}
              alt={`Model ${model.id}`}
              fill
              className="object-cover"
              loading="lazy"
            />
            
            {/* Selection Indicator (Group 60/61 etc) - Only visible on selected/hover */}
            <div className={`absolute top-1.5 right-1.5 w-[15px] h-[15px] rounded-sm bg-gradient-to-br from-[#00C2FF] via-[#7C4DFF] to-[#FF00C7] flex items-center justify-center transition-opacity ${
              selectedId === model.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}>
              <Check className="w-[10px] h-[10px] text-white" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ModelScroll;
