import Link from "next/link";
import { ArrowUpRight, BadgeCheck, MapPin, Star } from "lucide-react";
import type { Product, Vendor } from "@/types";
import { ProductImage } from "@/components/ui/product-image";
import { Badge } from "@/components/ui/badge";

export function VendorCard({ vendor, products }: { vendor: Vendor; products: Product[] }) {
  const count = products.filter((product) => product.storeId === vendor.id && product.status === "active").length;
  const categories = Array.from(
    new Set(products.filter((product) => product.storeId === vendor.id).map((product) => product.categoryLabel)),
  ).slice(0, 2);
  const location = vendor.address?.city
    ? `${vendor.address.city}${vendor.address.country ? `, ${vendor.address.country}` : ""}`
    : "Independent studio";

  return (
    <Link
      href={`/vendors/${vendor.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-soft"
    >
      <div className="relative h-40 overflow-hidden bg-muted sm:h-44">
        <ProductImage
          src={vendor.banner}
          alt={`${vendor.name} studio`}
          className="size-full"
          sizes="(max-width: 768px) 100vw, 50vw"
          imageClassName="transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <div className="absolute left-4 top-4 flex gap-1.5">
          {vendor.isVerified && (
            <Badge variant="glass" className="gap-1">
              <BadgeCheck className="size-3" /> Verified
            </Badge>
          )}
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <ProductImage
            src={vendor.logo}
            alt={vendor.name}
            className="size-14 rounded-2xl border-2 border-white/70 shadow-md"
            sizes="56px"
          />
          <span className="flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 text-[0.6rem] font-semibold text-white backdrop-blur-md">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            {vendor.rating.average.toFixed(1)}
            <span className="font-normal text-white/60">({vendor.rating.count})</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold tracking-tight">{vendor.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-[0.62rem] text-muted-foreground">
              <MapPin className="size-3" /> {location}
            </p>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>

        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{vendor.description}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <Badge key={category} variant="muted" className="text-[0.55rem]">
                {category}
              </Badge>
            ))}
          </div>
          <span className="shrink-0 text-[0.62rem] font-medium text-muted-foreground">
            {count} {count === 1 ? "object" : "objects"}
          </span>
        </div>
      </div>
    </Link>
  );
}
