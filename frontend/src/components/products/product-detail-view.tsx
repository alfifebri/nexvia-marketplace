"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Heart,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { ProductGallery } from "@/components/products/product-gallery";
import { ProductCard } from "@/components/products/product-card";
import { ReviewSection } from "@/components/products/review-section";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { ProductImage } from "@/components/ui/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useProduct, useRelated } from "@/hooks/queries";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { demoVendors } from "@/lib/demo/vendors";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";

function DetailSkeleton() {
  return (
    <div className="container-page py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailView({ slug }: { slug: string }) {
  const { data: product, isLoading } = useProduct(slug);
  const related = useRelated(product, 4);
  const router = useRouter();
  const addLine = useCartStore((state) => state.addLine);
  const wishlisted = useWishlistStore((state) => (product ? state.ids.includes(product.id) : false));
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>({});

  const selections = useMemo(() => {
    if (!product) return {};
    const result: Record<string, string> = {};
    for (const group of product.variants) {
      const chosen = group.options.find((option) => option.value === selected[group.name]);
      const available = group.options.find((option) => (option.stock ?? 1) > 0) ?? group.options[0];
      const value = chosen?.value ?? available?.value;
      if (value) result[group.name] = value;
    }
    return result;
  }, [product, selected]);

  const variantInfo = useMemo(() => {
    if (!product) return { price: 0, stock: 0, label: "", variant: undefined as Record<string, string> | undefined };
    let price = product.price;
    let stock = product.stock;
    const labels: string[] = [];
    const variant: Record<string, string> = {};

    for (const group of product.variants) {
      const value = selections[group.name];
      const option = group.options.find((item) => item.value === value);
      if (!option) continue;
      price += option.priceDelta ?? 0;
      stock = Math.min(stock, option.stock ?? stock);
      labels.push(option.label);
      variant[group.name.toLowerCase().replace(/\s+/g, "-")] = option.value;
    }

    return { price, stock, label: labels.join(" / "), variant };
  }, [product, selections]);

  const vendor = useMemo(
    () => demoVendors.find((item) => item.id === product?.storeId || item.ownerId === product?.vendorId),
    [product],
  );

  if (isLoading) return <DetailSkeleton />;

  if (!product) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Package className="size-7" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold">We can&apos;t find that piece</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          It may have sold out or been archived by its maker. The catalogue is still full of good things.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">Back to the catalogue</Link>
        </Button>
      </div>
    );
  }

  const line = {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    thumbnail: product.thumbnail,
    price: variantInfo.price,
    currency: product.currency,
    quantity,
    stock: variantInfo.stock,
    vendorId: product.vendorId,
    storeId: product.storeId,
    storeName: product.storeName,
    variant: variantInfo.variant,
    variantLabel: variantInfo.label,
  };

  const handleAdd = (buyNow = false) => {
    if (variantInfo.stock <= 0) {
      toast.error("That combination is sold out.");
      return;
    }
    addLine(line, quantity);
    if (buyNow) {
      router.push("/checkout");
    } else {
      toast.success("Added to cart", { description: `${quantity} × ${product.title}` });
    }
  };

  const handleWishlist = () => {
    const saved = toggleWishlist(product.id);
    toast.success(saved ? "Saved to wishlist" : "Removed from wishlist");
  };

  return (
    <>
      <div className="container-page pb-28 pt-6 lg:pb-16">
        <nav className="flex flex-wrap items-center gap-1.5 text-[0.68rem] text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="size-3" />
          <Link href="/products" className="hover:text-foreground">Shop</Link>
          <ChevronRight className="size-3" />
          <Link href={`/products?category=${product.category}`} className="hover:text-foreground">
            {product.categoryLabel}
          </Link>
          <ChevronRight className="size-3" />
          <span className="max-w-40 truncate text-foreground sm:max-w-none">{product.title}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery product={product} />

          <div className="lg:pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/products?brand=${encodeURIComponent(product.brand)}`}
                className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground"
              >
                {product.brand}
              </Link>
              <span className="size-1 rounded-full bg-border" />
              <Link
                href={`/vendors/${vendor?.slug ?? ""}`}
                className="flex items-center gap-1 text-[0.65rem] font-medium text-muted-foreground hover:text-foreground"
              >
                <Store className="size-3" /> {product.storeName}
                {vendor?.isVerified && <BadgeCheck className="size-3.5 text-success" />}
              </Link>
            </div>

            <h1 className="mt-3 text-3xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-4xl">
              {product.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{product.subtitle}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Rating value={product.rating.rate} count={product.rating.count} size="sm" />
              <span className="text-[0.65rem] text-muted-foreground">
                <a href="#reviews" className="underline-offset-2 hover:underline">Read reviews</a>
              </span>
              <span className="size-1 rounded-full bg-border" />
              <span className="text-[0.65rem] text-muted-foreground">{formatNumber(product.soldCount)} sold</span>
              {product.isFeatured && <Badge variant="accent">Editor&apos;s pick</Badge>}
            </div>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-y border-border py-5">
              <div>
                <Price
                  price={variantInfo.price}
                  compareAt={product.compareAtPrice}
                  currency={product.currency}
                  size="xl"
                  showDiscount
                />
                <p className="mt-1 text-[0.65rem] text-muted-foreground">
                  Or 4 interest-free payments of {formatCurrency(variantInfo.price / 4)} with{" "}
                  <span className="font-semibold text-foreground">Klarna</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-[0.68rem] font-semibold",
                    variantInfo.stock > 0 ? "text-success" : "text-danger",
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", variantInfo.stock > 0 ? "bg-success" : "bg-danger")} />
                  {variantInfo.stock > 8
                    ? "In stock, ships today"
                    : variantInfo.stock > 0
                      ? `Only ${variantInfo.stock} left`
                      : "Sold out"}
                </span>
                <span className="text-[0.62rem] text-muted-foreground">SKU {product.sku}</span>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description.split(". ")[0]}.</p>

            {product.variants.map((group) => (
              <div key={group.name} className="mt-6">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {group.name}
                  </h2>
                  <span className="text-[0.68rem] text-muted-foreground">
                    {group.options.find((option) => option.value === selections[group.name])?.label}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {group.options.map((option) => {
                    const active = selections[group.name] === option.value;
                    const disabled = (option.stock ?? 1) <= 0;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelected((current) => ({ ...current, [group.name]: option.value }))}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-all",
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-card text-foreground/80 hover:border-foreground/30",
                          disabled && "cursor-not-allowed opacity-35 line-through",
                        )}
                        aria-pressed={active}
                      >
                        {option.swatch && (
                          <span
                            className="size-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: option.swatch }}
                          />
                        )}
                        {option.label}
                        {option.priceDelta ? (
                          <span className={cn("text-[0.62rem]", active ? "text-background/60" : "text-muted-foreground")}>
                            {option.priceDelta > 0 ? "+" : "−"}
                            {formatCurrency(Math.abs(option.priceDelta), product.currency, 0)}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <QuantityStepper value={quantity} onChange={setQuantity} max={Math.max(1, variantInfo.stock)} />
              <Button
                size="lg"
                className="min-w-44 flex-1"
                disabled={variantInfo.stock <= 0}
                onClick={() => handleAdd(false)}
              >
                <ShoppingBag className="size-4" /> Add to cart · {formatCurrency(variantInfo.price * quantity)}
              </Button>
              <Button
                variant="outline"
                size="icon-lg"
                onClick={handleWishlist}
                aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                className={cn(wishlisted && "border-coral/40 text-coral")}
              >
                <Heart className={cn("size-5", wishlisted && "fill-current")} />
              </Button>
            </div>

            <Button
              variant="secondary"
              size="lg"
              className="mt-2.5 w-full"
              disabled={variantInfo.stock <= 0}
              onClick={() => handleAdd(true)}
            >
              Buy now <ArrowRight className="size-4" />
            </Button>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { icon: Truck, title: "Free over $100", text: "3–5 business days" },
                { icon: RefreshCw, title: "30-day returns", text: "No questions asked" },
                { icon: ShieldCheck, title: "2-year warranty", text: "Nexvia-backed" },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-card p-2.5 text-center">
                  <item.icon className="mx-auto size-4 text-muted-foreground" />
                  <p className="mt-1.5 text-[0.62rem] font-semibold">{item.title}</p>
                  <p className="text-[0.55rem] text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-muted/60 p-3.5">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-coral" />
              <p className="text-[0.68rem] leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Transparent split checkout.</span>{" "}
                {product.storeName} receives {formatCurrency(variantInfo.price * 0.88)} of this sale; the
                rest covers platform fees and payment processing via Stripe Connect.
              </p>
            </div>

            <Accordion type="single" collapsible className="mt-5">
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping & delivery</AccordionTrigger>
                <AccordionContent>
                  {product.shippingInformation} Free carbon-neutral shipping on orders over $100.
                  Express delivery available at checkout.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger>Returns & warranty</AccordionTrigger>
                <AccordionContent>
                  {product.returnPolicy} {product.warrantyInformation} Returns are handled by Nexvia with
                  the vendor — no mailing labels to chase.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="details">
                <AccordionTrigger>Materials & care</AccordionTrigger>
                <AccordionContent>
                  Made by {product.storeName}. Clean with a soft, dry cloth. Full material and origin
                  details are listed in the specifications tab.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-10">
          <Tabs defaultValue="overview">
            <TabsList className="h-auto flex-wrap rounded-2xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({formatNumber(product.rating.count)})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Designed to be kept</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
                <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {product.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-3">
                      <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                        <svg viewBox="0 0 12 12" className="size-2.5" fill="none">
                          <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="text-xs leading-relaxed text-foreground/80">{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Link key={tag} href={`/products?q=${encodeURIComponent(tag)}`}>
                      <Badge variant="muted" className="normal-case tracking-normal hover:bg-muted/70">
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>

              {vendor && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Sold by
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <ProductImage src={vendor.logo} alt={vendor.name} className="size-12 rounded-xl" sizes="48px" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-semibold">{vendor.name}</p>
                        {vendor.isVerified && <BadgeCheck className="size-4 shrink-0 text-success" />}
                      </div>
                      <p className="text-[0.65rem] text-muted-foreground">
                        {vendor.rating.average} ★ · {vendor.rating.count} reviews
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {vendor.description}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/vendors/${vendor.slug}`}>Visit store</Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/products?q=${encodeURIComponent(vendor.name)}`}>All products</Link>
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="specs">
              <div className="max-w-3xl overflow-hidden rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(product.attributes).map(([key, value], index) => (
                      <tr key={key} className={cn(index % 2 === 0 ? "bg-card" : "bg-muted/30")}>
                        <th className="w-1/3 px-4 py-3 text-left text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
                          {key}
                        </th>
                        <td className="px-4 py-3 text-foreground/85">{String(value)}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-border bg-card">
                      <th className="px-4 py-3 text-left text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
                        Vendor
                      </th>
                      <td className="px-4 py-3 text-foreground/85">{product.storeName}</td>
                    </tr>
                    <tr className="bg-muted/30">
                      <th className="px-4 py-3 text-left text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
                        Warranty
                      </th>
                      <td className="px-4 py-3 text-foreground/85">{product.warrantyInformation}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <ReviewSection product={product} />
            </TabsContent>
          </Tabs>
        </div>

        {related.length > 0 && (
          <div className="mt-16 border-t border-border pt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Complete the set
                </p>
                <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.03em]">You might also keep</h2>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/products">View all</Link>
              </Button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed inset-x-3 bottom-3 z-30 lg:hidden">
        <div className="glass flex items-center gap-3 rounded-2xl p-2.5 shadow-float">
          <div className="min-w-0 flex-1 pl-1">
            <p className="truncate text-[0.62rem] text-muted-foreground">{variantInfo.label || product.brand}</p>
            <p className="text-sm font-semibold tabular-nums">{formatCurrency(variantInfo.price * quantity)}</p>
          </div>
          <Button
            size="sm"
            className="shrink-0"
            disabled={variantInfo.stock <= 0}
            onClick={() => handleAdd(false)}
          >
            <PlusIcon /> Add to cart
          </Button>
        </div>
      </div>
    </>
  );
}

function PlusIcon() {
  return <ShoppingBag className="size-3.5" />;
}
