"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Heart, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { ProductImage } from "@/components/ui/product-image";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { cn } from "@/lib/utils";

const NOW = Date.now();

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
  compact?: boolean;
}

export function ProductCard({ product, priority = false, className, compact = false }: ProductCardProps) {
  const addLine = useCartStore((state) => state.addLine);
  const wishlisted = useWishlistStore((state) => state.ids.includes(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const [added, setAdded] = useState(false);

  const option = product.variants[0]?.options.find((item) => (item.stock ?? 1) > 0) ?? product.variants[0]?.options[0];
  const variant = option ? { [product.variants[0].name.toLowerCase()]: option.value } : undefined;
  const variantLabel = option ? option.label : undefined;
  const price = product.price + (option?.priceDelta ?? 0);
  const stock = Math.min(product.stock, option?.stock ?? product.stock);
  const isNew = NOW - new Date(product.createdAt).getTime() < 45 * 24 * 60 * 60 * 1000;

  const handleAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (stock <= 0) {
      toast.error("This variant is sold out.");
      return;
    }
    addLine(
      {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        thumbnail: product.thumbnail,
        price,
        currency: product.currency,
        quantity: 1,
        stock,
        vendorId: product.vendorId,
        storeId: product.storeId,
        storeName: product.storeName,
        variant,
        variantLabel,
      },
      1,
    );
    setAdded(true);
    toast.success("Added to cart", { description: product.title });
    window.setTimeout(() => setAdded(false), 1600);
  };

  const handleWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const nowSaved = toggleWishlist(product.id);
    toast.success(nowSaved ? "Saved to wishlist" : "Removed from wishlist", {
      description: product.title,
    });
  };

  return (
    <article className={cn("group relative", className)}>
      <Link href={`/products/${product.slug}`} className="block focus-visible:outline-none">
        <div className="relative overflow-hidden rounded-2xl bg-muted">
          <ProductImage
            src={product.thumbnail}
            alt={product.title}
            className={cn("w-full", compact ? "aspect-square" : "aspect-[4/5]")}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            hoverZoom
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.discountPercentage > 0 && (
              <Badge variant="coral" className="shadow-sm">
                −{product.discountPercentage}%
              </Badge>
            )}
            {isNew && !product.compareAtPrice && (
              <Badge variant="glass" className="shadow-sm">
                New
              </Badge>
            )}
            {product.stock === 0 && <Badge variant="muted">Sold out</Badge>}
          </div>

          <button
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={wishlisted}
            className={cn(
              "absolute right-3 top-3 grid size-9 place-items-center rounded-full border backdrop-blur-md transition-all duration-300",
              wishlisted
                ? "border-coral/30 bg-coral text-white"
                : "border-white/40 bg-white/25 text-white hover:bg-white/40",
            )}
          >
            <Heart className={cn("size-4", wishlisted && "fill-current")} />
          </button>

          <button
            onClick={handleAdd}
            disabled={stock <= 0}
            className={cn(
              "absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-float transition-all duration-300",
              "translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 disabled:hidden",
            )}
            aria-label={`Add ${product.title} to cart`}
          >
            {added ? <Check className="size-4" /> : <Plus className="size-4" />}
          </button>

          {stock > 0 && stock <= 8 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[0.6rem] font-semibold text-white backdrop-blur-md">
              Only {stock} left
            </span>
          )}
        </div>

        <div className="space-y-1.5 pt-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {product.brand}
            </p>
            <Rating value={product.rating.rate} size="xs" showValue={false} className="shrink-0" />
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight transition-colors group-hover:text-foreground/80">
            {product.title}
          </h3>
          <div className="flex items-end justify-between gap-2">
            <Price price={price} compareAt={product.compareAtPrice} currency={product.currency} size="sm" />
            {product.variants[0] && (
              <div className="flex items-center gap-1 pb-0.5">
                {product.variants[0].options.slice(0, 3).map((item) =>
                  item.swatch ? (
                    <span
                      key={item.value}
                      className="size-3 rounded-full border border-border"
                      style={{ backgroundColor: item.swatch }}
                      title={item.label}
                    />
                  ) : null,
                )}
              </div>
            )}
          </div>
          {!compact && (
            <p className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
              <ShoppingBag className="size-3" /> {product.storeName}
              <span className="text-border">·</span>
              <span>{product.rating.count.toLocaleString()} reviews</span>
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
