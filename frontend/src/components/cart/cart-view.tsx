"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ProductImage } from "@/components/ui/product-image";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Skeleton } from "@/components/ui/skeleton";
import { CouponInput } from "@/components/cart/coupon-input";
import { useMounted } from "@/hooks/use-mounted";
import { useCartStore, useCartCount, useCartTotals } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { shippingMethods } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";

const FREE_SHIPPING = 100;

export function CartView() {
  const mounted = useMounted();
  const lines = useCartStore((state) => state.lines);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeLine = useCartStore((state) => state.removeLine);
  const shippingMethodId = useCartStore((state) => state.shippingMethodId);
  const setShippingMethod = useCartStore((state) => state.setShippingMethod);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const count = useCartCount();
  const totals = useCartTotals();
  const remaining = Math.max(0, FREE_SHIPPING - totals.subtotal);

  const groups = useMemo(() => {
    const map = new Map<string, typeof lines>();
    for (const line of lines) {
      map.set(line.storeId, [...(map.get(line.storeId) ?? []), line]);
    }
    return Array.from(map.entries());
  }, [lines]);

  if (!mounted) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-9 w-52" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <ShoppingBag className="size-7" />
        </span>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Your cart is beautifully empty</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Fill it with fewer, better things. Start with an editor&apos;s pick or browse every maker.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/products">Explore the catalogue <ArrowRight className="size-4" /></Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/account/wishlist">View wishlist</Link>
          </Button>
        </div>
        <div className="mt-8 flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3">
          <span className="text-[0.65rem] text-muted-foreground">
            First order? Use <span className="font-semibold text-foreground">NEXVIA10</span> for 10% off.
          </span>
        </div>
      </div>
    );
  }

  const saveForLater = (line: (typeof lines)[number]) => {
    toggleWishlist(line.productId);
    removeLine(line.key);
    toast.success("Saved to wishlist", { description: line.title });
  };

  return (
    <div className="container-page py-8 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Checkout begins here
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Your cart</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {count} {count === 1 ? "item" : "items"} from {groups.length} {groups.length === 1 ? "maker" : "makers"}.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
        <Truck className="size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="font-medium">
              {remaining > 0 ? (
                <>You&apos;re {formatCurrency(remaining)} from free shipping</>
              ) : (
                <>Free carbon-neutral shipping unlocked</>
              )}
            </span>
            <span className="text-[0.62rem] tabular-nums text-muted-foreground">
              {formatCurrency(Math.min(totals.subtotal, FREE_SHIPPING))} / {formatCurrency(FREE_SHIPPING)}
            </span>
          </div>
          <Progress value={Math.min(100, (totals.subtotal / FREE_SHIPPING) * 100)} className="mt-2 h-1.5" indicatorClassName="bg-success" />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-start">
        <div className="space-y-4">
          {groups.map(([storeId, storeLines]) => (
            <section key={storeId} className="overflow-hidden rounded-2xl border border-border bg-card">
              <header className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Sold by
                  </span>
                  <span className="text-xs font-semibold">{storeLines[0].storeName}</span>
                  <Badge variant="muted" className="text-[0.5rem]">Vetted</Badge>
                </div>
                <Link
                  href={`/vendors/${storeId.replace(/^s-/, "")}`}
                  className="text-[0.62rem] font-semibold text-primary hover:underline"
                >
                  Visit store
                </Link>
              </header>

              <ul className="divide-y divide-border">
                {storeLines.map((line) => (
                  <li key={line.key} className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                    <Link href={`/products/${line.slug}`} className="shrink-0">
                      <ProductImage
                        src={line.thumbnail}
                        alt={line.title}
                        className="size-20 rounded-xl sm:size-24"
                        sizes="96px"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link href={`/products/${line.slug}`} className="line-clamp-2 text-sm font-semibold hover:underline">
                            {line.title}
                          </Link>
                          <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                            {line.variantLabel ?? "Standard"}
                          </p>
                          <p className="mt-0.5 text-[0.62rem] text-muted-foreground">
                            {formatCurrency(line.price, line.currency)} each · {line.stock} in stock
                          </p>
                        </div>
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCurrency(line.price * line.quantity, line.currency)}
                        </p>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                        <QuantityStepper
                          value={line.quantity}
                          onChange={(value) => setQuantity(line.key, value)}
                          max={line.stock}
                          size="sm"
                        />
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => saveForLater(line)}
                            className="inline-flex items-center gap-1 text-[0.62rem] font-medium text-muted-foreground hover:text-foreground"
                          >
                            <Heart className="size-3" /> Save
                          </button>
                          <button
                            onClick={() => removeLine(line.key)}
                            className="inline-flex items-center gap-1 text-[0.62rem] font-medium text-muted-foreground hover:text-danger"
                          >
                            <Trash2 className="size-3" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <p className="text-xs font-semibold">Have a discount code?</p>
            <div className="mt-3">
              <CouponInput />
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Buyer protection", text: "Every order, no fine print" },
              { icon: RotateCcw, title: "30-day returns", text: "Free and effortless" },
              { icon: LockKeyhole, title: "Secure checkout", text: "PCI-DSS encrypted" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-3">
                <item.icon className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-[0.65rem] font-semibold">{item.title}</p>
                  <p className="text-[0.58rem] text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Order summary</h2>

            <div className="mt-4 space-y-2.5">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Delivery method
              </p>
              {shippingMethods.map((method) => {
                const free = method.id === "standard" && totals.subtotal >= 100;
                const active = shippingMethodId === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setShippingMethod(method.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                      active ? "border-primary bg-primary/[0.03]" : "border-border hover:border-foreground/20",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border",
                      )}
                    >
                      {active && <span className="size-1.5 rounded-full bg-current" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold">{method.label}</span>
                        <span className="text-xs font-semibold tabular-nums">
                          {method.price === 0 || free ? "Free" : formatCurrency(method.price)}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[0.62rem] text-muted-foreground">{method.eta}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-2 border-t border-border pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span className="font-medium tabular-nums">−{formatCurrency(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium tabular-nums">
                  {totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated tax</span>
                <span className="font-medium tabular-nums">{formatCurrency(totals.tax)}</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(totals.total)}</span>
              </div>
              <p className="text-[0.58rem] text-muted-foreground">USD · Taxes calculated for your region</p>
            </div>

            <Button asChild size="lg" className="mt-5 w-full">
              <Link href="/checkout">
                <LockKeyhole className="size-4" /> Proceed to checkout
              </Link>
            </Button>
            <p className="mt-3 text-center text-[0.6rem] leading-relaxed text-muted-foreground">
              Split payments are settled automatically to each vendor. You pay once.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
