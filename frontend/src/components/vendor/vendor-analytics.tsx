"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Download,
  Eye,
  MousePointerClick,
  Package,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/hooks/use-mounted";
import { useVendorWorkspace } from "@/hooks/queries";
import { formatCurrency, roundCurrency } from "@/lib/utils";

const channels = [
  { label: "Marketplace search", share: 38, color: "bg-primary" },
  { label: "Direct & repeat", share: 26, color: "bg-accent" },
  { label: "Editorial features", share: 18, color: "bg-[#88a5c9]" },
  { label: "Social referrals", share: 12, color: "bg-[#b99ad6]" },
  { label: "Email campaigns", share: 6, color: "bg-[#d8b26a]" },
];

export function VendorAnalytics() {
  const mounted = useMounted();
  const { vendor, metrics, products } = useVendorWorkspace();
  const [exporting, setExporting] = useState(false);

  const topProducts = useMemo(
    () =>
      [...(products.length ? products : metrics.topProducts)]
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 6)
        .map((product) => ({
          ...product,
          revenue: roundCurrency(product.price * product.soldCount),
        })),
    [products, metrics.topProducts],
  );

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const series = metrics.revenueSeries;
  const last = series.at(-1);
  const previous = series.at(-2);
  const delta = last && previous && previous.revenue > 0
    ? ((last.revenue - previous.revenue) / previous.revenue) * 100
    : 0;

  const funnel = [
    { label: "Storefront visits", value: metrics.units * 14, icon: Eye },
    { label: "Product views", value: metrics.units * 9, icon: MousePointerClick },
    { label: "Added to cart", value: Math.round(metrics.units * 2.4), icon: ShoppingBag },
    { label: "Paid orders", value: metrics.orders, icon: Wallet },
  ];
  const maxFunnel = Math.max(...funnel.map((step) => step.value), 1);

  const exportCsv = () => {
    if (topProducts.length === 0) {
      toast.error("Nothing to export yet.");
      return;
    }
    setExporting(true);
    const rows = [
      ["Product", "SKU", "Units sold", "Stock", "Price", "Estimated revenue"],
      ...topProducts.map((product) => [
        product.title,
        product.sku,
        String(product.soldCount),
        String(product.stock),
        String(product.price),
        String(product.revenue),
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${vendor.slug}-analytics.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    window.setTimeout(() => {
      setExporting(false);
      toast.success("Analytics exported");
    }, 300);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Performance</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Analytics</h1>
          <p className="mt-1 text-xs text-muted-foreground">Trailing 12 months of demand for {vendor.name}.</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv} loading={exporting}>
          <Download className="size-3.5" /> Export CSV
        </Button>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Gross revenue", value: formatCurrency(metrics.revenue, "USD", 0), icon: BarChart3, change: delta },
          { label: "Net payout", value: formatCurrency(metrics.payout, "USD", 0), icon: Wallet, change: delta - 1.2 },
          { label: "Orders", value: String(metrics.orders), icon: ShoppingBag, change: 8.4 },
          { label: "Avg. order value", value: formatCurrency(metrics.averageOrderValue), icon: Package, change: 3.1 },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <kpi.icon className="size-4 text-muted-foreground" />
              <span
                className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[0.55rem] font-semibold ${
                  kpi.change >= 0 ? "bg-success/10 text-success" : "bg-coral/10 text-coral"
                }`}
              >
                {kpi.change >= 0 ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
                {Math.abs(kpi.change).toFixed(1)}%
              </span>
            </div>
            <p className="mt-3 text-xl font-semibold tracking-[-0.03em] tabular-nums">{kpi.value}</p>
            <p className="text-[0.6rem] text-muted-foreground">{kpi.label} · vs last month</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Revenue trend</h2>
              <p className="text-[0.6rem] text-muted-foreground">Gross merchandise value and platform commission.</p>
            </div>
            <Badge variant="muted" className="text-[0.5rem]">12 months</Badge>
          </div>
          <RevenueChart data={series} height={280} showCommission />
          <div className="mt-2 flex gap-4 text-[0.58rem] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> Revenue</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-coral" /> Commission</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Where buyers come from</h2>
          <p className="text-[0.6rem] text-muted-foreground">Attribution across the marketplace.</p>
          <div className="mt-4 space-y-3">
            {channels.map((channel) => (
              <div key={channel.label}>
                <div className="flex items-center justify-between text-[0.62rem]">
                  <span className="text-foreground/80">{channel.label}</span>
                  <span className="font-semibold tabular-nums">{channel.share}%</span>
                </div>
                <Progress value={channel.share} className="mt-1 h-1.5" indicatorClassName={channel.color} />
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-muted/60 p-3">
            <p className="text-[0.58rem] leading-relaxed text-muted-foreground">
              Repeat buyers convert 2.7× better than first-time visitors. Consider a post-purchase coupon.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="text-sm font-semibold">Best sellers</h2>
              <p className="text-[0.6rem] text-muted-foreground">Ranked by lifetime units sold.</p>
            </div>
            <Button asChild variant="ghost" size="xs">
              <Link href="/vendor/products">All products</Link>
            </Button>
          </div>
          <div className="divide-y divide-border">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-4 text-[0.6rem] font-semibold tabular-nums text-muted-foreground">{index + 1}</span>
                <ProductImage src={product.thumbnail} alt={product.title} className="size-10 rounded-lg" sizes="40px" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{product.title}</p>
                  <p className="text-[0.55rem] text-muted-foreground">
                    {product.soldCount} sold · {product.stock} in stock
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold tabular-nums">{formatCurrency(product.revenue, "USD", 0)}</p>
                  <p className="text-[0.55rem] text-muted-foreground">est. revenue</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="p-6 text-center text-xs text-muted-foreground">No product data yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Conversion funnel</h2>
            <p className="text-[0.6rem] text-muted-foreground">From discovery to paid order.</p>
            <div className="mt-4 space-y-3">
              {funnel.map((step) => (
                <div key={step.label}>
                  <div className="flex items-center justify-between text-[0.62rem]">
                    <span className="flex items-center gap-1.5 text-foreground/80">
                      <step.icon className="size-3 text-muted-foreground" /> {step.label}
                    </span>
                    <span className="font-semibold tabular-nums">{step.value.toLocaleString()}</span>
                  </div>
                  <Progress
                    value={(step.value / maxFunnel) * 100}
                    className="mt-1 h-1.5"
                    indicatorClassName="bg-primary"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 text-[0.6rem]">
              <span className="text-muted-foreground">Visit → order</span>
              <span className="font-semibold text-success">{(metrics.orders / (metrics.units * 14) * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Inventory watch</h2>
              <Badge variant="warning" className="text-[0.5rem]">{metrics.lowStock.length} low</Badge>
            </div>
            <div className="mt-3 space-y-2">
              {metrics.lowStock.slice(0, 4).map((product) => (
                <div key={product.id} className="flex items-center justify-between text-[0.62rem]">
                  <span className="truncate pr-2 text-foreground/80">{product.title}</span>
                  <span className={`shrink-0 font-semibold tabular-nums ${product.stock <= 5 ? "text-coral" : "text-amber-600"}`}>
                    {product.stock} left
                  </span>
                </div>
              ))}
              {metrics.lowStock.length === 0 && (
                <p className="text-[0.62rem] text-muted-foreground">Everything is comfortably stocked.</p>
              )}
            </div>
            <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
              <Link href="/vendor/products">Restock inventory</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
