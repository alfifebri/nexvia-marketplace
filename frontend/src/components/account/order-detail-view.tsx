"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  HelpCircle,
  MapPin,
  Package,
  ReceiptText,
  RotateCcw,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { ProductImage } from "@/components/ui/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder } from "@/hooks/queries";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency, formatDate } from "@/lib/utils";

export function OrderDetailView({ orderId }: { orderId: string }) {
  const { data: order, isLoading } = useOrder(orderId);
  const user = useAuthStore((state) => state.user);
  const addLine = useCartStore((state) => state.addLine);
  const [reordered, setReordered] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-28 rounded-2xl" />
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order || (user && order.customerId !== user.id && user.role !== "admin")) {
    return (
      <div className="flex min-h-[45vh] flex-col items-center justify-center text-center">
        <Package className="size-8 text-muted-foreground/50" />
        <h1 className="mt-4 text-xl font-semibold">Order not found</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          This order doesn&apos;t exist, or it belongs to another account.
        </p>
        <Button asChild className="mt-5">
          <Link href="/account/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const reorder = () => {
    for (const item of order.items) {
      addLine(
        {
          productId: item.productId,
          slug: item.slug,
          title: item.title,
          thumbnail: item.image,
          price: item.price,
          currency: order.totals.currency,
          quantity: item.quantity,
          stock: 99,
          vendorId: item.vendorId,
          storeId: item.storeId,
          storeName: item.storeName,
          variant: item.variant,
          variantLabel: item.variantLabel,
        },
        item.quantity,
      );
    }
    setReordered(true);
    toast.success("Items added to your cart", { description: `${order.items.length} lines from #${order.orderNumber}` });
  };

  const entries = [...order.statusHistory].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> All orders
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              Order #{order.orderNumber}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Placed {formatDate(order.placedAt, { dateStyle: "long" })} · {order.items.length} line
            {order.items.length > 1 ? "s" : ""} · {formatCurrency(order.totals.grandTotal, order.totals.currency)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="size-3.5" /> Receipt
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/support#contact">
              <HelpCircle className="size-3.5" /> Get help
            </Link>
          </Button>
          <Button size="sm" onClick={reorder} disabled={reordered}>
            <RotateCcw className="size-3.5" /> {reordered ? "Added to cart" : "Buy again"}
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <OrderTimeline order={order} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold">Items</h2>
              <span className="text-[0.62rem] text-muted-foreground">{order.shippingMethod.label}</span>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 p-4 sm:p-5">
                  <Link href={`/products/${item.slug}`} className="shrink-0">
                    <ProductImage src={item.image} alt={item.title} className="size-20 rounded-xl sm:size-24" sizes="96px" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <Link href={`/products/${item.slug}`} className="text-sm font-semibold hover:underline">
                          {item.title}
                        </Link>
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCurrency(item.lineTotal, order.totals.currency)}
                        </p>
                      </div>
                      <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                        {item.variantLabel ?? "Standard"} · {item.storeName}
                      </p>
                      <p className="mt-0.5 text-[0.62rem] text-muted-foreground">
                        Qty {item.quantity} · {formatCurrency(item.price, order.totals.currency)} each
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="muted" className="capitalize">{item.status}</Badge>
                      {order.status === "delivered" && item.status === "delivered" && (
                        <Link
                          href={`/products/${item.slug}#reviews`}
                          className="text-[0.62rem] font-semibold text-primary hover:underline"
                        >
                          Write a review
                        </Link>
                      )}
                      <Link
                        href={`/vendors/${item.storeId.replace(/^s-/, "")}`}
                        className="text-[0.62rem] text-muted-foreground hover:text-foreground hover:underline"
                      >
                        Visit {item.storeName}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {order.status === "shipped" && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Truck className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">On the way</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Expected {order.shippingMethod.eta}. Tracking updates are pushed to your email.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
                    <span className="text-[0.6rem] font-semibold uppercase tracking-wide text-muted-foreground">
                      Tracking
                    </span>
                    <span className="font-mono text-xs">NXV-{order.orderNumber.replace(/\D/g, "")}-TRK</span>
                    <Button variant="ghost" size="sm" className="ml-auto h-7 text-[0.62rem]" asChild>
                      <Link href="/support#contact">Not moving?</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Order activity</h2>
            <ol className="mt-4 space-y-3">
              {entries.map((entry, index) => (
                <li key={`${entry.status}-${entry.at}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={
                        index === 0
                          ? "mt-1 grid size-3.5 place-items-center rounded-full bg-primary text-primary-foreground"
                          : "mt-1 size-3.5 rounded-full border-2 border-border bg-card"
                      }
                    >
                      {index === 0 && <CheckCircle2 className="size-2.5" />}
                    </span>
                    {index < entries.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-2">
                    <p className="text-xs font-semibold capitalize">{entry.status}</p>
                    <p className="text-[0.65rem] text-muted-foreground">{entry.note}</p>
                    <p className="mt-0.5 text-[0.58rem] text-muted-foreground/70">
                      {formatDate(entry.at, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="size-4 text-muted-foreground" /> Shipping address
            </h2>
            <address className="mt-3 text-xs not-italic leading-relaxed text-foreground/80">
              <span className="block font-semibold text-foreground">{order.shippingAddress.recipientName}</span>
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
              <br />
              <span className="text-muted-foreground">{order.shippingAddress.phone}</span>
            </address>
            <div className="mt-3 border-t border-border pt-3 text-[0.65rem]">
              <p className="flex items-center justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.shippingMethod.label}</span>
              </p>
              <p className="mt-1.5 flex items-center justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">{order.shippingMethod.eta}</span>
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ReceiptText className="size-4 text-muted-foreground" /> Payment summary
            </h2>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items</span>
                <span className="tabular-nums">{formatCurrency(order.totals.itemsTotal, order.totals.currency)}</span>
              </div>
              {order.totals.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount {order.coupon ? `(${order.coupon.code})` : ""}</span>
                  <span className="tabular-nums">−{formatCurrency(order.totals.discount, order.totals.currency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="tabular-nums">
                  {order.totals.shippingFee === 0 ? "Free" : formatCurrency(order.totals.shippingFee, order.totals.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="tabular-nums">{formatCurrency(order.totals.tax, order.totals.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5 text-sm font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(order.totals.grandTotal, order.totals.currency)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/60 p-2.5">
              <span className="grid size-7 place-items-center rounded-full bg-card text-[0.55rem] font-bold uppercase">
                {order.payment.provider === "cod" ? "COD" : order.payment.provider}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.65rem] font-medium">{order.payment.method}</p>
                <p className="text-[0.58rem] capitalize text-muted-foreground">
                  {order.payment.status}
                  {order.payment.paidAt ? ` · ${formatDate(order.payment.paidAt)}` : ""}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Sold by</h2>
            <div className="mt-3 space-y-2">
              {Array.from(new Set(order.items.map((item) => item.storeName))).map((storeName) => {
                const item = order.items.find((entry) => entry.storeName === storeName);
                if (!item) return null;
                return (
                  <div key={storeName} className="flex items-center justify-between text-[0.68rem]">
                    <span className="font-medium">{storeName}</span>
                    <Link
                      href={`/vendors/${item.storeId.replace(/^s-/, "")}`}
                      className="text-primary hover:underline"
                    >
                      Visit store
                    </Link>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 border-t border-border pt-3 text-[0.6rem] leading-relaxed text-muted-foreground">
              Nexvia routes each vendor&apos;s share of this order automatically through split payouts.
              Questions about an item? We coordinate with the maker on your behalf.
            </p>
          </section>

          {order.notes && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">Order note</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{order.notes}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
