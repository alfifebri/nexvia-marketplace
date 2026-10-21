"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useFeatured } from "@/hooks/queries";
import { ProductCard } from "@/components/products/product-card";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";

export function FeaturedProducts() {
  const { data, isLoading } = useFeatured(8);

  return (
    <section className="container-page section-pad pt-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="This week's shortlist"
          title={
            <>
              The things we&apos;d <span className="font-display italic font-normal">actually buy</span>.
            </>
          }
          description="Restocked, reviewed and ready to ship. Our editors revisit this list every Friday."
        />
        <Button asChild variant="outline" size="sm" className="self-start sm:self-auto">
          <Link href="/products?sort=featured">
            View all <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="skeleton aspect-[4/5] rounded-2xl" />
                <div className="skeleton h-3 w-20 rounded" />
                <div className="skeleton h-4 w-4/5 rounded" />
                <div className="skeleton h-4 w-24 rounded" />
              </div>
            ))
          : data?.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
      </div>
      {isLoading && <ProductGridSkeleton count={0} />}
    </section>
  );
}
