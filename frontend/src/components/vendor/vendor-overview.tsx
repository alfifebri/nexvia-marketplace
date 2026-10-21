"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  Boxes,
  CircleAlert,
  MessageSquareQuote,
  Package,
  Plus,
  ShoppingBag,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { ProductImage } from "@/components/ui/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/hooks/use-mounted";
import { useVendorWorkspace } from "@/hooks/queries";
import { useDemoStore } from "@/stores/demo-store";
import { formatCurrency, formatDate, formatNumber, roundCurrency } from "@/lib/utils";

export function VendorOverview() {
  const mounted = useMounted();
  const { vendor, store, products, orders, metrics } = useVendorWorkspace();
  const reviews = useDemoStore((state) => state.reviews);

  const vendorOrders = useMemo(() => {
    const productIds = new Set(products.map((product) => product.id));
    return [...orders]
      .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
      .map((order) => {
        const items = order.items.filter((item) => item.vendorId === vendor.ownerId || productIds.has(item.productId));
        return {
          order,
          items,
          value: roundCurrency(items.reduce((sum, item) => sum + item.lineTotal, 0)),
        };
      })
      .filter((entry) => entry.items.length > 0);
  }, [orders, products, vendor.ownerId]);

  const vendorReviews = useMemo(() => {
    const ids = new Set(products.map((product) => product.id));
    return reviews.filter((review) => ids.has(review.productId)).slice(0, 3);
  }, [reviews, products]);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const revenue = roundCurrency(vendorOrders.reduce((sum, entry) => sum + entry.value, 0));
  const commission = roundCurrency(revenue * (vendor.settings.commissionRate / 100));
  const payout = roundCurrency(revenue - commission);
  const pending = vendorOrders.filter((entry) => ["confirmed", "processing"].includes(entry.order.status));
  const lowStock = products.filter((product) => product.stock <= 10).sort((a, b) => a.stock - b.stock);

  const kpis = [
    {
      label: "Gross revenue",
      value: formatCurrency(revenue),
      change: "+12.4%",
      up: true,
      hint: "vs previous 30 days",
      icon: BadgeDollarSign,
    },
    {
      label: "Orders",
      value: formatNumber(vendorOrders.length),
      change: "+8.1%",
      up: true,
      hint: `${pending.length} awaiting fulfilment`,
      icon: ShoppingBag,
    },
    {
      label: "Average order",
      value: formatCurrency(vendorOrders.length ? revenue / vendorOrders.length : 0),
      change: "+2.6%",
      up: true,
      hint: "Across all channels",
      icon: TrendingUp,
    },
    {
      label: "Next payout",
      value: formatCurrency(payout),
      change: "Fri",
      up: true,
      hint: `After ${vendor.settings.commissionRate}% commission`,
      icon: Wallet,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {vendor.isVerified ? "Verified seller" : "Seller"} · Live overview
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            {store?.name ?? vendor.name}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Here&apos;s how the studio is performing. All amounts shown before commission.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/vendors/${vendor.slug}`}>View storefront <ArrowUpRight className="size-3.5" /></Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/vendor/products"><Plus className="size-3.5" /> Add product</Link>
          </Button>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3">
          <CircleAlert className="size-4 shrink-0 text-amber-600" />
          <p className="flex-1 text-[0.7rem] text-amber-800 dark:text-amber-300">
            <span className="font-semibold">{lowStock.length} products are low on stock.</span> Restock soon to
            avoid losing the buy box.
          </p>
          <Link href="/vendor/products" className="text-[0.65rem] font-semibold text-amber-800 underline-offset-2 hover:underline dark:text-amber-300">
            Review inventory
          </Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <span className="grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground">
                <kpi.icon className="size-4" />
              </span>
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[0.55rem] font-semibold ${
                  kpi.up ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                }`}
              >
                {kpi.up ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
                {kpi.change}
              </span>
            </div>
            <p className="mt-3 text-xl font-semibold tracking-tight tabular-nums">{kpi.value}</p>
            <p className="text-[0.65rem] font-medium">{kpi.label}</p>
            <p className="text-[0.58rem] text-muted-foreground">{kpi.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">Revenue trend</h2>
              <p className="text-[0.62rem] text-muted-foreground">Last 12 months · gross sales</p>
            </div>
            <Badge variant="muted" className="text-[0.55rem]">Monthly</Badge>
          </div>
          <div className="mt-4">
            <RevenueChart data={metrics.revenueSeries} height={250} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border pt-3">
            <div>
              <p className="text-[0.55rem] uppercase tracking-wide text-muted-foreground">Commission</p>
              <p className="text-xs font-semibold tabular-nums">{formatCurrency(commission)}</p>
            </div>
            <div>
              <p className="text-[0.55rem] uppercase tracking-wide text-muted-foreground">Net payout</p>
              <p className="text-xs font-semibold tabular-nums">{formatCurrency(payout)}</p>
            </div>
            <div>
              <p className="text-[0.55rem] uppercase tracking-wide text-muted-foreground">Units sold</p>
              <p className="text-xs font-semibold tabular-nums">{formatNumber(metrics.units)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <Boxes className="size-4 text-muted-foreground" /> Inventory watch
              </h2>
              <p className="text-[0.62rem] text-muted-foreground">{lowStock.length} items need attention</p>
            </div>
            <Link href="/vendor/products" className="text-[0.62rem] font-semibold text-primary hover:underline">
              All
            </Link>
          </div>

          <div className="mt-3 space-y-2">
            {(lowStock.length > 0 ? lowStock : products).slice(0, 4).map((product) => (
              <div key={product.id} className="flex items-center gap-2.5">
                <ProductImage src={product.thumbnail} alt={product.title} className="size-10 rounded-lg" sizes="40px" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.68rem] font-medium">{product.title}</p>
                  <p className="text-[0.58rem] text-muted-foreground">{formatCurrency(product.price, product.currency)}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[0.55rem] font-semibold ${
                    product.stock === 0
                      ? "bg-danger/10 text-danger"
                      : product.stock <= 10
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "bg-success/10 text-success"
                  }`}
                >
                  {product.stock === 0 ? "Sold out" : `${product.stock} left`}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-muted/60 p-3">
            <p className="flex items-center gap-1.5 text-[0.6rem] font-semibold">
              <Wallet className="size-3" /> Payout schedule
            </p>
            <p className="mt-1 text-[0.58rem] leading-relaxed text-muted-foreground">
              Weekly, every Friday via Stripe Connect. Minimum threshold $50. Reserve of 5% held for 30 days.
            </p>
            <Link href="/vendor/settings" className="mt-1.5 inline-block text-[0.6rem] font-semibold text-primary hover:underline">
              Manage payout details
            </Link>
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link href="/vendor/orders" className="text-[0.62rem] font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          {vendorOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">No orders yet.</div>
          ) : (
            <div className="divide-y divide-border">
              {vendorOrders.slice(0, 5).map(({ order, items, value }) => (
                <Link
                  key={order.id}
                  href="/vendor/orders"
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex -space-x-2">
                    {items.slice(0, 2).map((item) => (
                      <ProductImage key={item.id} src={item.image} alt={item.title} className="size-8 rounded-lg border border-card" sizes="32px" />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.68rem] font-semibold">#{order.orderNumber}</p>
                    <p className="truncate text-[0.58rem] text-muted-foreground">
                      {order.customerName} · {items.reduce((sum, item) => sum + item.quantity, 0)} units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.68rem] font-semibold tabular-nums">{formatCurrency(value, order.totals.currency)}</p>
                    <p className="text-[0.55rem] text-muted-foreground">{formatDate(order.placedAt, { month: "short", day: "numeric" })}</p>
                  </div>
                  <OrderStatusBadge status={order.status} className="hidden sm:inline-flex" />
                </Link>
              ))}
            </div>
          )}
          <div className="border-t border-border px-4 py-2.5">
            <Link href="/vendor/orders" className="flex items-center justify-center gap-1 text-[0.62rem] font-semibold text-muted-foreground hover:text-foreground">
              Open fulfilment queue <ArrowRight className="size-3" />
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <MessageSquareQuote className="size-4 text-muted-foreground" /> Latest reviews
            </h2>
            <Link href="/vendor/reviews" className="text-[0.62rem] font-semibold text-primary hover:underline">
              All
            </Link>
          </div>
          <div className="mt-3 space-y-3">
            {vendorReviews.length === 0 && (
              <p className="py-4 text-center text-[0.65rem] text-muted-foreground">No reviews yet.</p>
            )}
            {vendorReviews.map((review) => (
              <div key={review.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[0.65rem] font-semibold">{review.userName}</p>
                  <span className="flex shrink-0 items-center gap-0.5 text-[0.55rem] font-semibold text-amber-600">
                    {review.rating.toFixed(1)} <Star className="size-2.5 fill-amber-400 text-amber-400" />
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[0.6rem] leading-relaxed text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/60 p-4">
            <div>
              <p className="text-lg font-semibold">{vendor.rating.average.toFixed(1)}</p>
              <p className="text-[0.55rem] text-muted-foreground">{formatNumber(vendor.rating.count)} reviews</p>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`size-3 ${index < Math.round(vendor.rating.average) ? "fill-amber-400 text-amber-400" : "text-border"}`}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "Add a product", text: "Grow the catalogue", href: "/vendor/products", icon: Package },
          { title: "Fulfil orders", text: `${pending.length} awaiting action`, href: "/vendor/orders", icon: ShoppingBag },
          { title: "Polish storefront", text: "Banner, policies, story", href: "/vendor/storefront", icon: TrendingUp },
        ].map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-foreground/20"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
              <action.icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.68rem] font-semibold">{action.title}</p>
              <p className="text-[0.58rem] text-muted-foreground">{action.text}</p>
            </div>
            <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
