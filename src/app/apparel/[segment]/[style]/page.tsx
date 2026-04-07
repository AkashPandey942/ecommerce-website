"use client";

import ApparelHeader from "@/components/ApparelHeader";
import ProgressStepper from "@/components/ProgressStepper";
import ProductHero from "@/components/ProductHero";
import ProductTag from "@/components/ProductTag";
import Footer from "@/components/Footer";
import { useParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProductSelectionPage() {
  const params = useParams();
  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "Ethnic Wear";
  
  const [selectedTag, setSelectedTag] = useState<string>("Saree");

  const tags = [
    "Saree", "Lehenga", "Suit", "Kurti", "Anarkali", 
    "Sharara", "Gown", "Ethnic Set", "Bottoms"
  ];

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 pb-[120px] lg:pb-0">
      <ApparelHeader title="Select Product" />

      <main className="w-full flex-1 max-w-lg lg:max-w-7xl mx-auto pt-[120px] px-5 overflow-hidden">
        {/* Step 3 in progress */}
        <ProgressStepper currentStep={3} />

        {/* Featured Product Hero (Component 1) */}
        <section className="mt-8">
          <ProductHero image="/hero_image.png" />
        </section>

        {/* Product Type Tags Section */}
        <section className="mt-12 mb-10">
          <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white mb-6">
            Choose Product Type
          </h2>
          
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <ProductTag 
                key={tag} 
                label={tag} 
                selected={selectedTag === tag}
                onClick={() => setSelectedTag(tag)}
              />
            ))}
          </div>
        </section>

        {/* Responsive Continue Button */}
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent z-50 lg:static lg:bg-none lg:p-0 lg:mt-12 lg:mb-16">
          <div className="max-w-lg mx-auto lg:max-w-[400px]">
            <Link href={`/apparel/${segment}/${style}/upload`}>
              <button className="w-full h-[61px] bg-figma-gradient rounded-full shadow-[0_0_30px_rgba(124,77,255,0.4)] hover:brightness-110 transition-all flex items-center justify-center">
                <span className="font-roboto font-semibold text-lg leading-[21px] text-white text-center">
                  Continue
                </span>
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Desktop Footer */}
      <Footer />
    </div>
  );
}
