"use client";

import Link from "next/link";
import {
  ArrowRight,
  Heart,
  MapPin,
  Package,
  ShoppingBag,
  Sparkles,
  Truck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { OrderCard } from "@/components/orders/order-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { Skeleton } from "@/components/ui/skeleton";
import { Price } from "@/components/ui/price";
import { useCurrentOrders, useWishlistProducts } from "@/hooks/queries";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { formatCurrency, formatDate, formatNumber, initials } from "@/lib/utils";

export function AccountOverview() {
  const user = useAuthStore((state) => state.user);
  const { data: orders, isLoading } = useCurrentOrders();
  const wishlist = useWishlistProducts();
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const addLine = useCartStore((state) => state.addLine);

  if (!user) return null;

  const list = orders ?? [];
  const inTransit = list.filter((order) => ["confirmed", "processing", "shipped"].includes(order.status));
  const delivered = list.filter((order) => order.status === "delivered");
  const spent = list
    .filter((order) => order.payment.status === "paid")
    .reduce((sum, order) => sum + order.totals.grandTotal, 0);
  const recent = list.slice(0, 3);
  const address = user.addresses?.find((item) => item.isDefault) ?? user.addresses?.[0];

  const stats = [
    { label: "Orders placed", value: formatNumber(list.length), icon: Package, hint: "All time" },
    { label: "In transit", value: formatNumber(inTransit.length), icon: Truck, hint: "On the way" },
    { label: "Delivered", value: formatNumber(delivered.length), icon: ShoppingBag, hint: "Kept forever" },
    { label: "Lifetime spend", value: formatCurrency(spent), icon: Wallet, hint: "Paid orders" },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Your account
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
            Hello, {user.name.split(" ")[0]}.
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Here&apos;s everything you&apos;ve been collecting lately.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/products">Keep shopping <ArrowRight className="size-3.5" /></Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
            <stat.icon className="size-4 text-muted-foreground" />
            <p className="mt-3 text-xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
            <p className="text-[0.65rem] font-medium">{stat.label}</p>
            <p className="text-[0.58rem] text-muted-foreground">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link href="/account/orders" className="text-[0.68rem] font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading &&
              Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-2xl" />
              ))}

            {!isLoading && recent.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <Package className="mx-auto size-7 text-muted-foreground/60" />
                <p className="mt-3 text-sm font-semibold">No orders yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your first considered object is waiting in the catalogue.
                </p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/products">Browse the catalogue</Link>
                </Button>
              </div>
            )}

            {recent.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {list.length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4">
              <div>
                <p className="text-xs font-semibold">Need to return something?</p>
                <p className="text-[0.65rem] text-muted-foreground">
                  30-day returns, handled by Nexvia from start to finish.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/support#returns">Start a return</Link>
              </Button>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-[0.65rem] text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2.5 border-t border-border pt-4 text-[0.68rem]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">{user.createdAt ? formatDate(user.createdAt, { month: "long", year: "numeric" }) : "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account type</span>
                <Badge variant="muted" className="capitalize">{user.role}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email status</span>
                <span className={user.isEmailVerified ? "font-medium text-success" : "font-medium text-amber-600"}>
                  {user.isEmailVerified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full">
              <Link href="/account/settings">Edit profile</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <MapPin className="size-3.5" /> Default address
            </p>
            {address ? (
              <address className="mt-2.5 text-xs not-italic leading-relaxed text-foreground/80">
                <span className="block font-semibold text-foreground">{address.recipientName}</span>
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <br />
                {address.city}, {address.state} {address.postalCode}
                <br />
                {address.country}
              </address>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">No saved address yet.</p>
            )}
          </div>
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Heart className="size-4 text-coral" /> Saved for later
          </h2>
          <Link href="/account/wishlist" className="text-[0.68rem] font-semibold text-primary hover:underline">
            View wishlist
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
            <Sparkles className="mx-auto size-6 text-muted-foreground/60" />
            <p className="mt-2 text-xs font-semibold">Nothing saved yet</p>
            <p className="mt-1 text-[0.65rem] text-muted-foreground">
              Tap the heart on any product to keep it here.
            </p>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {wishlist.slice(0, 4).map((product) => (
              <div key={product.id} className="group flex gap-3 rounded-2xl border border-border bg-card p-3">
                <Link href={`/products/${product.slug}`} className="shrink-0">
                  <ProductImage src={product.thumbnail} alt={product.title} className="size-16 rounded-xl" sizes="64px" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${product.slug}`} className="line-clamp-2 text-xs font-semibold hover:underline">
                    {product.title}
                  </Link>
                  <Price price={product.price} compareAt={product.compareAtPrice} currency={product.currency} size="sm" className="mt-1" />
                  <div className="mt-1.5 flex items-center gap-2">
                    <button
                      onClick={() => {
                        const option = product.variants[0]?.options[0];
                        addLine({
                          productId: product.id,
                          slug: product.slug,
                          title: product.title,
                          thumbnail: product.thumbnail,
                          price: product.price,
                          currency: product.currency,
                          quantity: 1,
                          stock: product.stock,
                          vendorId: product.vendorId,
                          storeId: product.storeId,
                          storeName: product.storeName,
                          variant: option ? { [product.variants[0].name.toLowerCase()]: option.value } : undefined,
                          variantLabel: option?.label,
                        });
                        toast.success("Added to cart", { description: product.title });
                      }}
                      className="text-[0.6rem] font-semibold text-primary hover:underline"
                    >
                      Add to cart
                    </button>
                    <button
                      onClick={() => {
                        toggleWishlist(product.id);
                        toast.success("Removed from wishlist");
                      }}
                      className="text-[0.6rem] text-muted-foreground hover:text-danger"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="relative overflow-hidden rounded-2xl bg-[#0c1512] p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full bg-accent/20 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Badge variant="accent">Nexvia Circle</Badge>
            <h2 className="mt-3 font-display text-2xl">Early access, quietly delivered.</h2>
            <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-white/60">
              Members get first look at new vendor drops, free express shipping over $150, and
              invitations to studio open houses.
            </p>
          </div>
          <Button variant="glass" size="sm" asChild>
            <Link href="/support#circle">Explore membership</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
