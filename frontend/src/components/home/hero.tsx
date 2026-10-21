"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, BadgeCheck, Star, Truck } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoProducts } from "@/lib/demo/products";
import { formatCurrency } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const arcOne = demoProducts[0];
  const watch = demoProducts.find((product) => product.id === "p-meridian-watch") ?? demoProducts[4];
  const chair = demoProducts.find((product) => product.id === "p-drift-chair") ?? demoProducts[12];

  const enter = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease },
        };

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 grid-overlay opacity-[0.55] [mask-image:radial-gradient(80%_70%_at_50%_20%,black,transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-40 top-0 size-[620px] rounded-full opacity-80 blur-3xl"
        style={{ background: "var(--hero-glow)" }}
        aria-hidden
      />

      <div className="container-page relative grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1.02fr_1fr] lg:gap-8 lg:pb-24 lg:pt-16">
        <div className="relative z-10 max-w-2xl">
          <motion.div {...enter(0)}>
            <span className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-foreground/80">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-coral opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-coral" />
              </span>
              Curated multi-vendor marketplace
            </span>
          </motion.div>

          <motion.h1
            {...enter(0.08)}
            className="mt-6 text-[clamp(3.25rem,7vw,5.75rem)] font-semibold leading-[0.92] tracking-[-0.055em]"
          >
            Objects
            <br />
            worth{" "}
            <span className="relative inline-block font-display font-normal italic tracking-[-0.02em]">
              keeping
              <svg
                className="absolute -bottom-2 left-0 w-full text-coral"
                viewBox="0 0 220 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3 10C55 3 130 2 217 8"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-coral">.</span>
          </motion.h1>

          <motion.p {...enter(0.16)} className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            A marketplace for considered design — audio, homeware, apparel and everyday essentials from
            independent makers. Vetted once, kept for years.
          </motion.p>

          <motion.div {...enter(0.24)} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="group">
              <Link href="/products">
                Shop the collection
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="group">
              <Link href="/vendor/onboarding">
                Sell on Nexvia
                <ArrowUpRight className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div {...enter(0.32)} className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {["riya", "daniel", "mia", "arjun"].map((seed) => (
                  <Avatar
                    key={seed}
                    src={`https://picsum.photos/seed/${seed}/64/64`}
                    name={seed}
                    size="sm"
                    className="ring-2 ring-background"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-xs font-semibold">4.9</span>
                </div>
                <p className="text-[0.7rem] text-muted-foreground">18,400+ verified buyers</p>
              </div>
            </div>
            <div className="h-9 w-px bg-border" />
            <div className="flex items-center gap-2 text-[0.72rem] text-muted-foreground">
              <Truck className="size-4" /> Free shipping over $100
            </div>
          </motion.div>
        </div>

        <div className="relative mx-auto w-full max-w-[540px] lg:max-w-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96, rotate: 1.5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.15, ease }}
            className="relative"
          >
            <div className="relative aspect-[4/4.6] overflow-hidden rounded-[2.75rem] border border-border bg-muted shadow-lift">
              <ProductImage
                src={chair.images[0]}
                alt={chair.title}
                className="size-full"
                sizes="(max-width: 1024px) 90vw, 46vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

              <div className="absolute left-5 top-5 flex gap-2">
                <Badge variant="glass">Editor&apos;s pick</Badge>
                <Badge variant="glass">Kanso Living</Badge>
              </div>

              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
                <div className="text-white">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/70">
                    Kanso Living
                  </p>
                  <p className="mt-1 text-lg font-semibold leading-tight">{chair.title}</p>
                  <p className="mt-1 text-sm text-white/80">{formatCurrency(chair.price)}</p>
                </div>
                <Button asChild size="icon" variant="glass" className="size-12 shrink-0 bg-white text-ink hover:bg-white/90">
                  <Link href={`/products/${chair.slug}`} aria-label={`View ${chair.title}`}>
                    <ArrowUpRight className="size-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <motion.div
              initial={reduce ? false : { opacity: 0, x: -24, y: 16 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease }}
              className="absolute -left-4 bottom-24 w-52 rounded-2xl border border-border bg-card/95 p-3 shadow-float backdrop-blur-xl sm:-left-8"
            >
              <div className="flex items-center gap-3">
                <ProductImage
                  src={arcOne.thumbnail}
                  alt={arcOne.title}
                  className="size-16 shrink-0 rounded-xl"
                  sizes="64px"
                />
                <div className="min-w-0">
                  <p className="truncate text-[0.7rem] font-semibold">{arcOne.title}</p>
                  <p className="text-[0.6rem] text-muted-foreground">Nova Audio</p>
                  <p className="mt-1 text-sm font-semibold">{formatCurrency(arcOne.price)}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                <span className="flex items-center gap-1 text-[0.6rem] text-muted-foreground">
                  <BadgeCheck className="size-3 text-success" /> 1,284 reviews
                </span>
                <span className="text-[0.6rem] font-semibold text-coral">−17%</span>
              </div>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.65, ease }}
              className="absolute -right-3 top-16 hidden items-center gap-2 rounded-2xl border border-border bg-card/95 px-3 py-2.5 shadow-float backdrop-blur-xl sm:flex lg:-right-6"
            >
              <ProductImage
                src={watch.thumbnail}
                alt={watch.title}
                className="size-10 rounded-lg"
                sizes="40px"
              />
              <div>
                <p className="text-[0.65rem] font-semibold">Meridian S2</p>
                <p className="text-[0.58rem] text-muted-foreground">Ships in 24h</p>
              </div>
            </motion.div>

            <div className="absolute -right-2 -top-5 grid size-24 place-items-center rounded-full bg-accent text-accent-foreground shadow-float sm:-right-6 sm:size-28">
              <div className="animate-spin-slow">
                <svg viewBox="0 0 100 100" className="size-20 sm:size-24" aria-hidden>
                  <defs>
                    <path id="hero-circle" d="M50,50 m-33,0 a33,33 0 1,1 66,0 a33,33 0 1,1 -66,0" />
                  </defs>
                  <text className="fill-current text-[8.1px] font-bold uppercase tracking-[0.2em]">
                    <textPath href="#hero-circle">Curated · not catalogued · curated ·</textPath>
                  </text>
                </svg>
              </div>
              <Star className="absolute size-5 fill-current" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
