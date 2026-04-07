"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const Navbar = () => {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 glass h-16"
    >
      <Link href="/" className="text-xl font-bold tracking-tighter text-white">
        FIGMA<span className="text-primary">UI</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
        {["Features", "Showcase", "Pricing", "About"].map((item) => (
          <Link 
            key={item} 
            href={`#${item.toLowerCase()}`}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            {item}
          </Link>
        ))}
      </div>
      
      <button className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary/90 transition-all shadow-[0_0_20px_var(--color-primary-glow)]">
        Get Started
      </button>
    </motion.nav>
  );
};

export default Navbar;
