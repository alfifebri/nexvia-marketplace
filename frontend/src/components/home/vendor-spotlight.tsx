import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, MapPin, Star } from "lucide-react";
import { demoVendors } from "@/lib/demo/vendors";
import { demoProducts } from "@/lib/demo/products";
import { ProductImage } from "@/components/ui/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { formatCurrency } from "@/lib/utils";

export function VendorSpotlight() {
  const vendor = demoVendors[0];
  const products = demoProducts.filter((product) => product.vendorId === vendor.ownerId).slice(0, 3);

  return (
    <section className="container-page section-pad">
      <Reveal>
        <div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft lg:rounded-[2.5rem]">
          <div className="relative h-44 sm:h-56">
            <ProductImage
              src={vendor.banner}
              alt={`${vendor.name} studio`}
              className="size-full"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-4 sm:inset-x-8">
              <div className="flex items-end gap-4">
                <div className="size-16 overflow-hidden rounded-2xl border-2 border-white/70 bg-white shadow-lg sm:size-20">
                  <ProductImage src={vendor.logo} alt={vendor.name} className="size-full" sizes="80px" />
                </div>
                <div className="pb-1 text-white">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{vendor.name}</h2>
                    <BadgeCheck className="size-5 text-accent" />
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[0.68rem] text-white/70">
                    <MapPin className="size-3" /> Copenhagen, Denmark · Since 2021
                  </p>
                </div>
              </div>
              <Button asChild variant="glass" size="sm" className="hidden sm:inline-flex">
                <Link href={`/vendors/${vendor.slug}`}>
                  Visit store <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
            <div>
              <div className="flex flex-wrap items-center gap-5">
                <div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-1 text-sm font-semibold">{vendor.rating.average}</span>
                  </div>
                  <p className="mt-0.5 text-[0.65rem] text-muted-foreground">
                    {vendor.rating.count} store reviews
                  </p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-sm font-semibold">{demoProducts.filter((p) => p.vendorId === vendor.ownerId).length} products</p>
                  <p className="text-[0.65rem] text-muted-foreground">Made in small batches</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-sm font-semibold">Fast dispatch</p>
                  <p className="text-[0.65rem] text-muted-foreground">Ships within 24 hours</p>
                </div>
              </div>

              <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
                “{vendor.description}”
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="secondary">Acoustics</Badge>
                <Badge variant="secondary">Repairable</Badge>
                <Badge variant="secondary">Plastic-free packaging</Badge>
              </div>

              <Button asChild variant="ghost" size="sm" className="mt-6 -ml-3">
                <Link href={`/vendors/${vendor.slug}`}>
                  Explore Nova Audio <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {products.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group">
                  <ProductImage
                    src={product.thumbnail}
                    alt={product.title}
                    className="aspect-[4/5] rounded-xl"
                    sizes="(max-width: 768px) 30vw, 15vw"
                    hoverZoom
                  />
                  <p className="mt-2 line-clamp-2 text-[0.7rem] font-medium leading-snug">
                    {product.title}
                  </p>
                  <p className="mt-0.5 text-[0.68rem] font-semibold tabular-nums">
                    {formatCurrency(product.price)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
