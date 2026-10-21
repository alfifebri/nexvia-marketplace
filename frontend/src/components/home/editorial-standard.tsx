import Link from "next/link";
import { ArrowUpRight, Check, Leaf, ShieldCheck } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { Reveal } from "@/components/motion/reveal";
import { formatCompact } from "@/lib/utils";

const standards = [
  "Every maker is interviewed and vetted before their first listing.",
  "Materials and origin declared, not implied.",
  "Repairability scored — because landfill is a design failure.",
  "Payouts settle in 48 hours, not 48 days.",
];

export function EditorialStandard() {
  return (
    <section className="border-y border-border bg-card">
      <div className="container-page section-pad grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative">
          <div className="relative grid grid-cols-5 grid-rows-6 gap-3">
            <ProductImage
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80"
              alt="Nexvia vendor studio"
              className="col-span-5 row-span-4 rounded-3xl"
              sizes="(max-width: 1024px) 90vw, 45vw"
              imageClassName="grayscale-[15%]"
            />
            <ProductImage
              src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=800&q=80"
              alt="Maker working with natural materials"
              className="col-span-3 row-span-2 rounded-2xl"
              sizes="30vw"
            />
            <div className="col-span-2 row-span-2 flex flex-col justify-between rounded-2xl bg-primary p-5 text-primary-foreground">
              <Leaf className="size-5 text-accent" />
              <div>
                <p className="text-3xl font-semibold tracking-tight">{formatCompact(38)}%</p>
                <p className="mt-1 text-[0.68rem] leading-snug text-primary-foreground/70">
                  of orders ship in plastic-free packaging
                </p>
              </div>
            </div>
          </div>

          <div className="absolute -right-3 top-8 hidden rounded-2xl border border-border bg-card/95 p-4 shadow-float backdrop-blur-md sm:block lg:-right-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-success" />
              <p className="text-xs font-semibold">Nexvia Verified</p>
            </div>
            <p className="mt-1 max-w-[160px] text-[0.65rem] leading-snug text-muted-foreground">
              Every store audited for quality, returns and response time.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="max-w-xl">
          <div className="flex items-center gap-2.5">
            <span className="h-px w-8 bg-foreground/30" />
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              The Nexvia standard
            </p>
          </div>
          <h2 className="mt-4 text-balance text-3xl font-semibold leading-[1.05] tracking-[-0.035em] sm:text-4xl lg:text-[2.9rem]">
            A marketplace that <span className="font-display italic font-normal">edits</span>, not
            just lists.
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            We started Nexvia because discovery had become a numbers game. Now 120+ independent
            studios sell here — each one chosen for how they make, not how much they spend on ads.
          </p>

          <ul className="mt-7 space-y-3.5">
            {standards.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <span className="leading-relaxed text-foreground/80">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
            >
              Read our buying charter
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <div className="flex items-center gap-3 border-l border-border pl-6">
              <div className="font-display text-2xl italic text-foreground/80">Nadia O.</div>
              <div className="text-[0.62rem] leading-tight text-muted-foreground">
                Head of Curation
                <br />
                since 2019
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
