"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Banknote, ExternalLink, ImagePlus, Save, Store } from "lucide-react";
import { toast } from "sonner";
import type { Vendor } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { ProductImage } from "@/components/ui/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import { useMounted } from "@/hooks/use-mounted";
import { useVendorWorkspace } from "@/hooks/queries";
import { useDemoStore } from "@/stores/demo-store";
import { formatCurrency, formatDate } from "@/lib/utils";

export function VendorStorefront() {
  const mounted = useMounted();
  const { vendor, products } = useVendorWorkspace();

  if (!mounted) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Skeleton className="h-[520px] rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return <StorefrontForm vendor={vendor} productCount={products.length} />;
}

function StorefrontForm({ vendor, productCount }: { vendor: Vendor; productCount: number }) {
  const updateVendorProfile = useDemoStore((state) => state.updateVendorProfile);
  const [form, setForm] = useState({
    name: vendor.name,
    description: vendor.description,
    logo: vendor.logo,
    banner: vendor.banner,
    email: vendor.email,
    phone: vendor.phone,
    website: vendor.socials?.website ?? "",
    instagram: vendor.socials?.instagram ?? "",
    shipping: vendor.policies?.shipping ?? "",
    returns: vendor.policies?.returns ?? "",
    city: vendor.address?.city ?? "",
    country: vendor.address?.country ?? "",
  });
  const [pending, setPending] = useState(false);

  const update = (patch: Partial<typeof form>) => setForm((current) => ({ ...current, ...patch }));

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error("Store name is too short.");
      return;
    }
    if (form.description.trim().length < 20) {
      toast.error("Tell customers a little more about your studio.");
      return;
    }
    setPending(true);
    updateVendorProfile(vendor.id, {
      name: form.name.trim(),
      description: form.description.trim(),
      logo: form.logo.trim(),
      banner: form.banner.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      socials: {
        ...vendor.socials,
        website: form.website.trim() || undefined,
        instagram: form.instagram.trim() || undefined,
      },
      policies: {
        ...vendor.policies,
        shipping: form.shipping.trim(),
        returns: form.returns.trim(),
      },
      address: {
        ...vendor.address,
        city: form.city.trim(),
        country: form.country.trim(),
      },
    });
    window.setTimeout(() => {
      setPending(false);
      toast.success("Storefront updated", { description: "Your public page reflects the changes." });
    }, 350);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Public presence</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">Storefront</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            How {vendor.name} shows up across the marketplace.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/vendors/${vendor.slug}`}>
            View live page <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <form onSubmit={save} className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Brand</h2>
            <div className="mt-4 space-y-3.5">
              <Field label="Store name">
                <Input value={form.name} onChange={(event) => update({ name: event.target.value })} />
              </Field>
              <Field label="Description" hint="Shown on your storefront and vendor card">
                <Textarea
                  value={form.description}
                  onChange={(event) => update({ description: event.target.value })}
                  className="min-h-24"
                  maxLength={500}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Logo URL">
                  <Input value={form.logo} onChange={(event) => update({ logo: event.target.value })} placeholder="https://…" />
                </Field>
                <Field label="Banner URL">
                  <Input value={form.banner} onChange={(event) => update({ banner: event.target.value })} placeholder="https://…" />
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Contact & social</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(event) => update({ email: event.target.value })} />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(event) => update({ phone: event.target.value })} />
              </Field>
              <Field label="Website">
                <Input value={form.website} onChange={(event) => update({ website: event.target.value })} placeholder="https://studio.com" />
              </Field>
              <Field label="Instagram">
                <Input value={form.instagram} onChange={(event) => update({ instagram: event.target.value })} placeholder="@studio" />
              </Field>
              <Field label="City">
                <Input value={form.city} onChange={(event) => update({ city: event.target.value })} />
              </Field>
              <Field label="Country">
                <Input value={form.country} onChange={(event) => update({ country: event.target.value })} />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Policies</h2>
            <p className="text-[0.62rem] text-muted-foreground">Clear policies reduce support tickets and returns.</p>
            <div className="mt-4 space-y-3.5">
              <Field label="Shipping policy">
                <Textarea
                  value={form.shipping}
                  onChange={(event) => update({ shipping: event.target.value })}
                  className="min-h-20"
                  placeholder="Dispatch times, carriers, free shipping thresholds…"
                />
              </Field>
              <Field label="Returns policy">
                <Textarea
                  value={form.returns}
                  onChange={(event) => update({ returns: event.target.value })}
                  className="min-h-20"
                  placeholder="Return window, condition requirements…"
                />
              </Field>
            </div>
          </section>

          <div className="flex justify-end">
            <Button type="submit" loading={pending}>
              <Save className="size-4" /> Save storefront
            </Button>
          </div>
        </form>

        <aside className="space-y-3 xl:sticky xl:top-24">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative h-32 bg-muted">
              {form.banner ? (
                <ProductImage src={form.banner} alt="Banner preview" className="size-full" sizes="360px" />
              ) : (
                <div className="grid size-full place-items-center text-muted-foreground"><ImagePlus className="size-5" /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-end gap-2.5">
                <ProductImage src={form.logo} alt="Logo preview" className="size-11 rounded-xl border-2 border-white/70" sizes="44px" />
                <div className="pb-0.5 text-white">
                  <p className="flex items-center gap-1 text-sm font-semibold">
                    {form.name || "Store name"}
                    {vendor.isVerified && <BadgeCheck className="size-3.5 text-accent" />}
                  </p>
                  <p className="text-[0.55rem] text-white/60">
                    {[form.city, form.country].filter(Boolean).join(", ") || "Location"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <p className="line-clamp-3 text-[0.65rem] leading-relaxed text-muted-foreground">
                {form.description || "Your store description preview."}
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[0.6rem]">
                <span className="text-muted-foreground">{productCount} objects · {vendor.rating.average.toFixed(1)} ★</span>
                <span className="flex items-center gap-1 font-semibold text-primary">
                  Live preview <ExternalLink className="size-2.5" />
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Store className="size-3.5" /> Store status
            </p>
            <div className="mt-2.5 flex items-center justify-between">
              <Badge variant="success" dot className="text-[0.5rem] capitalize">{vendor.status}</Badge>
              <span className="text-[0.58rem] text-muted-foreground">Since {formatDate(vendor.createdAt, { month: "short", year: "numeric" })}</span>
            </div>
            <p className="mt-2.5 text-[0.6rem] leading-relaxed text-muted-foreground">
              Changes are reviewed by the marketplace team only when store policies change materially.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Banknote className="size-3.5" /> Commercial terms
            </p>
            <div className="mt-2.5 space-y-1.5 text-[0.65rem]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commission</span>
                <span className="font-semibold">{vendor.settings.commissionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Free shipping over</span>
                <span className="font-semibold">{formatCurrency(vendor.settings.freeShippingThreshold, "USD", 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payout schedule</span>
                <span className="font-semibold">Weekly · Fri</span>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
              <Link href="/vendor/settings">Manage settings</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
