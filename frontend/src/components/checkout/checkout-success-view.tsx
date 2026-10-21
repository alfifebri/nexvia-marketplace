"use client";

import Link from "next/link";
import { Check, Mail, MapPin, Package, Printer, Sparkles, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder } from "@/hooks/queries";
import { useMounted } from "@/hooks/use-mounted";
import { formatCurrency, formatDate } from "@/lib/utils";

export function CheckoutSuccessView({ orderNumber }: { orderNumber: string }) {
  const mounted = useMounted();
  const { data: order, isLoading } = useOrder(orderNumber);

  if (!mounted || isLoading) {
    return (
      <div className="container-page py-14">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <Skeleton className="mx-auto size-16 rounded-full" />
          <Skeleton className="mx-auto h-9 w-72" />
          <Skeleton className="mx-auto h-4 w-96" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <Package className="size-8 text-muted-foreground/50" />
        <h1 className="mt-4 text-xl font-semibold">We couldn&apos;t load that confirmation</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Your order may still be processing. Check your order history in a moment.
        </p>
        <div className="mt-5 flex gap-2">
          <Button asChild><Link href="/account/orders">View orders</Link></Button>
          <Button asChild variant="outline"><Link href="/products">Keep shopping</Link></Button>
        </div>
      </div>
    );
  }

  const paid = order.payment.status === "paid";

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="relative mx-auto grid size-16 place-items-center rounded-full bg-success/10 text-success">
            <span className="absolute inset-0 animate-ping rounded-full bg-success/10" />
            <Check className="size-7" />
          </span>
          <p className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Order confirmed · #{order.orderNumber}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Thank you, {order.customerName.split(" ")[0]}.
          </h1>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            {paid
              ? "Your payment is secured and each maker has been notified. We'll email tracking as soon as it moves."
              : "Your order is confirmed. Have the exact amount ready when the courier arrives."}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Badge variant="success">{paid ? "Payment captured" : "Payment due on delivery"}</Badge>
            <Badge variant="muted">{order.shippingMethod.label}</Badge>
            <span className="text-[0.62rem] text-muted-foreground">
              {formatDate(order.placedAt, { dateStyle: "long" })}
            </span>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid gap-4 border-b border-border p-5 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Confirmation sent to
                </p>
                <p className="mt-0.5 text-xs font-medium">{order.customerEmail}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Truck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Estimated arrival
                </p>
                <p className="mt-0.5 text-xs font-medium">{order.shippingMethod.eta}</p>
              </div>
            </div>
          </div>

          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-3 p-4 sm:px-5">
                <ProductImage src={item.image} alt={item.title} className="size-14 rounded-xl" sizes="56px" />
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${item.slug}`} className="line-clamp-1 text-xs font-semibold hover:underline">
                    {item.title}
                  </Link>
                  <p className="mt-0.5 text-[0.62rem] text-muted-foreground">
                    {item.storeName} · {item.variantLabel ?? "Standard"} · Qty {item.quantity}
                  </p>
                </div>
                <p className="text-xs font-semibold tabular-nums">
                  {formatCurrency(item.lineTotal, order.totals.currency)}
                </p>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-border p-4 text-xs sm:px-5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items</span>
              <span className="tabular-nums">{formatCurrency(order.totals.itemsTotal, order.totals.currency)}</span>
            </div>
            {order.totals.discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
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
              <span>Total {paid ? "paid" : "due"}</span>
              <span className="tabular-nums">{formatCurrency(order.totals.grandTotal, order.totals.currency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <MapPin className="size-3.5" /> Shipping to
            </p>
            <address className="mt-2 text-[0.68rem] not-italic leading-relaxed text-foreground/80">
              <span className="font-semibold text-foreground">{order.shippingAddress.recipientName}</span>
              <br />
              {order.shippingAddress.line1}, {order.shippingAddress.city}
              <br />
              {order.shippingAddress.state} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </address>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Sparkles className="size-3.5 text-coral" /> Supporting makers
            </p>
            <div className="mt-2 space-y-1.5">
              {order.payment.transfers.map((transfer) => (
                <div key={transfer.storeName} className="flex items-center justify-between gap-2 text-[0.65rem]">
                  <span className="truncate">{transfer.storeName}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatCurrency(transfer.amount, order.totals.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href={`/account/orders/${order.id}`}>Track this order</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Keep exploring</Link>
          </Button>
          <Button variant="ghost" onClick={() => window.print()}>
            <Printer className="size-3.5" /> Print receipt
          </Button>
        </div>

        <p className="mt-6 text-center text-[0.6rem] leading-relaxed text-muted-foreground">
          Need help with this order?{" "}
          <Link href="/support#contact" className="font-semibold text-foreground underline-offset-2 hover:underline">
            Talk to the Nexvia concierge
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
