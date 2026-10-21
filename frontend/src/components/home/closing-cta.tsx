import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";

export function ClosingCTA() {
  return (
    <section className="container-page section-pad">
      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-[2rem] bg-accent p-7 text-accent-foreground sm:p-10">
            <div className="absolute inset-0 dot-overlay opacity-30" aria-hidden />
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full border-[36px] border-black/5" aria-hidden />
            <div className="relative">
              <Badge className="border-black/10 bg-black/10 text-accent-foreground">For the curious</Badge>
              <h2 className="mt-6 max-w-sm text-3xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-4xl">
                Something worth keeping is waiting.
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-accent-foreground/70">
                Browse 300+ objects from makers who care about the last ten years of a product, not
                the first ten minutes.
              </p>
            </div>
            <div className="relative mt-8 flex flex-wrap gap-2.5">
              <Button asChild size="lg" className="bg-accent-foreground text-accent hover:bg-accent-foreground/90">
                <Link href="/products">
                  Shop the collection <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-black/20 text-accent-foreground hover:bg-black/5">
                <Link href="/vendors">Meet the makers</Link>
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-[2rem] bg-[#0c1512] p-7 text-white sm:p-10">
            <div className="absolute inset-0 grid-overlay opacity-[0.16]" aria-hidden />
            <div className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-coral/20 blur-3xl" aria-hidden />
            <div className="relative">
              <Badge variant="glass">
                <Sparkles className="size-3" /> For independent makers
              </Badge>
              <h2 className="mt-6 max-w-sm text-3xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-4xl">
                Your craft deserves a better shopfront.
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
                Commission from 9%, payouts in 48 hours, and a dashboard that gets out of your way.
                Onboarding takes about four minutes.
              </p>
            </div>
            <div className="relative mt-8 flex flex-wrap gap-2.5">
              <Button asChild size="lg" variant="accent">
                <Link href="/vendor/onboarding">
                  Start onboarding <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="glass">
                <Link href="/vendor">Vendor portal</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
