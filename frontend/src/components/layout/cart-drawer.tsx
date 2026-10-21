"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles, Trash2, Truck } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Progress } from "@/components/ui/progress";
import { useCartStore, useCartCount, useCartTotals } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";

const FREE_SHIPPING = 100;

export function CartDrawer() {
  const open = useCartStore((state) => state.isOpen);
  const close = useCartStore((state) => state.closeCart);
  const lines = useCartStore((state) => state.lines);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeLine = useCartStore((state) => state.removeLine);
  const count = useCartCount();
  const totals = useCartTotals();
  const remaining = Math.max(0, FREE_SHIPPING - totals.subtotal);

  return (
    <Sheet open={open} onOpenChange={(value) => (value ? undefined : close())}>
      <SheetContent side="right" className="p-0">
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-border px-6 py-5 pr-16">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Your cart</h2>
              <p className="text-xs text-muted-foreground">
                {count} {count === 1 ? "item" : "items"} · carbon-neutral delivery
              </p>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-muted">
              <ShoppingBag className="size-4" />
            </span>
          </header>

          {lines.length > 0 && (
            <div className="border-b border-border bg-muted/40 px-6 py-3.5">
              <div className="mb-2 flex items-center justify-between gap-3 text-[0.7rem]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Truck className="size-3.5" />
                  {remaining > 0 ? (
                    <>You&apos;re {formatCurrency(remaining)} away from free shipping</>
                  ) : (
                    <>Free shipping unlocked</>
                  )}
                </span>
                <span className="font-semibold text-success">
                  {remaining > 0 ? `${Math.min(99, Math.round((totals.subtotal / FREE_SHIPPING) * 100))}%` : "100%"}
                </span>
              </div>
              <Progress
                value={Math.min(100, (totals.subtotal / FREE_SHIPPING) * 100)}
                indicatorClassName="bg-success"
              />
            </div>
          )}

          <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
            {lines.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <div className="mb-5 grid size-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <ShoppingBag className="size-7" />
                </div>
                <h3 className="text-lg font-semibold">Your cart is beautifully empty</h3>
                <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
                  Start with an editor&apos;s pick — or browse the full catalogue.
                </p>
                <Button asChild className="mt-6" onClick={close}>
                  <Link href="/products">
                    Explore the catalogue <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <div className="mt-8 flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-left">
                  <Sparkles className="size-4 shrink-0 text-coral" />
                  <p className="text-[0.7rem] text-muted-foreground">
                    Use code <span className="font-semibold text-foreground">NEXVIA10</span> for 10% off your first order.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="space-y-5">
                {lines.map((line) => (
                  <li key={line.key} className="flex gap-4">
                    <Link
                      href={`/products/${line.slug}`}
                      onClick={close}
                      className="shrink-0"
                      aria-label={line.title}
                    >
                      <ProductImage
                        src={line.thumbnail}
                        alt={line.title}
                        className="size-24 rounded-xl"
                        sizes="96px"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${line.slug}`}
                            onClick={close}
                            className="line-clamp-2 text-sm font-semibold leading-snug hover:underline underline-offset-2"
                          >
                            {line.title}
                          </Link>
                          <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                            {line.storeName}
                            {line.variantLabel ? ` · ${line.variantLabel}` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => removeLine(line.key)}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-danger"
                          aria-label={`Remove ${line.title}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                        <QuantityStepper
                          value={line.quantity}
                          onChange={(value) => setQuantity(line.key, value)}
                          max={line.stock}
                          size="sm"
                        />
                        <span className="text-sm font-semibold tabular-nums">
                          {formatCurrency(line.price * line.quantity, line.currency)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {lines.length > 0 && (
            <footer className="border-t border-border bg-card px-6 py-5">
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex items-center justify-between text-success">
                    <span>Discount</span>
                    <span className="font-semibold tabular-nums">−{formatCurrency(totals.discount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Shipping & tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                <Button asChild size="lg" className="w-full" onClick={close}>
                  <Link href="/checkout">
                    Secure checkout <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="w-full" onClick={close}>
                  <Link href="/cart">View full cart</Link>
                </Button>
              </div>
              <p className="mt-3 text-center text-[0.65rem] text-muted-foreground">
                Split payouts settle instantly to each vendor via Stripe Connect.
              </p>
            </footer>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
