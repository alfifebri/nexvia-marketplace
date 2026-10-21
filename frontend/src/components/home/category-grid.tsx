import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/lib/constants";
import { demoProducts } from "@/lib/demo/products";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const layout = [
  "sm:col-span-2 sm:row-span-2",
  "sm:col-span-2",
  "sm:col-span-1",
  "sm:col-span-1",
  "sm:col-span-1",
  "sm:col-span-1",
];

export function CategoryGrid() {
  const featured = categories.slice(0, 6);
  return (
    <section className="container-page section-pad">
      <Reveal>
        <SectionHeading
          eyebrow="Shop by room, wrist or weekend"
          title={
            <>
              Find your next <span className="font-display italic font-normal">forever thing</span>.
            </>
          }
          description="Eight tightly edited categories. No infinite scroll of lookalikes — just pieces our buyers would keep themselves."
          action={{ label: "All categories", href: "/products" }}
        />
      </Reveal>

      <div className="mt-10 grid auto-rows-[168px] grid-cols-2 gap-3 sm:auto-rows-[190px] sm:grid-cols-4 lg:auto-rows-[210px] lg:gap-4">
        {featured.map((category, index) => {
          const count = demoProducts.filter((product) => product.category === category.slug).length;
          return (
            <Reveal
              key={category.slug}
              delay={index * 0.05}
              className={cn("group relative", layout[index])}
            >
              <Link
                href={`/products?category=${category.slug}`}
                className="relative flex size-full flex-col justify-end overflow-hidden rounded-2xl border border-border p-4 sm:p-5"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url(${category.image})` }}
                  aria-hidden
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5 transition-opacity duration-500 group-hover:from-black/85" />
                <div className="relative z-10">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="inline-flex h-6 items-center rounded-full px-2 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-black/80"
                      style={{ backgroundColor: category.accent }}
                    >
                      {count} pieces
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h3 className={cn("font-semibold tracking-tight text-white", index === 0 ? "text-2xl sm:text-3xl" : "text-base sm:text-lg")}>
                        {category.label}
                      </h3>
                      <p className={cn("mt-1 max-w-[28ch] text-white/70", index === 0 ? "text-xs sm:text-sm" : "text-[0.68rem] line-clamp-2")}>
                        {category.description}
                      </p>
                    </div>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-white group-hover:text-black">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
