"use client";

import ApparelHeader from "@/components/ApparelHeader";
import ProgressStepper from "@/components/ProgressStepper";
import SegmentCard from "@/components/SegmentCard";
import ProductScroll from "@/components/ProductScroll";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const JEWELLERY_SEGMENTS = [
  { title: "Bridal", image: "/indian-bride-9-2025-12-2fd0a5885b204639c8156089c6d2ebad-16x9.avif", fullWidth: false },
  { title: "Fashion", image: "/elegant-woman-showcasing-silver-necklace-with-vibrant-amethyst-aquamarine-stones-set-against-deep-background-dramatic-effect.jpg", fullWidth: false },
  { title: "Traditional / Vintage", image: "/young-indian-woman-wearing-sari.jpg", fullWidth: false },
  { title: "Daily Wear / Minimal", image: "/WhatsApp Image 2026-04-07 at 3.28.31 PM.jpeg", fullWidth: false },
  { title: "Custom / Other", image: "/hero_image.png", fullWidth: true },
];

export default function JewelleryPage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <ApparelHeader title="Select Jewellery" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[105px] px-5">
        <div className="mb-2">
          <ProgressStepper />
        </div>

        {/* Heading Section */}
        <section className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-roboto font-semibold text-[28px] lg:text-[36px] leading-tight lg:leading-[45px] tracking-[-0.9px] text-[#E2E2E8] mb-2">
              Select Jewellery
            </h1>
            <p className="font-roboto font-normal text-sm lg:text-base leading-[19px] text-[#C2C6D6]">
              Choose the target audience for your product
            </p>
          </motion.div>
        </section>

        <section className="mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {JEWELLERY_SEGMENTS.map((segment, idx) => (
              <motion.div 
                key={idx} 
                className={`${segment.fullWidth ? "col-span-2 lg:col-span-2 xl:col-span-1" : "col-span-1"}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={`/jewellery/${segment.title.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-')}/style`}>
                  <SegmentCard 
                    title={segment.title} 
                    image={segment.image} 
                    fullWidth={segment.fullWidth} 
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white">
              Trending in AI Editorial
            </h2>
            
            <Link href="/gallery">
              <button className="flex items-center justify-center px-[10px] py-[5px] h-6 bg-black/30 shadow-[2px_2px_2px_rgba(0,0,0,0.54)] rounded-full group">
                <span className="font-roboto font-medium text-[12px] leading-[14px] text-center uppercase text-figma-gradient group-hover:scale-105 transition-transform">
                  See gallery
                </span>
              </button>
            </Link>
          </div>

          <div className="-mx-5">
            <ProductScroll />
          </div>
        </section>

        <Footer />
        <div className="h-[120px] lg:hidden" />
      </main>
    </div>
  );
}
