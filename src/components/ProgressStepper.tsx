"use client";

import { motion } from "framer-motion";

interface ProgressStepperProps {
  currentStep?: number;
  partialStep?: boolean;
}

const ProgressStepper = ({ currentStep = 1, partialStep = false }: ProgressStepperProps) => {
  const steps = [
    { width: "50px", status: currentStep > 1 ? "full" : currentStep === 1 ? (partialStep ? "partial" : "full") : "empty" },
    { width: "50px", status: currentStep > 2 ? "full" : currentStep === 2 ? (partialStep ? "partial" : "full") : "empty" },
    { width: "50px", status: currentStep > 3 ? "full" : currentStep === 3 ? (partialStep ? "partial" : "full") : "empty" },
    { width: "50px", status: currentStep > 4 ? "full" : currentStep === 4 ? (partialStep ? "partial" : "full") : "empty" },
    { width: "50px", status: currentStep > 5 ? "full" : currentStep === 5 ? (partialStep ? "partial" : "full") : "empty" },
    { width: "50px", status: currentStep > 6 ? "full" : currentStep === 6 ? (partialStep ? "partial" : "full") : "empty" },
  ];

  return (
    <div className="w-full flex items-center justify-start md:justify-center gap-[10px] px-5 py-4 overflow-x-auto no-scrollbar">
      {steps.map((step, idx) => (
        <div 
          key={idx} 
          className="relative h-[3px] rounded-full flex-none bg-white/10 overflow-hidden"
          style={{ width: step.width }}
        >
          {step.status === "full" && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#EC4899]" />
          )}
          {step.status === "partial" && (
            <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-[#7C3AED] to-[#EC4899]" />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressStepper;
