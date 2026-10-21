"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock3, Star } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/components/ui/product-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoProducts } from "@/lib/demo/products";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";

const pad = (value: number) => String(Math.max(0, value)).padStart(2, "0");
const DEAL_ENDS_AT = Date.now() + 1000 * 60 * 60 * 74 + 1000 * 60 * 42;

export function DealOfWeek() {
  const product = demoProducts[0];
  const addLine = useCartStore((state) => state.addLine);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, DEAL_ENDS_AT - Date.now()));
    const timeout = window.setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const days = remaining ? Math.floor(remaining / 86_400_000) : 0;
  const hours = remaining ? Math.floor((remaining % 86_400_000) / 3_600_000) : 0;
  const minutes = remaining ? Math.floor((remaining % 3_600_000) / 60_000) : 0;
  const seconds = remaining ? Math.floor((remaining % 60_000) / 1000) : 0;

  return (
    <section className="container-page section-pad">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#0c1512] text-white lg:rounded-[2.75rem]">
        <div className="absolute inset-0 grid-overlay opacity-[0.14]" aria-hidden />
        <div
          className="pointer-events-none absolute -left-20 top-1/2 size-[420px] -translate-y-1/2 rounded-full bg-accent/20 blur-[100px]"
          aria-hidden
        />
        <div className="relative grid lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="accent">Deal of the week</Badge>
              <span className="flex items-center gap-1.5 text-[0.68rem] font-medium text-white/60">
                <Clock3 className="size-3.5" /> Ends soon
              </span>
            </div>

            <h2 className="mt-5 text-3xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-4xl lg:text-[3.3rem]">
              Arc One.
              <br />
              <span className="font-display font-normal italic text-accent">Quietly brilliant.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65">
              Adaptive noise cancelling, 40 hours of playback, and earpads you can actually replace.
              This week only, 17% off in all three finishes.
            </p>

            <div className="mt-7 flex items-end gap-3">
              <span className="text-3xl font-semibold tracking-tight">{formatCurrency(product.price)}</span>
              <span className="pb-1 text-sm text-white/40 line-through">
                {formatCurrency(product.compareAtPrice ?? 0)}
              </span>
              <span className="mb-1.5 rounded-full bg-coral px-2 py-0.5 text-[0.62rem] font-bold">
                SAVE {formatCurrency((product.compareAtPrice ?? 0) - product.price)}
              </span>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-2.5" aria-label="Offer countdown">
              {[
                { label: "Days", value: days },
                { label: "Hrs", value: hours },
                { label: "Min", value: minutes },
                { label: "Sec", value: seconds },
              ].map((unit, index) => (
                <div key={unit.label} className="flex items-center gap-2.5">
                  <div className="min-w-14 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-center backdrop-blur-md">
                    <p className="text-xl font-semibold tabular-nums">{remaining ? pad(unit.value) : "--"}</p>
                    <p className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-white/45">
                      {unit.label}
                    </p>
                  </div>
                  {index < 3 && <span className="text-white/20">:</span>}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
              <Button
                size="lg"
                variant="accent"
                onClick={() => {
                  addLine(
                    {
                      productId: product.id,
                      slug: product.slug,
                      title: product.title,
                      thumbnail: product.thumbnail,
                      price: product.price,
                      currency: product.currency,
                      quantity: 1,
                      stock: product.stock,
                      vendorId: product.vendorId,
                      storeId: product.storeId,
                      storeName: product.storeName,
                      variant: { color: "midnight" },
                      variantLabel: "Midnight",
                    },
                    1,
                  );
                  toast.success("Arc One added to cart");
                }}
              >
                Add to cart <ArrowRight className="size-4" />
              </Button>
              <Button asChild size="lg" variant="glass">
                <Link href={`/products/${product.slug}`}>View details</Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[300px] lg:min-h-[440px]">
            <ProductImage
              src={product.images[1] ?? product.thumbnail}
              alt={product.title}
              className="absolute inset-0 size-full"
              sizes="(max-width: 1024px) 100vw, 45vw"
              imageClassName="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c1512] via-transparent to-transparent lg:bg-gradient-to-r" />
            <div className="absolute right-5 top-5 rounded-2xl border border-white/15 bg-black/25 p-4 backdrop-blur-md">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-1.5 text-xs font-semibold">4.8 / 5</p>
              <p className="text-[0.62rem] text-white/60">1,284 verified reviews</p>
            </div>
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-black/25 px-4 py-3 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.14em] text-white/50">Vendor</p>
                  <p className="text-sm font-semibold">Nova Audio · Copenhagen</p>
                </div>
                <Badge variant="glass">Verified</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
