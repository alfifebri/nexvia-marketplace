"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-background px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(239,91,63,0.10),transparent_38%),radial-gradient(circle_at_85%_80%,rgba(216,251,116,0.18),transparent_42%)]" />
      <div className="relative w-full max-w-md text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="mx-auto mt-10 grid size-14 place-items-center rounded-2xl border border-border bg-card text-coral">
          <AlertTriangle className="size-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">Something broke on our side.</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The page hit an unexpected error. Try again — if it keeps happening, come back in a moment.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-wide text-muted-foreground/70">
            Reference {error.digest}
          </p>
        )}
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <button
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <RefreshCw className="size-4" /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
