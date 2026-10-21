"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { demoAccounts } from "@/lib/constants";
import { cn, safeInternalPath } from "@/lib/utils";
import type { User, UserRole } from "@/types";

const destinationFor = (user: User | null, next?: string) => {
  if (!user) return next ? safeInternalPath(next) : "/account";
  if (user.role === "vendor") return "/vendor";
  if (user.role === "admin") return "/admin";
  return next ? safeInternalPath(next, "/account") : "/account";
};

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const quickLogin = useAuthStore((state) => state.quickLogin);
  const user = useAuthStore((state) => state.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [demoPending, setDemoPending] = useState<UserRole | null>(null);

  useEffect(() => {
    if (user) router.replace(destinationFor(user, next));
  }, [user, next, router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setPending(true);
    const result = await login({ email: email.trim(), password });
    setPending(false);

    if (!result.ok) {
      setError(
        result.message ??
          "We couldn't sign you in. If the API is offline, use one of the demo accounts below.",
      );
      return;
    }

    toast.success("Welcome back to Nexvia.");
  };

  const handleQuickLogin = async (role: UserRole) => {
    setError("");
    setDemoPending(role);
    const result = await quickLogin(role);
    setDemoPending(null);

    if (!result.ok) {
      setError(result.message ?? "Demo sign-in failed.");
      return;
    }

    if (result.mode === "demo") {
      toast.info("Demo session started", { description: result.message });
    } else {
      toast.success("Signed in to the live workspace.");
    }
    const current = useAuthStore.getState().user;
    router.replace(destinationFor(current, next));
  };

  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Welcome back
      </p>
      <h1 className="mt-2.5 text-3xl font-semibold tracking-[-0.04em]">Sign in to Nexvia</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Continue to your cart, orders and saved pieces.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
        <Field label="Email address" htmlFor="email">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="pl-10"
            />
          </div>
        </Field>

        <Field label="Password" htmlFor="password">
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
            <input type="checkbox" defaultChecked className="size-3.5 rounded border-input accent-primary" />
            Keep me signed in
          </label>
          <Link
            href="/support#contact"
            className="text-[0.7rem] font-semibold text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/5 p-3 text-xs text-danger" role="alert">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" loading={pending} disabled={demoPending !== null}>
          Sign in <ArrowRight className="size-4" />
        </Button>
      </form>

      <p className="mt-5 text-center text-[0.72rem] text-muted-foreground">
        New to Nexvia?{" "}
        <Link href="/register" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Or explore with a demo role
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-2">
        {demoAccounts.map((account) => (
          <button
            key={account.role}
            type="button"
            onClick={() => handleQuickLogin(account.role)}
            disabled={pending || demoPending !== null}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left transition-colors",
              "hover:border-foreground/20 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            <span className="min-w-0">
              <span className="block text-xs font-semibold">{account.label}</span>
              <span className="block truncate text-[0.62rem] text-muted-foreground">{account.blurb}</span>
            </span>
            {demoPending === account.role ? (
              <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-[0.6rem] leading-relaxed text-muted-foreground/70">
        Demo sign-in tries the live API first, then falls back to a local session with seeded data.
      </p>
    </div>
  );
}
