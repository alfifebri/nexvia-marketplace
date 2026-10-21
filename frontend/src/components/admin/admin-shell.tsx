"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  ShoppingBag,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const nav: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Vendors", href: "/admin/vendors", icon: Store },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const signOut = async () => {
    await logout();
    toast.success("Signed out.");
    router.push("/");
  };

  return (
    <div className="flex h-full flex-col bg-[#0b1411] text-white">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo inverted className="[&_span:last-child]:text-white" />
      </div>

      <div className="mx-4 rounded-xl border border-white/10 bg-white/[0.04] p-3">
        <p className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-white/35">Admin console</p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold">Marketplace control</p>
          <Badge variant="accent" className="text-[0.48rem]">Admin</Badge>
        </div>
        <Link
          href="/"
          onClick={onNavigate}
          className="mt-2 inline-flex items-center gap-1 text-[0.6rem] font-medium text-white/55 transition-colors hover:text-white"
        >
          View storefront <ArrowUpRight className="size-2.5" />
        </Link>
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-3" aria-label="Admin console">
        <p className="px-3 pb-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-white/30">Operate</p>
        <div className="space-y-0.5">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors",
                  active ? "bg-accent text-accent-foreground" : "text-white/60 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-white/10 p-3">
          <ShieldCheck className="size-4 text-accent" />
          <p className="mt-2 text-[0.62rem] font-semibold">Demo environment</p>
          <p className="mt-0.5 text-[0.55rem] leading-relaxed text-white/40">
            Approvals and status changes persist locally. Audit logging arrives with the live API.
          </p>
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-1 py-2">
          <Avatar src={user?.avatar} name={user?.name ?? "Admin"} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.7rem] font-semibold">{user?.name}</p>
            <p className="truncate text-[0.55rem] text-white/40">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Sign out"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
        <Link
          href="/"
          onClick={onNavigate}
          className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-[0.62rem] text-white/40 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="size-3" /> Back to marketplace
        </Link>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const current = nav.find((item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href)));

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <NavContent />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid size-9 place-items-center rounded-lg border border-border bg-card lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu className="size-4" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Nexvia · Admin
              </p>
              <p className="truncate text-sm font-semibold">{current?.label ?? "Overview"}</p>
            </div>
            <Badge variant="success" dot className="hidden text-[0.55rem] sm:inline-flex">All systems nominal</Badge>
            <Avatar name="Admin" size="sm" className="lg:hidden" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-0 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <NavContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
