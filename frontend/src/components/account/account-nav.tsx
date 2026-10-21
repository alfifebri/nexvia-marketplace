"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

const items = [
  { label: "Overview", href: "/account", icon: LayoutDashboard, exact: true },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart },
  { label: "Settings", href: "/account/settings", icon: Settings },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) return null;

  const signOut = async () => {
    await logout();
    toast.success("Signed out.");
    router.push("/");
  };

  return (
    <nav aria-label="Account" className="lg:sticky lg:top-28">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <Avatar src={user.avatar} name={user.name} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-[0.65rem] text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="mt-2 flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1.5 lg:flex-col lg:overflow-visible">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-2 hidden flex-col gap-1 rounded-2xl border border-border bg-card p-1.5 lg:flex">
        {user.role === "vendor" && (
          <Link
            href="/vendor"
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span className="flex items-center gap-2.5">
              <Store className="size-4" /> Vendor portal
            </span>
            <Badge variant="accent">Seller</Badge>
          </Link>
        )}
        {user.role === "admin" && (
          <Link
            href="/admin"
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span className="flex items-center gap-2.5">
              <ShieldCheck className="size-4" /> Admin console
            </span>
            <Badge variant="coral">Admin</Badge>
          </Link>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-danger/5 hover:text-danger"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </div>

      <button
        onClick={signOut}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
      >
        <LogOut className="size-4" /> Sign out
      </button>
    </nav>
  );
}
