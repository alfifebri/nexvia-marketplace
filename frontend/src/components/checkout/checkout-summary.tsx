"use client";

import Link from "next/link";
import { LockKeyhole, Sparkles } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { useCartStore } from "@/stores/cart-store";
import { shippingMethods } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

interface CheckoutSummaryProps {
  totals: { subtotal: number; discount: number; shipping: number; tax: number; total: number; itemCount: number };
  showItems?: boolean;
  showSplit?: boolean;
}

export function CheckoutSummary({ totals, showItems = false, showSplit = true }: CheckoutSummaryProps) {
  const lines = useCartStore((state) => state.lines);
  const coupon = useCartStore((state) => state.coupon);
  const shippingMethodId = useCartStore((state) => state.shippingMethodId);
  const method = shippingMethods.find((item) => item.id === shippingMethodId) ?? shippingMethods[0];

  const payouts = Object.values(
    lines.reduce<Record<string, { storeName: string; gross: number; fee: number }>>((acc, line) => {
      const gross = line.price * line.quantity;
      const current = acc[line.storeId] ?? { storeName: line.storeName, gross: 0, fee: 0 };
      current.gross += gross;
      current.fee += gross * 0.12;
      acc[line.storeId] = current;
      return acc;
    }, {}),
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Order summary</h2>
        <Link href="/cart" className="text-[0.62rem] font-semibold text-primary hover:underline">
          Edit cart
        </Link>
      </div>

      {showItems && (
        <ul className="mt-4 space-y-3 border-b border-border pb-4">
          {lines.map((line) => (
            <li key={line.key} className="flex items-center gap-3">
              <div className="relative shrink-0">
                <ProductImage src={line.thumbnail} alt={line.title} className="size-12 rounded-lg" sizes="48px" />
                <span className="absolute -right-1.5 -top-1.5 grid size-4 min-w-4 place-items-center rounded-full bg-foreground px-1 text-[0.55rem] font-bold text-background">
                  {line.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.7rem] font-medium">{line.title}</p>
                <p className="truncate text-[0.58rem] text-muted-foreground">
                  {line.storeName}
                  {line.variantLabel ? ` · ${line.variantLabel}` : ""}
                </p>
              </div>
              <p className="text-[0.7rem] font-semibold tabular-nums">
                {formatCurrency(line.price * line.quantity, line.currency)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal ({totals.itemCount} items)</span>
          <span className="font-medium tabular-nums">{formatCurrency(totals.subtotal)}</span>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-success">
            <span>Discount {coupon ? `(${coupon.code})` : ""}</span>
            <span className="font-medium tabular-nums">−{formatCurrency(totals.discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping · {method.label}</span>
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
        <p className="text-[0.58rem] text-muted-foreground">USD · inclusive of platform fees</p>
      </div>

      {showSplit && payouts.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Sparkles className="size-3 text-coral" /> Split payout preview
          </p>
          <div className="mt-2.5 space-y-2">
            {payouts.map((payout) => (
              <div key={payout.storeName} className="text-[0.62rem]">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{payout.storeName}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatCurrency(payout.gross - payout.fee)} payout
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/60"
                    style={{ width: `${(payout.gross / totals.subtotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2.5 text-[0.55rem] leading-relaxed text-muted-foreground">
            Each vendor is paid separately via Stripe Connect. Nexvia&apos;s 12% platform fee is deducted
            automatically.
          </p>
        </div>
      )}

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.58rem] text-muted-foreground">
        <LockKeyhole className="size-3" /> 256-bit encrypted · PCI-DSS compliant
      </p>
    </div>
  );
}
