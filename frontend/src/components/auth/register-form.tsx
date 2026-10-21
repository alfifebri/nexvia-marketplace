"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  Store,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { cn, safeInternalPath } from "@/lib/utils";
import type { UserRole } from "@/types";

const roleOptions: { role: Extract<UserRole, "customer" | "vendor">; label: string; blurb: string }[] = [
  { role: "customer", label: "I'm shopping", blurb: "Buy from independent makers" },
  { role: "vendor", label: "I'm selling", blurb: "Open a Nexvia storefront" },
];

const strengthLabels = ["Too short", "Weak", "Fair", "Strong", "Excellent"];

export function RegisterForm({ next }: { next?: string }) {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const user = useAuthStore((state) => state.user);
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (user.role === "vendor") router.replace("/vendor");
    else if (user.role === "admin") router.replace("/admin");
    else router.replace(next ? safeInternalPath(next, "/account") : "/account");
  }, [user, next, router]);

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return password.length === 0 ? 0 : Math.max(1, score);
  }, [password]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const errors: Record<string, string> = {};
    if (name.trim().length < 2) errors.name = "Tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Enter a valid email address.";
    if (phone.trim() && phone.replace(/\D/g, "").length < 7) errors.phone = "Enter a valid phone number.";
    if (role === "vendor" && storeName.trim().length < 2) errors.storeName = "Your store needs a name.";
    if (password.length < 8) errors.password = "Use at least 8 characters.";
    if (confirm !== password) errors.confirm = "Passwords don't match.";
    if (!accepted) errors.accepted = "Please accept the terms to continue.";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPending(true);
    const result = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      phone: phone.trim() || undefined,
      storeName: role === "vendor" ? storeName.trim() : undefined,
    });
    setPending(false);

    if (!result.ok) {
      setError(
        result.message ??
          "We couldn't create your account. If the API is offline, sign in with a demo account.",
      );
      return;
    }
    toast.success("Account created. Welcome to Nexvia.");
  };

  return (
    <div>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Join the marketplace
      </p>
      <h1 className="mt-2.5 text-3xl font-semibold tracking-[-0.04em]">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        One account for shopping, selling and everything in between.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            How will you use Nexvia?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {roleOptions.map((option) => (
              <button
                key={option.role}
                type="button"
                onClick={() => setRole(option.role)}
                className={cn(
                  "relative rounded-xl border p-3 text-left transition-colors",
                  role === option.role
                    ? "border-primary bg-primary/[0.04]"
                    : "border-border bg-card hover:border-foreground/20",
                )}
                aria-pressed={role === option.role}
              >
                {role === option.role && (
                  <span className="absolute right-2.5 top-2.5 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-2.5" />
                  </span>
                )}
                <Store className="size-4 text-muted-foreground" />
                <p className="mt-2 text-xs font-semibold">{option.label}</p>
                <p className="mt-0.5 text-[0.6rem] text-muted-foreground">{option.blurb}</p>
              </button>
            ))}
          </div>
        </div>

        <Field label="Full name" htmlFor="name" error={fieldErrors.name}>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Riya Sharma"
              autoComplete="name"
              className="pl-10"
            />
          </div>
        </Field>

        <Field label="Email address" htmlFor="email" error={fieldErrors.email}>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="pl-10"
            />
          </div>
        </Field>

        <Field label="Phone" htmlFor="phone" optional error={fieldErrors.phone}>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+1 415 555 0100"
              autoComplete="tel"
              className="pl-10"
            />
          </div>
        </Field>

        {role === "vendor" && (
          <Field label="Store name" htmlFor="storeName" error={fieldErrors.storeName}>
            <div className="relative">
              <Store className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="storeName"
                value={storeName}
                onChange={(event) => setStoreName(event.target.value)}
                placeholder="Nova Audio"
                className="pl-10"
              />
            </div>
          </Field>
        )}

        <Field label="Password" htmlFor="password" error={fieldErrors.password}>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
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

        {password.length > 0 && (
          <div>
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    index < strength
                      ? strength <= 2
                        ? "bg-amber-400"
                        : "bg-success"
                      : "bg-border",
                  )}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[0.6rem] text-muted-foreground">
              Password strength: <span className="font-semibold text-foreground">{strengthLabels[strength]}</span>
            </p>
          </div>
        )}

        <Field label="Confirm password" htmlFor="confirm" error={fieldErrors.confirm}>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className="pl-10"
            />
          </div>
        </Field>

        <div>
          <label className="flex items-start gap-2 text-[0.68rem] leading-relaxed text-muted-foreground">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-0.5 size-3.5 rounded border-input accent-primary"
            />
            <span>
              I agree to Nexvia&apos;s{" "}
              <Link href="/support#terms" className="font-semibold text-foreground underline-offset-4 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/support#privacy" className="font-semibold text-foreground underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {fieldErrors.accepted && <p className="mt-1 text-xs font-medium text-danger">{fieldErrors.accepted}</p>}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/5 p-3 text-xs text-danger" role="alert">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" loading={pending}>
          Create account <ArrowRight className="size-4" />
        </Button>
      </form>

      <p className="mt-5 text-center text-[0.72rem] text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
