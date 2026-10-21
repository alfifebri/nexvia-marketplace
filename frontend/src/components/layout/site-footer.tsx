"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  Instagram,
  Linkedin,
  LockKeyhole,
  Mail,
  MapPin,
  Twitter,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { footerNav, siteConfig } from "@/lib/constants";

const socials = [
  { icon: Instagram, href: siteConfig.socials.instagram, label: "Instagram" },
  { icon: Twitter, href: siteConfig.socials.x, label: "X" },
  { icon: Linkedin, href: siteConfig.socials.linkedin, label: "LinkedIn" },
];

const paymentMethods = ["Visa", "Mastercard", "Amex", "Stripe", "Razorpay", "UPI"];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-[#08120f] text-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/80 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-40 -top-48 size-[36rem] rounded-full opacity-[0.14] blur-3xl"
        style={{ background: "radial-gradient(circle, #d8fb74 0%, transparent 68%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-56 -left-40 size-[32rem] rounded-full opacity-[0.12] blur-3xl"
        style={{ background: "radial-gradient(circle, #2f6b57 0%, transparent 70%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.8) 0.8px, transparent 0.8px)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden
      />

      <div className="container-page relative">
        <div className="grid gap-12 border-b border-white/10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-20 lg:py-16">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <Logo
                inverted
                className="[&_span:first-child]:size-10 [&_span:first-child]:rounded-[0.8rem] [&_span:last-child]:text-[1.55rem] [&_span:last-child]:font-extrabold [&_span:last-child]:tracking-[-0.055em] [&_span:last-child]:text-white"
              />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[0.52rem] font-semibold uppercase tracking-[0.18em] text-white/45">
                <span className="size-1 rounded-full bg-accent" />
                Independent by design
              </span>
            </div>

            <h2 className="mt-8 max-w-lg text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.05em] sm:text-[2.75rem]">
              Things worth keeping,
              <span className="font-display italic tracking-[-0.02em] text-accent"> makers worth knowing.</span>
            </h2>
            <p className="mt-5 max-w-md text-[0.82rem] leading-7 text-white/50">
              A curated marketplace for considered objects and independent studios. Every order is split
              transparently, so more of every sale stays with the people who made it.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={social.label}
                  className="group inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/50 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-accent hover:text-accent-foreground"
                >
                  <social.icon className="size-[0.95rem]" />
                </a>
              ))}
              <span className="ml-1 h-px w-10 bg-white/15" aria-hidden />
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="text-[0.68rem] font-medium tracking-[0.01em] text-white/45 transition-colors hover:text-white"
              >
                {siteConfig.supportEmail}
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-6 sm:p-7">
            <div
              className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full opacity-20 blur-2xl"
              style={{ background: "radial-gradient(circle, #d8fb74 0%, transparent 70%)" }}
              aria-hidden
            />
            <div className="relative flex items-center justify-between">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-white/40">
                The Sunday edit
              </p>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.52rem] font-medium uppercase tracking-[0.14em] text-accent/80">
                Weekly
              </span>
            </div>
            <h3 className="relative mt-4 text-xl font-semibold tracking-[-0.035em] sm:text-[1.35rem]">
              One good email. Every Sunday.
            </h3>
            <p className="relative mt-2 text-[0.72rem] leading-6 text-white/45">
              New makers, quiet restocks and considered finds. Written by humans, never a firehose.
            </p>
            <form
              className="relative mt-5 flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] p-1.5 transition-colors focus-within:border-accent/40 focus-within:bg-white/[0.07]"
              onSubmit={(event) => {
                event.preventDefault();
                toast.success("You're on the list.", {
                  description: "Look out for the next Sunday edit.",
                });
                (event.currentTarget as HTMLFormElement).reset();
              }}
            >
              <Input
                type="email"
                required
                placeholder="you@example.com"
                aria-label="Email address"
                className="h-10 border-0 bg-transparent px-4 text-sm text-white shadow-none placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                type="submit"
                variant="accent"
                size="icon"
                className="size-10 shrink-0 rounded-full"
                aria-label="Subscribe to the Sunday edit"
              >
                <ArrowRight className="size-4" />
              </Button>
            </form>
            <p className="relative mt-3 flex items-center gap-1.5 text-[0.58rem] text-white/30">
              <LockKeyhole className="size-3" /> No noise. Unsubscribe in one click.
            </p>
          </div>
        </div>

        <div className="grid gap-12 border-b border-white/10 py-12 lg:grid-cols-[0.85fr_1.4fr] lg:gap-20">
          <div>
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-white/35">
              The concierge
            </p>
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="group mt-4 inline-flex items-center gap-2 text-[1.05rem] font-medium tracking-[-0.02em] text-white/85 transition-colors hover:text-accent"
            >
              {siteConfig.supportEmail}
              <ArrowRight className="size-3.5 -rotate-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <p className="mt-3 flex items-start gap-2.5 text-[0.72rem] leading-6 text-white/40">
              <MapPin className="mt-1 size-3.5 shrink-0 text-accent/60" />
              <span>
                Indiranagar, Bengaluru
                <br />
                Karnataka 560038, India
              </span>
            </p>
            <div className="mt-7 space-y-2">
              <p className="flex items-center gap-2 text-[0.64rem] text-white/40">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent/60 motion-reduce:hidden" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
                </span>
                All systems operational
              </p>
              <p className="text-[0.64rem] text-white/30">Replies within one business day, Monday to Friday.</p>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3" aria-label="Footer">
            {Object.entries(footerNav).map(([section, links]) => (
              <div key={section} className="border-t border-white/10 pt-5">
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-white/35">
                  {section}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-[0.8rem] tracking-[-0.005em] text-white/60 transition-colors hover:text-white"
                      >
                        <span className="h-px w-0 bg-accent transition-all duration-300 group-hover:w-3" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="py-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-[0.66rem] tracking-[0.01em] text-white/45">
                © {new Date().getFullYear()} <span className="font-semibold text-white/65">{siteConfig.legalName}</span>
              </p>
              <span className="hidden size-0.5 rounded-full bg-white/20 sm:block" aria-hidden />
              <p className="text-[0.66rem] tracking-[0.01em] text-white/30">All rights reserved.</p>
              <span className="hidden size-0.5 rounded-full bg-white/20 sm:block" aria-hidden />
              <p className="text-[0.66rem] tracking-[0.01em] text-white/30">Crafted in Bengaluru</p>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-white/35">
              <Link href="/support" className="transition-colors hover:text-white">Privacy</Link>
              <Link href="/support" className="transition-colors hover:text-white">Terms</Link>
              <Link href="/support" className="transition-colors hover:text-white">Cookies</Link>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
              >
                Back to top <ArrowUp className="size-3" />
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-white/25">
              <LockKeyhole className="size-3 text-accent/60" />
              Secure checkout · Encrypted payments
            </p>
            <ul className="flex flex-wrap items-center gap-1.5" aria-label="Accepted payment methods">
              {paymentMethods.map((method) => (
                <li
                  key={method}
                  className="inline-flex h-7 items-center rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-[0.54rem] font-semibold uppercase tracking-[0.12em] text-white/50 transition-colors hover:border-white/20 hover:bg-white/[0.07] hover:text-white/75"
                >
                  {method}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="relative select-none overflow-hidden border-t border-white/[0.06]" aria-hidden>
        <div className="container-page">
          <p className="-mb-[0.16em] bg-gradient-to-b from-white/[0.075] to-white/[0.015] bg-clip-text pt-3 text-center text-[22vw] font-semibold leading-[0.72] tracking-[-0.078em] text-transparent">
            nexvia
          </p>
        </div>
      </div>
    </footer>
  );
}
