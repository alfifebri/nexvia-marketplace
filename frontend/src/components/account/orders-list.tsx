"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Package, Search, X } from "lucide-react";
import type { OrderStatus } from "@/types";
import { OrderCard } from "@/components/orders/order-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentOrders } from "@/hooks/queries";
import { cn } from "@/lib/utils";

const tabs: { id: string; label: string; statuses?: OrderStatus[] }[] = [
  { id: "all", label: "All orders" },
  { id: "active", label: "In progress", statuses: ["pending", "confirmed", "processing", "shipped"] },
  { id: "delivered", label: "Delivered", statuses: ["delivered"] },
  { id: "cancelled", label: "Cancelled & refunded", statuses: ["cancelled", "refunded"] },
];

export function OrdersList() {
  const { data: orders, isLoading } = useCurrentOrders();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const sorted = [...(orders ?? [])].sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
    );
    const activeTab = tabs.find((item) => item.id === tab);
    const filtered = activeTab?.statuses
      ? sorted.filter((order) => activeTab.statuses!.includes(order.status))
      : sorted;
    const needle = query.trim().toLowerCase();
    if (!needle) return filtered;
    return filtered.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(needle) ||
        order.items.some((item) => item.title.toLowerCase().includes(needle)),
    );
  }, [orders, tab, query]);

  const counts = useMemo(() => {
    const all = orders ?? [];
    return {
      all: all.length,
      active: all.filter((order) =>
        ["pending", "confirmed", "processing", "shipped"].includes(order.status),
      ).length,
      delivered: all.filter((order) => order.status === "delivered").length,
      cancelled: all.filter((order) => ["cancelled", "refunded"].includes(order.status)).length,
    };
  }, [orders]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Purchase history
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Your orders</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Track deliveries, revisit receipts and reorder favourites.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/products">Shop again</Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-[0.68rem] font-medium transition-colors",
                tab === item.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground",
              )}
            >
              {item.label}
              <span className={cn("ml-1.5 tabular-nums", tab === item.id ? "text-primary-foreground/60" : "text-muted-foreground/70")}>
                {counts[item.id as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search orders…"
            aria-label="Search orders"
            className="h-9 w-full rounded-full border border-border bg-card pl-8 pr-8 text-xs outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-2xl" />)}

        {!isLoading && list.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <Package className="mx-auto size-8 text-muted-foreground/50" />
            <h2 className="mt-3 text-sm font-semibold">
              {query ? "No orders match that search" : "Nothing here yet"}
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
              {query
                ? "Try an order number or a product name."
                : tab === "all"
                  ? "When you place your first order, it will appear here with live tracking."
                  : "No orders in this stage right now."}
            </p>
            {tab === "all" && !query && (
              <Button asChild size="sm" className="mt-4">
                <Link href="/products">Find something to keep</Link>
              </Button>
            )}
          </div>
        )}

        {list.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
