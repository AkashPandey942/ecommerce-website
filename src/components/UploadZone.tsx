"use client";

import { Upload, Camera, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import Image from "next/image";

interface UploadZoneProps {
  onFileSelect?: (file: File | null) => void;
  hideText?: boolean;
}

const UploadZone = ({ onFileSelect, hideText = false }: UploadZoneProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File must be less than 10MB");
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      onFileSelect?.(file);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(null);
    onFileSelect?.(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      {/* The capture attribute forces camera on mobile devices */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      <motion.div
        whileHover={!selectedImage ? { borderColor: "rgba(124,77,255,0.8)" } : {}}
        onClick={() => !selectedImage && fileInputRef.current?.click()}
        className={`relative w-full bg-[#2E1C4D] border ${
          selectedImage ? "border-transparent p-0 overflow-hidden h-[260px]" : "border-dashed border-[#46277C] px-5 pt-7 pb-6 min-h-[260px]"
        } rounded-[14px] flex flex-col items-center justify-center cursor-pointer transition-colors gap-0`}
      >
        <AnimatePresence mode="wait">
          {selectedImage ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full relative"
            >
              <Image 
                src={selectedImage} 
                alt="Uploaded product" 
                fill 
                className="object-cover" 
                loading="lazy"
                unoptimized
              />
              <button
                onClick={clearImage}
                className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10 shadow-lg border border-white/10"
              >
                <X size={16} />
              </button>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4 z-10 w-full pointer-events-auto">
                <button 
                  onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                  className="flex-1 max-w-[140px] h-[36px] flex items-center justify-center gap-2 bg-black/50 backdrop-blur-md border border-white/20 hover:border-figma-gradient rounded-[10px] hover:bg-black/70 transition-all font-roboto text-[12px] text-white"
                >
                  <Camera size={14} /> Retake
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="flex-1 max-w-[140px] h-[36px] flex items-center justify-center gap-2 bg-black/50 backdrop-blur-md border border-white/20 hover:border-figma-gradient rounded-[10px] hover:bg-black/70 transition-all font-roboto text-[12px] text-white"
                >
                  <Upload size={14} /> Re-upload
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full"
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
                <button 
                  onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                  className="w-full h-[42px] flex items-center justify-center gap-2 bg-transparent border border-[#C5B6DE]/60 rounded-[10px] hover:bg-white/5 hover:border-[#C5B6DE] transition-all"
                >
                  <Camera className="w-[17px] h-[17px] text-[#C5B6DE]" strokeWidth={1.8} />
                  <span className="font-roboto font-medium text-[13px] leading-[18px] text-[#C5B6DE]">
                    Take Photo
                  </span>
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="w-full h-[42px] flex items-center justify-center gap-2 bg-transparent border border-[#C5B6DE]/60 rounded-[10px] hover:bg-white/5 hover:border-[#C5B6DE] transition-all"
                >
                  <Upload className="w-[17px] h-[17px] text-[#C5B6DE]" strokeWidth={1.8} />
                  <span className="font-roboto font-medium text-[13px] leading-[18px] text-[#C5B6DE]">
                    Upload
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default UploadZone;
