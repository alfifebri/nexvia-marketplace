"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ProductGallery({ product }: { product: { images: string[]; title: string; discountPercentage: number; isFeatured: boolean } }) {
  const images = product.images.length > 0 ? product.images : [""];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse sm:gap-4">
      <div className="group relative flex-1 overflow-hidden rounded-2xl border border-border bg-muted">
        <div className="relative aspect-square">
          <ProductImage
            key={images[active]}
            src={images[active]}
            alt={`${product.title} — view ${active + 1}`}
            className="size-full"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            imageClassName="transition-transform duration-500 group-hover:scale-125"
          />
        </div>
        <div className="pointer-events-none absolute left-4 top-4 flex gap-2">
          {product.discountPercentage > 0 && <Badge variant="coral">−{product.discountPercentage}%</Badge>}
          {product.isFeatured && <Badge variant="glass">Editor&apos;s pick</Badge>}
        </div>
        <span className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1.5 text-[0.6rem] font-medium text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
          <Maximize2 className="size-3" /> Hover to zoom
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 sm:w-20 sm:flex-col sm:overflow-visible sm:pb-0">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            onClick={() => setActive(index)}
            className={cn(
              "relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:w-full",
              index === active
                ? "border-foreground"
                : "border-transparent opacity-60 hover:opacity-100",
            )}
            aria-label={`View image ${index + 1}`}
            aria-pressed={index === active}
          >
            <ProductImage src={image} alt={`${product.title} thumbnail ${index + 1}`} className="size-full" sizes="80px" />
          </button>
        ))}
      </div>
    </div>
  );
}
