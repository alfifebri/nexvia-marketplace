import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-background px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(18,60,50,0.10),transparent_38%),radial-gradient(circle_at_85%_80%,rgba(216,251,116,0.20),transparent_42%)]" />
      <div className="relative w-full max-w-xl text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <p className="mt-10 font-display text-[5.5rem] italic leading-none tracking-[-0.05em] text-primary sm:text-[7rem]">
          404
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
          This shelf is empty.
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          The page you were looking for has moved, sold out or never existed. The good stuff is still one click away.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="size-4" /> Back home
          </Link>
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <Compass className="size-4" /> Browse the marketplace
          </Link>
        </div>
      </div>
    </main>
  );
}
