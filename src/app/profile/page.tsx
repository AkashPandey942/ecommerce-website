"use client";

import FlowHeader from "@/components/FlowHeader";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { Coins, FolderKanban, Images, Settings, LogOut, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ProfilePage() {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0">
      <FlowHeader title="Profile" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        {/* User Info Section (John Doe) */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="flex flex-col items-center gap-4 mt-8 mb-12"
        >
          <div className="w-[100px] h-[100px] rounded-full border-2 border-figma-gradient p-1">
            <div className="w-full h-full rounded-full relative">
              <Image
                src="/profile_avatar_placeholder.png"
                alt="John Doe"
                fill
                className="object-cover"
               loading="lazy" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="font-roboto font-bold text-[24px] leading-[32px] text-white">
              John Doe
            </h2>
            <p className="font-roboto font-normal text-[14px] leading-[21px] text-[#99A1AF]">
              john.doe@example.com
            </p>
          </div>
        </motion.div>

        {/* Credits Dashboard (Available Credits: 120) */}
        <section className="w-full max-w-full sm:max-w-[393px] mb-8">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="w-full h-[90px] bg-white/5 border border-white/10 rounded-[14px] shadow-lg flex items-center justify-between px-5"
           >
             <div className="flex items-center gap-4">
               <div className="w-[42px] h-[42px] rounded-xl bg-figma-gradient flex items-center justify-center">
                 <Wallet className="w-5 h-5 text-white" />
               </div>
               <div className="flex flex-col">
                 <span className="font-roboto font-normal text-[12px] leading-[18px] text-[#99A1AF]">
                   Available Credits
                 </span>
                 <span className="font-roboto font-bold text-[21px] leading-[28px] text-white">
                   120
                 </span>
               </div>
             </div>
             
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="h-[35px] px-5 bg-figma-gradient rounded-[12px] flex items-center justify-center"
             >
               <span className="font-roboto font-semibold text-sm text-white">
                 Buy More
               </span>
             </motion.button>
           </motion.div>
        </section>

        {/* Stats Grid (Projects & Images) */}
        <section className="w-full max-w-full sm:max-w-[393px] grid grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="h-[108px] bg-white/5 border border-white/10 rounded-[14px] flex flex-col items-center justify-center gap-2"
          >
            <FolderKanban className="w-6 h-6 text-[#23A1FF]" />
            <span className="font-roboto font-bold text-[21px] text-white">42</span>
            <span className="font-roboto font-normal text-[12px] text-[#99A1AF]">
              Projects Created
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="h-[108px] bg-white/5 border border-white/10 rounded-[14px] flex flex-col items-center justify-center gap-2"
          >
            <Images className="w-6 h-6 text-[#AD46FF]" />
            <span className="font-roboto font-bold text-[21px] text-white">156</span>
            <span className="font-roboto font-normal text-[12px] text-[#99A1AF]">
              Images Generated
            </span>
          </motion.div>
        </section>

        {/* Options List (Settings, Logout) */}
        <section className="w-full max-w-full sm:max-w-[393px] flex flex-col gap-4">
          {[
            { label: "Settings", icon: Settings },
            { label: "Logout", icon: LogOut, danger: true },
          ].map((option, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-[86px] bg-white/5 border border-white/10 rounded-[14px] flex items-center px-5 gap-4 group transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10">
                <option.icon className={`w-5 h-5 ${option.danger ? "text-red-400" : "text-white"}`} />
              </div>
              <span className={`font-roboto font-normal text-[14px] ${option.danger ? "text-red-400" : "text-white"}`}>
                {option.label}
              </span>
            </motion.button>
          ))}
        </section>

        {/* Desktop Footer (Hidden on Mobile) */}
        <div className="w-full mt-20 hidden lg:block">
          <Footer />
        </div>
        <div className="h-[120px] lg:hidden" />
      </main>

      {/* Global Bottom Nav (Mobile Only) */}
      <BottomNav />
    </div>
  );
}
