"use client";

import { motion } from "framer-motion";

interface ProgressStepperProps {
  currentStep?: number;
}

const ProgressStepper = ({ currentStep = 1 }: ProgressStepperProps) => {
  const steps = [
    { width: "50px", active: currentStep >= 1 },
    { width: "50px", active: currentStep >= 2 },
    { width: "50px", active: currentStep >= 3 },
    { width: "50px", active: currentStep >= 4 },
    { width: "50px", active: currentStep >= 5 },
    { width: "50px", active: currentStep >= 6 },
  ];

  return (
    <div className="w-full flex items-center justify-start md:justify-center gap-[10px] px-5 py-4 overflow-x-auto no-scrollbar">
      {steps.map((step, idx) => (
        <div 
          key={idx} 
          className={`h-[3px] rounded-full flex-none ${step.active ? "bg-gradient-to-r from-[#7C3AED] to-[#EC4899]" : "bg-white/10"}`}
          style={{ width: step.width }}
        />
      ))}
    </div>
  );
};

export default ProgressStepper;
