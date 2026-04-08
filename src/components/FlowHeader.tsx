"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { ChevronLeft, Wallet } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useProject } from "@/context/ProjectContext";

interface FlowHeaderProps {
  title: string;
  showBack?: boolean;
}

const FlowHeader = ({ title, showBack = true }: FlowHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { credits } = useProject();

  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    const crumbs = [];
    
    if (parts.length > 0) {
      if (parts.includes('apparel')) crumbs.push('Apparel');
      if (parts.includes('jewellery')) crumbs.push('Jewellery');
      if (parts.includes('accessories')) crumbs.push('Accessories');
      if (parts.includes('products')) crumbs.push('Products');
      
      const segment = params.segment as string;
      const style = params.style as string;
      
      if (segment) crumbs.push(segment.charAt(0).toUpperCase() + segment.slice(1));
      if (style) crumbs.push(style.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    }
    
    return crumbs.join(' > ');
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="fixed top-0 left-0 right-0 h-[100px] bg-black/80 backdrop-blur-lg border-b border-white/5 z-50 px-5">
      <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
              >
                <ChevronLeft className="w-5 h-5 text-white group-hover:-translate-x-0.5 transition-transform" />
              </motion.button>
            )}
            
            <div className="flex flex-col">
              {breadcrumbs && (
                <span className="font-roboto text-[10px] uppercase tracking-widest text-[#7C4DFF] mb-1 font-bold">
                  {breadcrumbs}
                </span>
              )}
              <h1 className="font-roboto font-semibold text-xl lg:text-2xl text-[#E2E2E8]">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1E29] border border-[#7C4DFF]/30 shadow-[0_0_15px_rgba(124,77,255,0.15)]">
                <Wallet className="w-4 h-4 text-[#7C4DFF]" />
                <span className="font-roboto font-bold text-sm text-white">
                  {credits} <span className="text-[#C2C6D6]/60 font-normal ml-0.5">Credits</span>
                </span>
              </div>
            </div>

            <Link href="/">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] flex items-center justify-center shadow-lg">
                <span className="font-bold text-white">AG</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default FlowHeader;
