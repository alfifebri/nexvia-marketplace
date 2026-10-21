"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  CircleDollarSign,
  Clock3,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/hooks/use-mounted";
import { adminMetrics } from "@/lib/demo/analytics";
import { useDemoStore } from "@/stores/demo-store";
import { formatCurrency, formatDate } from "@/lib/utils";

export function AdminOverview() {
  const mounted = useMounted();
  const orders = useDemoStore((state) => state.orders);
  const vendors = useDemoStore((state) => state.vendors);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-72" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
    .slice(0, 6);
  const pendingVendors = vendors.filter((vendor) => vendor.status === "pending");
  const topVendors = adminMetrics.topVendors
    .map((entry) => ({ ...entry, status: vendors.find((vendor) => vendor.id === entry.id)?.status ?? entry.status }))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Command center</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Marketplace overview</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Trailing 12 months · {vendors.length} vendors · {orders.length} recorded orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/vendors">
              Review vendors <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/orders">Monitor orders</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Gross merchandise value", value: formatCurrency(adminMetrics.gmv, "USD", 0), hint: "+18.2% year over year", icon: CircleDollarSign },
          { label: "Platform commission", value: formatCurrency(adminMetrics.commission, "USD", 0), hint: "11.8% effective take rate", icon: BadgeDollarSign },
          { label: "Orders processed", value: adminMetrics.orders.toLocaleString(), hint: `${formatCurrency(adminMetrics.averageOrderValue)} average`, icon: ShoppingBag },
          { label: "Active customers", value: adminMetrics.customers.toLocaleString(), hint: `${adminMetrics.conversionRate}% conversion`, icon: Users },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <kpi.icon className="size-4 text-muted-foreground" />
              <ArrowUpRight className="size-3.5 text-success" />
            </div>
            <p className="mt-3 text-xl font-semibold tracking-[-0.03em] tabular-nums">{kpi.value}</p>
            <p className="text-[0.6rem] font-medium">{kpi.label}</p>
            <p className="mt-0.5 text-[0.55rem] text-muted-foreground">{kpi.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">GMV & take rate</h2>
              <p className="text-[0.6rem] text-muted-foreground">Monthly volume with platform commission.</p>
            </div>
            <Badge variant="muted" className="text-[0.5rem]">Last 12 months</Badge>
          </div>
          <RevenueChart data={adminMetrics.revenueSeries} height={280} showCommission />
          <div className="mt-2 flex gap-4 text-[0.58rem] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> GMV</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-coral" /> Commission</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Category mix</h2>
          <p className="text-[0.6rem] text-muted-foreground">Share of merchandise value.</p>
          <div className="relative mt-2 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={adminMetrics.categoryShare}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={74}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {adminMetrics.categoryShare.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value), "USD", 0)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgba(120,120,120,0.2)",
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                    fontSize: 11,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-lg font-semibold leading-none">{adminMetrics.categoryShare.length}</p>
                <p className="text-[0.5rem] uppercase tracking-wide text-muted-foreground">categories</p>
              </div>
            </div>
          </div>
          <div className="mt-1 space-y-1">
            {adminMetrics.categoryShare.slice(0, 4).map((category) => (
              <div key={category.name} className="flex items-center gap-2 text-[0.6rem]">
                <span className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="flex-1 truncate text-muted-foreground">{category.name}</span>
                <span className="font-semibold tabular-nums">{formatCurrency(category.value, "USD", 0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="text-sm font-semibold">Recent orders</h2>
              <p className="text-[0.6rem] text-muted-foreground">Latest activity across all vendors.</p>
            </div>
            <Button asChild variant="ghost" size="xs">
              <Link href="/admin/orders">View all <ArrowRight className="size-3" /></Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-border text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-2.5">Order</th>
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="text-xs hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-semibold">#{order.orderNumber}</p>
                      <p className="text-[0.55rem] text-muted-foreground">{formatDate(order.placedAt, { month: "short", day: "numeric" })}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-[0.55rem] text-muted-foreground">{order.items.length} items</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatCurrency(order.totals.grandTotal, order.totals.currency)}
                    </td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <Clock3 className="size-3.5 text-muted-foreground" /> Approval queue
              </h2>
              <Badge variant={pendingVendors.length ? "warning" : "success"} className="text-[0.5rem]">
                {pendingVendors.length} pending
              </Badge>
            </div>
            <div className="mt-3 space-y-2.5">
              {pendingVendors.slice(0, 3).map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between text-[0.62rem]">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{vendor.name}</p>
                    <p className="truncate text-[0.55rem] text-muted-foreground">{vendor.ownerName}</p>
                  </div>
                  <Button asChild variant="outline" size="xs">
                    <Link href="/admin/vendors">Review</Link>
                  </Button>
                </div>
              ))}
              {pendingVendors.length === 0 && (
                <p className="text-[0.62rem] text-muted-foreground">Every vendor is reviewed. Nice work.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <Store className="size-3.5 text-muted-foreground" /> Top vendors
              </h2>
              <Button asChild variant="ghost" size="xs">
                <Link href="/admin/vendors">All</Link>
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {topVendors.map((vendor, index) => (
                <div key={vendor.id} className="flex items-center gap-2 text-[0.62rem]">
                  <span className="w-3 text-[0.55rem] font-semibold text-muted-foreground">{index + 1}</span>
                  <span className="flex-1 truncate">{vendor.name}</span>
                  <span className="font-semibold tabular-nums">{formatCurrency(vendor.revenue, "USD", 0)}</span>
                  <Badge variant={vendor.status === "active" ? "success" : "warning"} className="text-[0.45rem]">
                    {vendor.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
