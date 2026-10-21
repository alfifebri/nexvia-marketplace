"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { useWishlistProducts } from "@/hooks/queries";
import { useCartStore } from "@/stores/cart-store";

export function WishlistView() {
  const products = useWishlistProducts();
  const addLine = useCartStore((state) => state.addLine);

  const addAll = () => {
    let added = 0;
    for (const product of products) {
      if (product.stock <= 0) continue;
      const option = product.variants[0]?.options.find((item) => (item.stock ?? 1) > 0);
      addLine({
        productId: product.id,
        slug: product.slug,
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price + (option?.priceDelta ?? 0),
        currency: product.currency,
        quantity: 1,
        stock: Math.min(product.stock, option?.stock ?? product.stock),
        vendorId: product.vendorId,
        storeId: product.storeId,
        storeName: product.storeName,
        variant: option ? { [product.variants[0].name.toLowerCase()]: option.value } : undefined,
        variantLabel: option?.label,
      });
      added += 1;
    }
    if (added === 0) {
      toast.error("Nothing in your wishlist is in stock right now.");
      return;
    }
    toast.success(`${added} ${added === 1 ? "piece" : "pieces"} added to cart`);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Saved for later
          </p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold tracking-[-0.04em]">
            Wishlist
            {products.length > 0 && (
              <span className="text-base font-normal text-muted-foreground">({products.length})</span>
            )}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            The pieces you keep coming back to. Prices update automatically.
          </p>
        </div>
        {products.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/products">Add more</Link>
            </Button>
            <Button size="sm" onClick={addAll}>
              <ShoppingBag className="size-3.5" /> Add all to cart
            </Button>
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-card p-10 text-center sm:p-14">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-coral/10 text-coral">
            <Heart className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Nothing saved yet</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
            Tap the heart on any product and it will wait here — across devices, whenever you&apos;re ready.
          </p>
          <Button asChild className="mt-5">
            <Link href="/products">Find something worth keeping</Link>
          </Button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.62rem] text-muted-foreground">
            <Sparkles className="size-3" /> Wishlist prices include member-only drops
          </p>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
