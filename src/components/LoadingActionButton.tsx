"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

interface LoadingActionButtonProps {
  isLoading: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  icon?: ReactNode;
}

const LoadingActionButton = ({
  isLoading,
  onClick,
  children,
  className = "",
  disabled = false,
  type = "button",
  variant = "primary",
  icon
}: LoadingActionButtonProps) => {
  const baseStyles = "relative flex items-center justify-center gap-2 rounded-full font-roboto font-semibold transition-all overflow-hidden";
  
  const variants = {
    primary: "bg-figma-gradient text-white shadow-[0_4px_30px_rgba(124,77,255,0.4)] hover:brightness-110",
    secondary: "bg-[#1A1F2E] border border-white/5 text-[#C5B6DE] hover:bg-[#252B3D]"
  };

  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled || isLoading ? "opacity-50 grayscale cursor-not-allowed" : ""}`}
    >
      {isLoading ? (
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="opacity-80">Processing...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </div>
      )}
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors pointer-events-none" />
    </motion.button>
  );
};

export default LoadingActionButton;
