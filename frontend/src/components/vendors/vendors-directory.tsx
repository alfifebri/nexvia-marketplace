"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Search, Sparkles, Store, X } from "lucide-react";
import { VendorCard } from "@/components/vendors/vendor-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/hooks/use-mounted";
import { useDemoStore } from "@/stores/demo-store";
import { formatNumber } from "@/lib/utils";

export function VendorsDirectory() {
  const mounted = useMounted();
  const vendors = useDemoStore((state) => state.vendors);
  const products = useDemoStore((state) => state.products);
  const [query, setQuery] = useState("");

  const active = useMemo(() => vendors.filter((vendor) => vendor.status === "active"), [vendors]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return active;
    return active.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(needle) ||
        vendor.description.toLowerCase().includes(needle) ||
        vendor.address?.city?.toLowerCase().includes(needle) ||
        vendor.address?.country?.toLowerCase().includes(needle) ||
        products.some(
          (product) =>
            product.storeId === vendor.id &&
            (product.categoryLabel.toLowerCase().includes(needle) ||
              product.title.toLowerCase().includes(needle)),
        ),
    );
  }, [active, products, query]);

  if (!mounted) {
    return (
      <div className="container-page py-12">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-3 h-12 w-96 max-w-full" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-80 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
        <div className="container-page relative py-12 sm:py-16">
          <p className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="size-3.5 text-coral" /> The maker directory
          </p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
                Independent studios,
                <br />
                <span className="font-display font-normal italic text-primary">one considered place.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Every vendor on Nexvia is reviewed by a human, paid on time and accountable for what they
                ship. Meet the people behind the objects.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-6 lg:gap-8">
              {[
                { value: formatNumber(active.length), label: "Vetted makers" },
                { value: "4.8", label: "Avg. rating" },
                { value: "32", label: "Countries served" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                  <p className="text-[0.62rem] text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-8 lg:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search makers, cities or crafts…"
              className="h-10 rounded-full pl-10 pr-9 text-xs"
              aria-label="Search vendors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          <p className="text-[0.65rem] text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {active.length} makers
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Store className="mx-auto size-8 text-muted-foreground/50" />
            <h2 className="mt-3 text-lg font-semibold">No makers match that</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different craft, city or product — or browse the full catalogue.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuery("")}>Clear search</Button>
              <Button size="sm" asChild><Link href="/products">Shop all</Link></Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} products={products} />
            ))}
          </div>
        )}

        <div className="relative mt-12 overflow-hidden rounded-3xl bg-[#0c1512] p-7 text-white sm:p-10">
          <div className="pointer-events-none absolute inset-0 dot-overlay opacity-[0.12]" aria-hidden />
          <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-accent/20 blur-[90px]" aria-hidden />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-lg">
              <p className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/45">
                <BadgeCheck className="size-3.5 text-accent" /> Open call
              </p>
              <h2 className="mt-2.5 font-display text-3xl">Make something worth keeping?</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Bring your studio to Nexvia. Transparent 9–14% commission, weekly payouts and a storefront
                that respects your brand.
              </p>
            </div>
            <Button variant="accent" size="lg" asChild>
              <Link href="/register?next=/vendor">
                Apply to sell <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
