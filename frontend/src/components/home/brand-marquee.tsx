import { trustedBrands } from "@/lib/constants";

export function BrandMarquee() {
  const brands = [...trustedBrands, ...trustedBrands];
  return (
    <section className="border-y border-border bg-card/50 py-5" aria-label="Featured vendors">
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-12 pr-12 hover:[animation-play-state:paused]">
          {brands.map((brand, index) => (
            <div key={`${brand}-${index}`} className="flex items-center gap-12">
              <span className="whitespace-nowrap text-[0.7rem] font-bold uppercase tracking-[0.32em] text-muted-foreground/70 transition-colors hover:text-foreground">
                {brand}
              </span>
              <span className="size-1 rounded-full bg-border" aria-hidden />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
