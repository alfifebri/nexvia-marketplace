"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Globe,
  Instagram,
  MapPin,
  Package,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMounted } from "@/hooks/use-mounted";
import { useDemoStore } from "@/stores/demo-store";
import { formatDate, formatNumber } from "@/lib/utils";

type Sort = "featured" | "newest" | "price-asc" | "price-desc" | "rating";

export function VendorStoreView({ slug }: { slug: string }) {
  const mounted = useMounted();
  const vendors = useDemoStore((state) => state.vendors);
  const allProducts = useDemoStore((state) => state.products);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<Sort>("featured");

  const vendor = vendors.find((item) => item.slug === slug);
  const products = useMemo(
    () => allProducts.filter((product) => product.storeId === vendor?.id && product.status === "active"),
    [allProducts, vendor?.id],
  );

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((product) => map.set(product.category, product.categoryLabel));
    return Array.from(map.entries());
  }, [products]);

  const list = useMemo(() => {
    const filtered = category === "all" ? products : products.filter((product) => product.category === category);
    const sorted = [...filtered];
    switch (sort) {
      case "newest":
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => b.rating.rate - a.rating.rate);
      default:
        return sorted.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }
  }, [products, category, sort]);

  if (!mounted) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-56 rounded-3xl" />
        <Skeleton className="mt-6 h-8 w-64" />
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!vendor || vendor.status !== "active") {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <Package className="size-8 text-muted-foreground/50" />
        <h1 className="mt-4 text-2xl font-semibold">This storefront is closed</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The studio may be on a break, or the link has moved. The rest of the directory is still open.
        </p>
        <div className="mt-5 flex gap-2">
          <Button asChild><Link href="/vendors">Browse makers</Link></Button>
          <Button asChild variant="outline"><Link href="/products">Shop all</Link></Button>
        </div>
      </div>
    );
  }

  const location = vendor.address?.city
    ? [vendor.address.city, vendor.address.country].filter(Boolean).join(", ")
    : "Independent studio";
  const sold = allProducts
    .filter((product) => product.storeId === vendor.id)
    .reduce((sum, product) => sum + product.soldCount, 0);

  return (
    <div className="container-page py-6 lg:py-8">
      <Link
        href="/vendors"
        className="inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All makers
      </Link>

      <div className="relative mt-4 overflow-hidden rounded-3xl border border-border bg-muted">
        <div className="relative h-48 sm:h-64 lg:h-72">
          <ProductImage
            src={vendor.banner}
            alt={`${vendor.name} studio`}
            className="size-full"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 text-white sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div className="flex items-end gap-4">
            <ProductImage
              src={vendor.logo}
              alt={vendor.name}
              className="size-16 rounded-2xl border-2 border-white/70 shadow-lg sm:size-20"
              sizes="80px"
            />
            <div className="pb-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">{vendor.name}</h1>
                {vendor.isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[0.58rem] font-semibold backdrop-blur-md">
                    <BadgeCheck className="size-3 text-accent" /> Vetted
                  </span>
                )}
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.65rem] text-white/65">
                <span className="flex items-center gap-1"><MapPin className="size-3" /> {location}</span>
                <span className="flex items-center gap-1"><CalendarDays className="size-3" /> Joined {formatDate(vendor.createdAt, { month: "short", year: "numeric" })}</span>
                <span className="flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" /> {vendor.rating.average.toFixed(1)} ({vendor.rating.count})</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {vendor.socials?.website && (
              <Button variant="glass" size="sm" asChild>
                <a href={vendor.socials.website} target="_blank" rel="noreferrer">
                  <Globe className="size-3.5" /> Website
                </a>
              </Button>
            )}
            {vendor.socials?.instagram && (
              <Button variant="glass" size="sm" asChild>
                <a
                  href={`https://instagram.com/${vendor.socials.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Instagram className="size-3.5" /> Instagram
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
        <div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{vendor.description}</p>

          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {[
              { value: formatNumber(products.length), label: "Objects" },
              { value: formatNumber(sold), label: "Sold" },
              { value: `${vendor.rating.average.toFixed(1)} ★`, label: "Store rating" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-3 text-center">
                <p className="text-lg font-semibold tracking-tight">{stat.value}</p>
                <p className="text-[0.58rem] uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setCategory("all")}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[0.65rem] font-medium transition-colors ${
                  category === "all"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {categories.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setCategory(value)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[0.65rem] font-medium transition-colors ${
                    category === value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Select value={sort} onValueChange={(value) => setSort(value as Sort)}>
              <SelectTrigger className="h-9 w-[160px] rounded-full text-[0.65rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="rating">Top rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {list.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={Package}
                title="No objects in this category"
                description="Try another category or view the full catalogue."
                action={
                  <Button variant="outline" size="sm" onClick={() => setCategory("all")}>
                    Show everything
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3">
              {list.map((item: Product) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-3 lg:sticky lg:top-28">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <ShieldCheck className="size-3.5" /> Store policies
            </p>
            <div className="mt-3 space-y-3 text-[0.68rem] leading-relaxed text-muted-foreground">
              <div className="flex gap-2.5">
                <Truck className="mt-0.5 size-3.5 shrink-0" />
                <p>{vendor.policies?.shipping ?? "Ships within 2 business days."}</p>
              </div>
              <div className="flex gap-2.5">
                <RotateCcw className="mt-0.5 size-3.5 shrink-0" />
                <p>{vendor.policies?.returns ?? "Returns accepted within 30 days."}</p>
              </div>
              <div className="flex gap-2.5">
                <Package className="mt-0.5 size-3.5 shrink-0" />
                <p>
                  Free shipping over {formatCurrencyThreshold(vendor.settings.freeShippingThreshold)}.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Studio details
            </p>
            <div className="mt-3 space-y-2 text-[0.68rem]">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Products sold</span>
                <span className="font-medium">{formatNumber(sold)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Rating</span>
                <span className="flex items-center gap-1 font-medium">
                  {vendor.rating.average.toFixed(1)} <Star className="size-3 fill-amber-400 text-amber-400" />
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Reviews</span>
                <span className="font-medium">{formatNumber(vendor.rating.count)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Commission tier</span>
                <span className="font-medium">{vendor.settings.commissionRate}%</span>
              </div>
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-[0.6rem] leading-relaxed text-muted-foreground">
                “{vendor.name}” has been vetted by the Nexvia curation team. Every order is buyer-protected.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-border p-4 text-center">
            <p className="text-[0.62rem] font-semibold">Have a question?</p>
            <p className="mt-1 text-[0.6rem] text-muted-foreground">
              Our concierge coordinates directly with the studio.
            </p>
            <Button asChild variant="ghost" size="sm" className="mt-2">
              <Link href="/support#contact">Ask Nexvia</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function formatCurrencyThreshold(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}
