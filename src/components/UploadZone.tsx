"use client";

import { Upload, Camera } from "lucide-react";
import { motion } from "framer-motion";

const UploadZone = () => {
  return (
    <motion.div
      whileHover={{ borderColor: "rgba(124,77,255,0.8)" }}
      className="relative w-full bg-[#2E1C4D] border border-dashed border-[#46277C] rounded-[14px] flex flex-col items-center justify-center cursor-pointer transition-colors px-5 pt-7 pb-6 gap-0"
    >
      {/* Upload Icon — gradient circle */}
      <div className="w-[54px] h-[54px] bg-gradient-to-br from-[#7C3AED] to-[#EC4899] rounded-full flex items-center justify-center shadow-[0_0_21px_rgba(236,72,153,0.35)] mb-4">
        <Upload className="w-[22px] h-[22px] text-white" strokeWidth={2.2} />
      </div>

      {/* Title */}
      <h3 className="font-roboto font-semibold text-[17px] leading-[22px] text-white text-center mb-[6px]">
        Upload Product Image
      </h3>

      {/* Subtitle */}
      <p className="font-roboto font-normal text-[13px] leading-[18px] text-[#99A1AF] text-center mb-[3px]">
        Drag and drop or click to select
      </p>
      <p className="font-roboto font-normal text-[13px] leading-[18px] text-[#99A1AF] text-center mb-6">
        Supports JPG, PNG (Max 10MB)
      </p>

      {/* Action Buttons — stacked vertically, full width */}
      <div className="flex flex-col gap-3 w-full">
        <button className="w-full h-[42px] flex items-center justify-center gap-2 bg-transparent border border-[#C5B6DE]/60 rounded-[10px] hover:bg-white/5 hover:border-[#C5B6DE] transition-all">
          <Camera className="w-[17px] h-[17px] text-[#C5B6DE]" strokeWidth={1.8} />
          <span className="font-roboto font-medium text-[13px] leading-[18px] text-[#C5B6DE]">
            Take Photo
          </span>
        </button>

        <button className="w-full h-[42px] flex items-center justify-center gap-2 bg-transparent border border-[#C5B6DE]/60 rounded-[10px] hover:bg-white/5 hover:border-[#C5B6DE] transition-all">
          <Upload className="w-[17px] h-[17px] text-[#C5B6DE]" strokeWidth={1.8} />
          <span className="font-roboto font-medium text-[13px] leading-[18px] text-[#C5B6DE]">
            Upload
          </span>
        </button>
      </div>
    </motion.div>
  );
};

export default UploadZone;
