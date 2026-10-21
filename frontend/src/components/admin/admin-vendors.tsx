"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Check,
  ExternalLink,
  Search,
  ShieldAlert,
  Store,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { Store as StoreRecord } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductImage } from "@/components/ui/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMounted } from "@/hooks/use-mounted";
import { useDemoStore } from "@/stores/demo-store";
import { formatCurrency, formatDate, roundCurrency } from "@/lib/utils";

const tabs = [
  { id: "all", label: "All vendors" },
  { id: "pending", label: "Pending" },
  { id: "active", label: "Active" },
  { id: "suspended", label: "Suspended" },
];

const actionFor = (status: StoreRecord["status"]) =>
  status === "pending"
    ? { label: "Approve vendor", next: "active" as const, tone: "primary" as const }
    : status === "active"
      ? { label: "Suspend vendor", next: "suspended" as const, tone: "outline" as const }
      : { label: "Reinstate vendor", next: "active" as const, tone: "primary" as const };

export function AdminVendors() {
  const mounted = useMounted();
  const vendors = useDemoStore((state) => state.vendors);
  const products = useDemoStore((state) => state.products);
  const orders = useDemoStore((state) => state.orders);
  const updateVendorStatus = useDemoStore((state) => state.updateVendorStatus);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [pendingChange, setPendingChange] = useState<{ id: string; name: string; status: StoreRecord["status"] } | null>(null);

  const rows = useMemo(
    () =>
      vendors.map((vendor) => {
        const vendorProducts = products.filter((product) => product.vendorId === vendor.ownerId);
        const vendorOrders = orders.filter((order) => order.items.some((item) => item.vendorId === vendor.ownerId));
        const items = vendorOrders.flatMap((order) =>
          order.items.filter((item) => item.vendorId === vendor.ownerId),
        );
        const gmv = roundCurrency(items.reduce((sum, item) => sum + item.lineTotal, 0));
        return {
          vendor,
          products: vendorProducts.length,
          orders: vendorOrders.length,
          gmv,
          commission: roundCurrency(gmv * (vendor.settings.commissionRate / 100)),
        };
      }),
    [vendors, products, orders],
  );

  const counts = useMemo(
    () => ({
      all: vendors.length,
      pending: vendors.filter((vendor) => vendor.status === "pending").length,
      active: vendors.filter((vendor) => vendor.status === "active").length,
      suspended: vendors.filter((vendor) => vendor.status === "suspended").length,
    }),
    [vendors],
  );

  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (tab !== "all" && row.vendor.status !== tab) return false;
      if (!needle) return true;
      return (
        row.vendor.name.toLowerCase().includes(needle) ||
        row.vendor.ownerName.toLowerCase().includes(needle) ||
        row.vendor.ownerEmail.toLowerCase().includes(needle)
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

  const confirmChange = () => {
    if (!pendingChange) return;
    updateVendorStatus(pendingChange.id, pendingChange.status);
    toast.success(pendingChange.status === "active" ? "Vendor approved" : "Vendor suspended", {
      description: pendingChange.name,
    });
    setPendingChange(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Governance</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Vendors</h1>
          <p className="mt-1 text-xs text-muted-foreground">Approve storefronts, monitor performance, manage access.</p>
        </div>
        <Badge variant="warning" className="text-[0.55rem]">
          <ShieldAlert className="size-3" /> {counts.pending} awaiting review
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {[
          { label: "Total vendors", value: counts.all, icon: Store },
          { label: "Pending approval", value: counts.pending, icon: ShieldAlert },
          { label: "Active storefronts", value: counts.active, icon: BadgeCheck },
          { label: "Suspended", value: counts.suspended, icon: Users },
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
              placeholder="Search vendor or owner…"
              className="h-9 rounded-full pl-8 text-xs"
              aria-label="Search vendors"
            />
          </div>
        </div>

        {list.length === 0 ? (
          <div className="p-10 text-center">
            <Store className="mx-auto size-7 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-semibold">No vendors match</p>
            <p className="mt-1 text-xs text-muted-foreground">Adjust the filter or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left">
              <thead>
                <tr className="border-b border-border text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-2.5">Store</th>
                  <th className="px-4 py-2.5">Owner</th>
                  <th className="px-4 py-2.5 text-right">Catalog</th>
                  <th className="px-4 py-2.5 text-right">Orders</th>
                  <th className="px-4 py-2.5 text-right">GMV</th>
                  <th className="px-4 py-2.5 text-right">Commission</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map(({ vendor, products: catalog, orders: orderCount, gmv, commission }) => {
                  const action = actionFor(vendor.status);
                  return (
                    <tr key={vendor.id} className="text-xs transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <ProductImage src={vendor.logo} alt={vendor.name} className="size-9 rounded-lg" sizes="36px" />
                          <div className="min-w-0">
                            <p className="flex items-center gap-1 truncate font-semibold">
                              {vendor.name}
                              {vendor.isVerified && <BadgeCheck className="size-3 shrink-0 text-primary" />}
                            </p>
                            <p className="text-[0.55rem] text-muted-foreground">
                              {vendor.rating.average.toFixed(1)} ★ · joined {formatDate(vendor.joinedAt, { month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{vendor.ownerName}</p>
                        <p className="text-[0.55rem] text-muted-foreground">{vendor.ownerEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{catalog}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{orderCount}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {formatCurrency(gmv, vendor.settings.currency, 0)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {formatCurrency(commission, vendor.settings.currency, 0)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={vendor.status === "active" ? "success" : vendor.status === "pending" ? "warning" : "danger"}
                          dot
                          className="text-[0.5rem] capitalize"
                        >
                          {vendor.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button asChild variant="ghost" size="xs">
                            <Link href={`/vendors/${vendor.slug}`} aria-label={`View ${vendor.name} storefront`}>
                              <ExternalLink className="size-3" />
                            </Link>
                          </Button>
                          <Button
                            variant={action.tone}
                            size="xs"
                            onClick={() => setPendingChange({ id: vendor.id, name: vendor.name, status: action.next })}
                          >
                            {action.label}
                          </Button>
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

      <Dialog open={Boolean(pendingChange)} onOpenChange={(value) => !value && setPendingChange(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pendingChange?.status === "suspended" ? "Suspend vendor" : "Approve vendor"}
            </DialogTitle>
            <DialogDescription>
              {pendingChange?.status === "suspended"
                ? `${pendingChange?.name} will be hidden from the marketplace and unable to fulfil new orders. Existing orders remain visible.`
                : `${pendingChange?.name} will become visible in the marketplace and can start selling immediately.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setPendingChange(null)}>Cancel</Button>
            <Button
              size="sm"
              variant={pendingChange?.status === "suspended" ? "destructive" : "primary"}
              onClick={confirmChange}
            >
              {pendingChange?.status === "suspended" ? "Suspend" : <><Check className="size-3.5" /> Confirm</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
