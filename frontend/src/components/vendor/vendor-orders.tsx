"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Search,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/types";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { ProductImage } from "@/components/ui/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMounted } from "@/hooks/use-mounted";
import { useUpdateOrderStatus, useVendorWorkspace } from "@/hooks/queries";
import { formatCurrency, formatDate, roundCurrency } from "@/lib/utils";

const nextAction: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  pending: { label: "Confirm order", next: "confirmed" },
  confirmed: { label: "Mark packed", next: "processing" },
  processing: { label: "Mark shipped", next: "shipped" },
  shipped: { label: "Mark delivered", next: "delivered" },
};

const tabs = [
  { id: "all", label: "All orders" },
  { id: "open", label: "Open" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "closed", label: "Closed" },
];

export function VendorOrders() {
  const mounted = useMounted();
  const { vendor, products, orders } = useVendorWorkspace();
  const updateStatus = useUpdateOrderStatus();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Order | null>(null);

  const enriched = useMemo(
    () =>
      orders
        .map((order) => {
          const items = order.items.filter(
            (item) => item.vendorId === vendor.ownerId || products.some((product) => product.id === item.productId),
          );
          return {
            order,
            items,
            value: roundCurrency(items.reduce((sum, item) => sum + item.lineTotal, 0)),
            units: items.reduce((sum, item) => sum + item.quantity, 0),
          };
        })
        .filter((entry) => entry.items.length > 0)
        .sort((a, b) => new Date(b.order.placedAt).getTime() - new Date(a.order.placedAt).getTime()),
    [orders, vendor.ownerId, products],
  );

  const counts = useMemo(
    () => ({
      all: enriched.length,
      open: enriched.filter((entry) => ["pending", "confirmed", "processing"].includes(entry.order.status)).length,
      shipped: enriched.filter((entry) => entry.order.status === "shipped").length,
      delivered: enriched.filter((entry) => entry.order.status === "delivered").length,
      closed: enriched.filter((entry) => ["cancelled", "refunded"].includes(entry.order.status)).length,
    }),
    [enriched],
  );

  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return enriched.filter((entry) => {
      if (tab === "open" && !["pending", "confirmed", "processing"].includes(entry.order.status)) return false;
      if (tab === "shipped" && entry.order.status !== "shipped") return false;
      if (tab === "delivered" && entry.order.status !== "delivered") return false;
      if (tab === "closed" && !["cancelled", "refunded"].includes(entry.order.status)) return false;
      if (!needle) return true;
      return (
        entry.order.orderNumber.toLowerCase().includes(needle) ||
        entry.order.customerName.toLowerCase().includes(needle) ||
        entry.items.some((item) => item.title.toLowerCase().includes(needle))
      );
    });
  }, [enriched, tab, query]);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const advance = (order: Order) => {
    const action = nextAction[order.status];
    if (!action) return;
    updateStatus.mutate(
      { orderId: order.id, status: action.next, note: `Vendor updated status to ${action.next}.` },
      {
        onSuccess: () => toast.success(`Order marked ${action.next}`, { description: `#${order.orderNumber}` }),
      },
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Fulfilment</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Orders</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage packing, shipping and delivery for {vendor.name}.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="warning" className="text-[0.55rem]"><Clock3 className="size-3" /> {counts.open} open</Badge>
          <Badge variant="success" className="text-[0.55rem]"><CheckCircle2 className="size-3" /> {counts.delivered} delivered</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: "Total orders", value: counts.all, icon: Package },
          { label: "Awaiting action", value: counts.open, icon: Clock3 },
          { label: "In transit", value: counts.shipped, icon: Truck },
          { label: "Delivered", value: counts.delivered, icon: CheckCircle2 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-3.5">
            <stat.icon className="size-3.5 text-muted-foreground" />
            <p className="mt-2 text-lg font-semibold tabular-nums">{stat.value}</p>
            <p className="text-[0.6rem] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[0.65rem] font-medium transition-colors ${
                  tab === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {item.label}
                <span className="ml-1 opacity-60">{counts[item.id as keyof typeof counts]}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search order, customer, product…"
              className="h-9 rounded-full pl-8 text-xs"
              aria-label="Search orders"
            />
          </div>
        </div>

        {list.length === 0 ? (
          <div className="p-10 text-center">
            <Package className="mx-auto size-7 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-semibold">No orders here</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Orders appear as soon as a customer checks out with one of your products.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-border text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-2.5">Order</th>
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="px-4 py-2.5">Items</th>
                  <th className="px-4 py-2.5 text-right">Your revenue</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map(({ order, items, value, units }) => {
                  const action = nextAction[order.status];
                  return (
                    <tr key={order.id} className="text-xs transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <button onClick={() => setActive(order)} className="text-left font-semibold hover:underline">
                          #{order.orderNumber}
                        </button>
                        <p className="text-[0.55rem] text-muted-foreground">
                          {formatDate(order.placedAt, { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-[0.55rem] text-muted-foreground">{order.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {items.slice(0, 2).map((item) => (
                              <ProductImage key={item.id} src={item.image} alt={item.title} className="size-7 rounded-md border border-card" sizes="28px" />
                            ))}
                          </div>
                          <span className="text-[0.6rem] text-muted-foreground">{units} units</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {formatCurrency(value, order.totals.currency)}
                      </td>
                      <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="xs" onClick={() => setActive(order)}>View</Button>
                          {action && (
                            <Button
                              size="xs"
                              onClick={() => advance(order)}
                              loading={updateStatus.isPending}
                            >
                              {action.label} <ArrowRight className="size-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(value) => !value && setActive(null)}>
        <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
          {active && <OrderDetail order={active} vendorId={vendor.ownerId} productIds={products.map((product) => product.id)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrderDetail({ order, vendorId, productIds }: { order: Order; vendorId: string; productIds: string[] }) {
  const items = order.items.filter((item) => item.vendorId === vendorId || productIds.includes(item.productId));
  const value = roundCurrency(items.reduce((sum, item) => sum + item.lineTotal, 0));

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex flex-wrap items-center gap-2">
          Order #{order.orderNumber} <OrderStatusBadge status={order.status} />
        </DialogTitle>
        <DialogDescription>
          Placed {formatDate(order.placedAt, { dateStyle: "long" })} by {order.customerName}
        </DialogDescription>
      </DialogHeader>

      <div className="rounded-xl border border-border bg-card p-3.5">
        <p className="flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <MapPin className="size-3.5" /> Ship to
        </p>
        <address className="mt-1.5 text-xs not-italic leading-relaxed text-foreground/80">
          <span className="font-semibold text-foreground">{order.shippingAddress.recipientName}</span>
          <br />
          {order.shippingAddress.line1}
          {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
          <br />
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          <br />
          {order.shippingAddress.country} · {order.shippingAddress.phone}
        </address>
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3">
            <ProductImage src={item.image} alt={item.title} className="size-12 rounded-lg" sizes="48px" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{item.title}</p>
              <p className="text-[0.58rem] text-muted-foreground">
                {item.variantLabel ?? "Standard"} · Qty {item.quantity} · {formatCurrency(item.price, order.totals.currency)}
              </p>
            </div>
            <p className="text-xs font-semibold tabular-nums">{formatCurrency(item.lineTotal, order.totals.currency)}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3 text-xs">
        <span className="text-muted-foreground">Your revenue from this order</span>
        <span className="font-semibold tabular-nums">{formatCurrency(value, order.totals.currency)}</span>
      </div>

      <OrderTimeline order={order} />
    </>
  );
}
