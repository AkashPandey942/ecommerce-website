"use client";

import FlowHeader from "@/components/FlowHeader";
import BottomNav from "@/components/BottomNav";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import RecentlyVisited from "@/components/RecentlyVisited";
import Link from "next/link";
import { Shirt, Gem, Watch, Package } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { CardSkeleton } from "@/components/ui/Skeleton";

import ProductScroll from "@/components/ProductScroll";
import Footer from "@/components/Footer";

// Performance Optimization: Defer only truly browser-specific heavy components
const JewelleryOverlaySVG = dynamic(() => import("@/components/JewelleryOverlaySVG").then(mod => mod.JewelleryOverlaySVG), { ssr: false });

export default function Home() {
  const categories = [
    { title: "Apparel", icon: Shirt, image: "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg" },
    { title: "Jewellery", icon: Gem, image: "/home_jewellery.png" },
    { title: "Accessories", icon: Watch, image: "/home_accessories.png" },
    { title: "Products", icon: Package, image: "/home_products.png" },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0">
      <FlowHeader title=" " />
      
      <main className="w-full max-w-none mx-auto">
        {/* Hero Section */}
        <Hero />

        {/* SaaS Rule 6.1: Recent branch shortcut */}
        <RecentlyVisited />

        {/* Creative Hubs Area */}
        <section className="px-5 mb-10 w-full max-w-7xl mx-auto">
          <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white mb-5">
            Creative Hubs
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, idx) => (
              <Link 
                href={
                  cat.title === "Apparel" ? "/apparel" : 
                  cat.title === "Jewellery" ? "/jewellery" : 
                  cat.title === "Accessories" ? "/accessories" :
                  cat.title === "Products" ? "/products" : "#"
                } 
                key={idx}
              >
                <CategoryCard 
                  title={cat.title} 
                  icon={cat.icon} 
                  image={cat.image} 
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Projects Area (ProductScroll) */}
        <ProductScroll />

        {/* Desktop Footer (fills empty space) */}
        <Footer />
        <div className="h-[120px] lg:hidden" />
      </main>

      {/* Mobile Bottom Nav — Studio / Gallery / AI Lab / Profile */}
      <BottomNav />
    </div>
  );
}
