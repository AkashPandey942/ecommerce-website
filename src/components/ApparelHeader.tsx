"use client";

import { ChevronLeft, Coins } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface ApparelHeaderProps {
  title?: string;
}

const ApparelHeader = ({ title = "Select Segment" }: ApparelHeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[99px] bg-gradient-to-b from-black to-[#18142E] rounded-b-[30px] flex items-center px-5">

      {/* Main Bar Content */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3">

        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">

          {/* Mobile: compact icon + brand name (home only) */}
          {isHome && (
            <Link href="/" className="flex lg:hidden items-center gap-2">
              {/* Purple circle icon */}
              <div className="w-8 h-8 bg-[#7C4DFF] rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(124,77,255,0.5)] flex-shrink-0">
                <div className="w-[11px] h-[11px] bg-white rotate-45" />
              </div>
              <span className="font-manrope font-bold text-[18px] leading-7 tracking-[-0.45px] text-[#E2E2E8] whitespace-nowrap">
                Digital Atelier
              </span>
            </Link>
          )}

          {/* Desktop: full SVG brand logo (always) */}
          <Link href="/" className="hidden lg:flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#7C4DFF] rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(124,77,255,0.5)] flex-shrink-0 transition-transform group-hover:scale-105">
              <div className="w-[11px] h-[11px] bg-white rotate-45" />
            </div>
            <span className="font-manrope font-bold text-[18px] leading-7 tracking-[-0.45px] text-[#E2E2E8] whitespace-nowrap">
              Digital Atelier
            </span>
          </Link>

          {/* Back Button — interior pages on ALL screens */}
          {!isHome && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="w-10 h-10 flex-shrink-0 bg-white/5 border border-white/10 rounded-[14px] flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </motion.button>
          )}

          {/* Page Title — interior pages only */}
          {!isHome && title.trim() && (
            <h1 className="font-roboto font-semibold text-xl leading-[23px] text-white">
              {title}
            </h1>
          )}
        </div>

        {/* CENTER: Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-10 flex-shrink-0">
          {[
            { label: "Studio", href: "/" },
            { label: "Gallery", href: "/gallery" },
            { label: "AI Lab", href: "/ai-lab" },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`font-inter font-medium text-sm hover:text-white transition-colors ${isActive ? "text-figma-gradient" : "text-[#9CA3AF]"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* RIGHT: Credits */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Credit Badge */}
          <div className="flex items-center px-[11px] h-[38px] rounded-full bg-[rgba(48,48,48,0.2)] border border-[#2F2751] gap-2">
            <Coins className="w-[10.5px] h-[10.5px] text-[#7C4DFF] flex-shrink-0" />
            <span className="font-roboto font-medium text-[11px] tracking-[0.55px] uppercase text-[#7C4DFF] whitespace-nowrap">
              120 Credits
            </span>
          </div>

          {/* Profile Avatar — only on home screen to match reference layout */}
          {isHome && (
            <Link href="/profile">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-[36px] h-[36px] lg:w-[45px] lg:h-[45px] rounded-full border border-[#2F2751] overflow-hidden cursor-pointer flex-shrink-0"
              >
                <Image
                  src="/profile_avatar_placeholder.png"
                  alt="Profile"
                  width={45}
                  height={45}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </motion.div>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};

export default ApparelHeader;
