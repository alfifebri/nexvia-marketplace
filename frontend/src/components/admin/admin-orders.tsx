"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  CircleDollarSign,
  Package,
  RotateCcw,
  Search,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@/types";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductImage } from "@/components/ui/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMounted } from "@/hooks/use-mounted";
import { useUpdateOrderStatus } from "@/hooks/queries";
import { useDemoStore } from "@/stores/demo-store";
import { formatCurrency, formatDate } from "@/lib/utils";

const tabs = [
  { id: "all", label: "All orders" },
  { id: "open", label: "Open" },
  { id: "shipped", label: "In transit" },
  { id: "delivered", label: "Delivered" },
  { id: "closed", label: "Cancelled / refunded" },
];

export function AdminOrders() {
  const mounted = useMounted();
  const orders = useDemoStore((state) => state.orders);
  const vendors = useDemoStore((state) => state.vendors);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Order | null>(null);

  const rows = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
        .map((order) => {
          const vendorNames = [...new Set(
            order.items.map((item) => vendors.find((vendor) => vendor.ownerId === item.vendorId)?.name ?? "Marketplace"),
          )];
          return { order, vendorNames };
        }),
    [orders, vendors],
  );

  const counts = useMemo(
    () => ({
      all: rows.length,
      open: rows.filter(({ order }) => ["pending", "confirmed", "processing"].includes(order.status)).length,
      shipped: rows.filter(({ order }) => order.status === "shipped").length,
      delivered: rows.filter(({ order }) => order.status === "delivered").length,
      closed: rows.filter(({ order }) => ["cancelled", "refunded"].includes(order.status)).length,
    }),
    [rows],
  );

  const gross = useMemo(
    () =>
      orders
        .filter((order) => !["cancelled", "refunded"].includes(order.status))
        .reduce((sum, order) => sum + order.totals.grandTotal, 0),
    [orders],
  );

  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter(({ order }) => {
      if (tab === "open" && !["pending", "confirmed", "processing"].includes(order.status)) return false;
      if (tab === "shipped" && order.status !== "shipped") return false;
      if (tab === "delivered" && order.status !== "delivered") return false;
      if (tab === "closed" && !["cancelled", "refunded"].includes(order.status)) return false;
      if (!needle) return true;
      return (
        order.orderNumber.toLowerCase().includes(needle) ||
        order.customerName.toLowerCase().includes(needle) ||
        order.customerEmail.toLowerCase().includes(needle) ||
        order.items.some((item) => item.title.toLowerCase().includes(needle))
      );
    });
  }, [rows, tab, query]);

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Operations</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Order monitoring</h1>
        <p className="mt-1 text-xs text-muted-foreground">Every transaction across the marketplace in one feed.</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: "Orders recorded", value: counts.all.toLocaleString(), icon: ShoppingBag },
          { label: "Open fulfilment", value: String(counts.open), icon: Package },
          { label: "Net order value", value: formatCurrency(gross, "USD", 0), icon: CircleDollarSign },
          { label: "In transit", value: String(counts.shipped), icon: Truck },
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
              placeholder="Search order, customer, item…"
              className="h-9 rounded-full pl-8 text-xs"
              aria-label="Search orders"
            />
          </div>
        </div>

        {list.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingBag className="mx-auto size-7 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-semibold">No orders match</p>
            <p className="mt-1 text-xs text-muted-foreground">Try a different status or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-border text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-2.5">Order</th>
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="px-4 py-2.5">Vendors</th>
                  <th className="px-4 py-2.5">Payment</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map(({ order, vendorNames }) => (
                  <tr key={order.id} className="text-xs transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <button onClick={() => setActive(order)} className="text-left font-semibold hover:underline">
                        #{order.orderNumber}
                      </button>
                      <p className="text-[0.55rem] text-muted-foreground">{formatDate(order.placedAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-[0.55rem] text-muted-foreground">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-40 truncate text-[0.62rem] text-muted-foreground">{vendorNames.join(", ")}</p>
                      <p className="text-[0.55rem] text-muted-foreground">{order.items.length} line items</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={order.payment.status === "paid" ? "success" : order.payment.status === "refunded" ? "info" : "warning"} className="text-[0.5rem] capitalize">
                        {order.payment.status}
                      </Badge>
                      <p className="mt-0.5 text-[0.55rem] uppercase text-muted-foreground">{order.payment.method}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatCurrency(order.totals.grandTotal, order.totals.currency)}
                    </td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="xs" onClick={() => setActive(order)}>Inspect</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(value) => !value && setActive(null)}>
        <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto">
          {active && <AdminOrderDetail order={active} onClose={() => setActive(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminOrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  const vendors = useDemoStore((state) => state.vendors);
  const updateStatus = useUpdateOrderStatus();
  const [confirming, setConfirming] = useState<"cancelled" | "refunded" | null>(null);

  const canCancel = !["shipped", "delivered", "cancelled", "refunded"].includes(order.status);
  const canRefund = ["shipped", "delivered"].includes(order.status) && order.payment.status === "paid";

  const apply = (status: "cancelled" | "refunded") => {
    updateStatus.mutate(
      {
        orderId: order.id,
        status,
        paymentStatus: status === "refunded" ? "refunded" : undefined,
        note: `Marketplace admin set status to ${status}.`,
      },
      {
        onSuccess: () => {
          toast.success(status === "refunded" ? "Refund issued" : "Order cancelled", {
            description: `#${order.orderNumber}`,
          });
          onClose();
        },
      },
    );
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex flex-wrap items-center gap-2">
          #{order.orderNumber} <OrderStatusBadge status={order.status} />
        </DialogTitle>
        <DialogDescription>
          {formatDate(order.placedAt, { dateStyle: "long" })} · {order.customerName} · {order.payment.method.toUpperCase()}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Shipping address</p>
          <p className="mt-1.5 text-[0.65rem] font-semibold">{order.shippingAddress.recipientName}</p>
          <p className="text-[0.62rem] leading-relaxed text-muted-foreground">
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country} · {order.shippingAddress.phone}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Payment</p>
          <p className="mt-1.5 text-[0.65rem] font-semibold uppercase">{order.payment.status} · {order.payment.method}</p>
          <p className="text-[0.62rem] text-muted-foreground">{order.customerEmail}</p>
          <div className="mt-2 space-y-1 border-t border-border pt-2 text-[0.62rem]">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{formatCurrency(order.totals.itemsTotal, order.totals.currency)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="tabular-nums">{formatCurrency(order.totals.shippingFee, order.totals.currency)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="tabular-nums">{formatCurrency(order.totals.tax, order.totals.currency)}</span></div>
            {order.totals.discount > 0 && (
              <div className="flex justify-between text-success"><span>Discount</span><span className="tabular-nums">−{formatCurrency(order.totals.discount, order.totals.currency)}</span></div>
            )}
            <div className="flex justify-between border-t border-border pt-1 text-xs font-semibold"><span>Total</span><span className="tabular-nums">{formatCurrency(order.totals.grandTotal, order.totals.currency)}</span></div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3">
            <ProductImage src={item.image} alt={item.title} className="size-11 rounded-lg" sizes="44px" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{item.title}</p>
              <p className="text-[0.55rem] text-muted-foreground">
                {vendors.find((vendor) => vendor.ownerId === item.vendorId)?.name ?? "Marketplace"} · Qty {item.quantity}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold tabular-nums">{formatCurrency(item.lineTotal, order.totals.currency)}</p>
              <p className="text-[0.5rem] text-muted-foreground">fee {formatCurrency(item.platformFee, order.totals.currency)}</p>
            </div>
          </div>
        ))}
      </div>

      <OrderTimeline order={order} />

      {(canCancel || canRefund) && (
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          {confirming ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[0.65rem] font-medium">
                {confirming === "cancelled"
                  ? "Cancel this order and release all items?"
                  : `Refund ${formatCurrency(order.totals.grandTotal, order.totals.currency)} to the customer?`}
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="xs" onClick={() => setConfirming(null)}>Back</Button>
                <Button
                  variant={confirming === "refunded" ? "destructive" : "primary"}
                  size="xs"
                  loading={updateStatus.isPending}
                  onClick={() => apply(confirming)}
                >
                  Confirm {confirming === "refunded" ? "refund" : "cancellation"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[0.62rem] text-muted-foreground">Admin overrides are recorded in the order timeline.</p>
              <div className="flex gap-2">
                {canRefund && (
                  <Button variant="outline" size="xs" onClick={() => setConfirming("refunded")}>
                    <RotateCcw className="size-3" /> Issue refund
                  </Button>
                )}
                {canCancel && (
                  <Button variant="outline" size="xs" onClick={() => setConfirming("cancelled")}>
                    <Ban className="size-3" /> Cancel order
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
