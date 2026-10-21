import Link from "next/link";
import { ArrowLeft, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#0b1411] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 grid-overlay opacity-[0.14]" aria-hidden />
        <div
          className="pointer-events-none absolute -right-32 top-1/4 size-105 rounded-full bg-accent/15 blur-[120px]"
          aria-hidden
        />
        <div className="relative">
          <Logo className="text-white" />
        </div>

        <div className="relative max-w-md">
          <p className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/45">
            <Sparkles className="size-3.5 text-accent" /> The considered marketplace
          </p>
          <h2 className="mt-5 font-display text-4xl leading-[1.08] text-white xl:text-5xl">
            Things worth keeping, from people worth backing.
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
            One account for shopping, reviews and order tracking — plus dedicated workspaces for
            independent vendors and the people who look after the platform.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: BadgeCheck, text: "Every vendor manually vetted before launch" },
              { icon: ShieldCheck, text: "Buyer protection on every order, no fine print" },
              { icon: Sparkles, text: "Transparent split payouts, settled weekly" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-sm text-white/70">
                <span className="grid size-7 place-items-center rounded-full bg-white/8 text-accent">
                  <item.icon className="size-3.5" />
                </span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-white/10 pt-5">
          <p className="text-[0.65rem] text-white/35">© {new Date().getFullYear()} Nexvia Technologies</p>
          <div className="flex items-center gap-2 text-[0.6rem] text-white/35">
            <span className="size-1.5 rounded-full bg-accent" /> All systems operational
          </div>
        </div>
      </aside>

      <main className="relative flex flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to store
          </Link>
          <div className="lg:hidden">
            <Logo />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
