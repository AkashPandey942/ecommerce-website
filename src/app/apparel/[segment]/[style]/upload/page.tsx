// src/app/apparel/[segment]/[style]/upload/page.tsx
"use client";

import FlowHeader from "@/components/FlowHeader";
import ProgressStepper from "@/components/ProgressStepper";
import Footer from "@/components/Footer";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import LoadingActionButton from "@/components/LoadingActionButton";
import { Skeleton } from "@/components/ui/Skeleton";
import ProductTag from "@/components/ProductTag";

// Services & Context
import { useAuth } from "@/context/AuthContext";
import { useGeneration } from "@/context/GenerationContext";
import { storageService } from "@/services/storageService";

// Dynamic components
const UploadZone = dynamic(() => import("@/components/UploadZone"), { 
  ssr: false, 
  loading: () => <Skeleton className="w-full h-[240px] rounded-2xl" /> 
});
const ModelScroll = dynamic(() => import("@/components/ModelScroll"), { 
  ssr: false, 
  loading: () => <Skeleton className="w-full h-[170px] rounded-xl" /> 
});
const BackgroundGrid = dynamic(() => import("@/components/BackgroundGrid"), { 
  ssr: false, 
  loading: () => <div className="grid grid-cols-2 gap-4"><Skeleton className="h-[100px]" /><Skeleton className="h-[100px]" /></div> 
});
const AIDirectorNotes = dynamic(() => import("@/components/AIDirectorNotes"), { ssr: false });
const SelectionPreviewModal = dynamic(() => import("@/components/SelectionPreviewModal"), { ssr: false });

export default function UnifiedUploadSetupPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { 
    selectionState, 
    updateSelection, 
    rawFile, 
    setRawFile, 
    setUploadedImageUrl 
  } = useGeneration();

  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "ethnic-wear";

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Selection states (for shorthand/readability)
  const { modelId, backgroundId, styleId, prompt } = selectionState;
  
  // Preview States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const outputStyles = ["Catalog", "Premium", "Social Media", "Lifestyle"];

  const handleModelSelect = (model: { id: string; image: string }) => {
    updateSelection({ modelId: modelId === model.id ? null : model.id });
  };

  const handleModelPreview = (model: { id: string; image: string }) => {
    setPreviewImage(model.image);
    setIsPreviewOpen(true);
  };

  const handleBackgroundSelect = (bg: { title: string; image: string }) => {
    updateSelection({ backgroundId: backgroundId === bg.title ? null : bg.title });
  };

  const handleBackgroundPreview = (bg: { title: string; image: string }) => {
    setPreviewImage(bg.image);
    setIsPreviewOpen(true);
  };

  const handleGenerate = async () => {
    if (!user) {
      setError("Please sign in to generate images.");
      return;
    }
    if (!rawFile || !modelId || !backgroundId || !styleId) {
      setError("Please complete all selections including an image.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 1. Upload Image to Storage
      const imageUrl = await storageService.uploadGarment(user.uid, rawFile);
      setUploadedImageUrl(imageUrl);

      // 2. Call the server-side API to create the job + trigger RunComfy
      //    (generationService runs only on the server via this route)
      const apiResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garmentImageUrl: imageUrl,
          modelId,
          background: backgroundId,
          style: styleId,
          prompt,
        }),
      });

      if (!apiResponse.ok) {
        const errData = await apiResponse.json();
        throw new Error(errData.error || "API call failed");
      }

      const { jobId } = await apiResponse.json();

      // 3. Redirect to Result Page
      router.push(`/result/${jobId}`);

    } catch (err: any) {
      console.error("❌ [Generate Flow] Error:", err);
      setError(err.message || "Failed to start generation. Try again.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Upload Product" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col">
        <ProgressStepper currentStep={5} />

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-12 mt-10 mb-20">
          {/* 1. Upload Product Image Section */}
          <section aria-labelledby="upload-section-title">
            <div className="mb-6">
              <h1 id="upload-section-title" className="font-roboto font-semibold text-2xl text-white mb-2">Upload Product</h1>
              <p className="text-sm text-[#99A1AF]">Upload a clear photo of your product (Must be {style}).</p>
            </div>
            <UploadZone onFileSelect={(file) => setRawFile(file)} />
          </section>

          {/* 2. Select Model Section */}
          <section aria-labelledby="model-section-title">
            <h2 id="model-section-title" className="font-roboto font-semibold text-xl text-white mb-6">Select Model</h2>
            <div className="-mx-5 px-5">
              <ModelScroll 
                selectedId={modelId} 
                onSelect={handleModelSelect} 
                onPreview={handleModelPreview}
              />
            </div>
          </section>

          {/* 3. Background Style Section */}
          <section aria-labelledby="bg-section-title">
            <h2 id="bg-section-title" className="font-roboto font-semibold text-xl text-white mb-6">Background Style</h2>
            <BackgroundGrid 
              selectedTitle={backgroundId} 
              onSelect={handleBackgroundSelect}
              onPreview={handleBackgroundPreview}
            />
          </section>

          {/* 4. Output Style Section */}
          <section aria-labelledby="output-section-title">
            <h2 id="output-section-title" className="font-roboto font-semibold text-xl text-white mb-6">Output Style</h2>
            <div className="flex flex-wrap gap-3">
              {outputStyles.map((item) => (
                <ProductTag 
                  key={item}
                  label={item}
                  selected={styleId === item}
                  onClick={() => updateSelection({ styleId: styleId === item ? null : item })}
                />
              ))}
            </div>
          </section>

          {/* 5. AI Director Notes Section */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="font-roboto font-semibold text-xl text-white">AI Director Notes</h2>
              <span className="text-xs text-[#C5B6DE] uppercase tracking-wider">(Optional)</span>
            </div>
            <AIDirectorNotes 
              value={prompt} 
              onChange={(val) => updateSelection({ prompt: val })} 
            />
          </section>
        </div>

        {/* Generate Button Area */}
        <div className="mb-10 lg:mb-16">
          <div className="w-full max-w-full sm:max-w-[353px] mx-auto lg:max-w-[400px]">
            <LoadingActionButton
              isLoading={isGenerating}
              onClick={handleGenerate}
              disabled={isGenerating || !rawFile || !modelId || !backgroundId || !styleId}
              className="w-full h-[61px] text-[18px]"
            >
              {isGenerating ? "Generation Started..." : "Generate Prime Image"}
            </LoadingActionButton>
          </div>
        </div>
      </main>

      <Footer />

      <SelectionPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        image={previewImage}
      />
    </div>
  );
}
