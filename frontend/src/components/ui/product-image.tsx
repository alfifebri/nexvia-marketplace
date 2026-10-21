"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  hoverZoom?: boolean;
}

export function ProductImage({
  src,
  alt,
  className,
  imageClassName,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  priority = false,
  hoverZoom = false,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {src && !failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className={cn(
            "object-cover transition-transform duration-700 ease-out",
            hoverZoom && "group-hover:scale-[1.06]",
            imageClassName,
          )}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-muted via-secondary/60 to-muted">
          <div className="flex flex-col items-center gap-2 text-muted-foreground/60">
            <ImageOff className="size-7" />
            <span className="px-4 text-center text-[0.65rem] font-medium uppercase tracking-[0.16em]">
              {alt.slice(0, 32)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
