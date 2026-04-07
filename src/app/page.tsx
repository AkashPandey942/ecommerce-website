"use client";

import ApparelHeader from "@/components/ApparelHeader";
import BottomNav from "@/components/BottomNav";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import ProductScroll from "@/components/ProductScroll";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Shirt, Gem, Watch, Package } from "lucide-react";
import { JewelleryOverlaySVG } from "@/components/JewelleryOverlaySVG";

export default function Home() {
  const categories = [
    { title: "Apparel", icon: Shirt, image: "/category_placeholder.png" },
    { title: "Jewellery", icon: Gem, image: "/category_placeholder.png", svgOverlay: <JewelleryOverlaySVG /> },
    { title: "Accessories", icon: Watch, image: "/category_placeholder.png" },
    { title: "Products", icon: Package, image: "/category_placeholder.png" },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 pb-[120px] lg:pb-0">
      <ApparelHeader title=" " />
      
      <main className="w-full max-w-none mx-auto overflow-hidden">
        {/* Hero Section */}
        <Hero />

        {/* Creative Hubs Area */}
        <section className="px-5 mb-10 w-full max-w-7xl mx-auto">
          <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white mb-5">
            Creative Hubs
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, idx) => (
              cat.title === "Apparel" ? (
                <Link href="/apparel" key={idx}>
                  <CategoryCard 
                    title={cat.title} 
                    icon={cat.icon} 
                    image={cat.image} 
                    svgOverlay={cat.svgOverlay}
                  />
                </Link>
              ) : (
                <CategoryCard 
                  key={idx} 
                  title={cat.title} 
                  icon={cat.icon} 
                  image={cat.image} 
                  svgOverlay={cat.svgOverlay}
                />
              )
            ))}
          </div>
        </section>

        {/* Recent Projects Area (ProductScroll) */}
        <ProductScroll />

        {/* Desktop Footer (fills empty space) */}
        <Footer />
      </main>

      {/* Mobile Bottom Nav — Studio / Gallery / AI Lab / Profile */}
      <BottomNav />
    </div>
  );
}
