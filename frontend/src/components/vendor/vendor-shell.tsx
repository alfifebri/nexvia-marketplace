"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Package,
  Settings2,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth-store";
import { useDemoStore } from "@/stores/demo-store";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

const nav: NavItem[] = [
  { label: "Overview", href: "/vendor", icon: LayoutDashboard, exact: true },
  { label: "Products", href: "/vendor/products", icon: Package },
  { label: "Orders", href: "/vendor/orders", icon: ShoppingBag },
  { label: "Reviews", href: "/vendor/reviews", icon: MessageSquareQuote },
  { label: "Storefront", href: "/vendor/storefront", icon: Store },
];

const secondary: NavItem[] = [
  { label: "Analytics", href: "/vendor/analytics", icon: BarChart3 },
  { label: "Settings", href: "/vendor/settings", icon: Settings2 },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const vendors = useDemoStore((state) => state.vendors);
  const router = useRouter();
  const vendor = vendors.find((item) => item.ownerEmail === user?.email) ?? vendors[0];

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
        <p className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-white/35">Vendor workspace</p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs font-semibold">{vendor?.name ?? "Your store"}</p>
          <Badge variant="accent" className="text-[0.48rem]">Seller</Badge>
        </div>
        <Link
          href={`/vendors/${vendor?.slug ?? ""}`}
          onClick={onNavigate}
          className="mt-2 inline-flex items-center gap-1 text-[0.6rem] font-medium text-white/55 transition-colors hover:text-white"
        >
          View public storefront <ArrowUpRight className="size-2.5" />
        </Link>
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-3" aria-label="Vendor portal">
        <p className="px-3 pb-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-white/30">
          Manage
        </p>
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

        <p className="mt-5 px-3 pb-2 text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-white/30">
          Insights
        </p>
        <div className="space-y-0.5">
          {secondary.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors",
                  active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-1 py-2">
          <Avatar src={user?.avatar} name={user?.name ?? "Vendor"} size="sm" />
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

export function VendorShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const vendors = useDemoStore((state) => state.vendors);
  const vendor = vendors.find((item) => item.ownerEmail === user?.email) ?? vendors[0];
  const current = [...nav, ...secondary].find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href),
  );

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
              aria-label="Open vendor menu"
            >
              <Menu className="size-4" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {vendor?.name ?? "Vendor"} · Portal
              </p>
              <p className="truncate text-sm font-semibold">{current?.label ?? "Overview"}</p>
            </div>
            <Link
              href={`/vendors/${vendor?.slug ?? ""}`}
              className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-[0.65rem] font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
            >
              View storefront <ArrowUpRight className="size-3" />
            </Link>
            <Link
              href="/vendor/settings"
              className="hidden rounded-full border border-border bg-card p-2 text-muted-foreground transition-colors hover:text-foreground sm:block"
              aria-label="Store settings"
            >
              <Settings2 className="size-4" />
            </Link>
            <Link href="/vendor" className="flex items-center gap-2">
              <Avatar src={user?.avatar} name={user?.name ?? "Vendor"} size="sm" />
            </Link>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" hideClose className="w-[86%] max-w-xs border-r-0 bg-[#0b1411] p-0">
          <SheetTitle className="sr-only">Vendor navigation</SheetTitle>
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
          <NavContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
