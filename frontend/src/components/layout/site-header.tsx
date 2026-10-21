"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Sun,
  User as UserIcon,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useMounted } from "@/hooks/use-mounted";
import { useAuthStore } from "@/stores/auth-store";
import { useCartCount, useCartSubtotal, useCartStore } from "@/stores/cart-store";
import { useWishlistCount } from "@/stores/wishlist-store";
import { useUIStore } from "@/stores/ui-store";
import { categories, mainNav } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";

function AccountMenu({ mobile = false }: { mobile?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const mode = useAuthStore((state) => state.mode);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  if (!user) {
    return (
      <Button asChild variant={mobile ? "primary" : "outline"} size={mobile ? "default" : "sm"} className="w-full">
        <Link href="/login">Sign in</Link>
      </Button>
    );
  }

  const roleLinks =
    user.role === "admin"
      ? [
          { label: "Admin dashboard", href: "/admin", icon: LayoutDashboard },
          { label: "Vendors", href: "/admin/vendors", icon: Store },
          { label: "Coupons", href: "/admin/coupons", icon: Sparkles },
        ]
      : user.role === "vendor"
        ? [
            { label: "Vendor dashboard", href: "/vendor", icon: LayoutDashboard },
            { label: "My products", href: "/vendor/products", icon: Package },
            { label: "Fulfilment", href: "/vendor/orders", icon: ShoppingBag },
          ]
        : [
            { label: "My account", href: "/account", icon: UserIcon },
            { label: "Orders", href: "/account/orders", icon: Package },
            { label: "Wishlist", href: "/wishlist", icon: Heart },
          ];

  if (mobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <Avatar src={user.avatar} name={user.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Badge variant={mode === "demo" ? "warning" : "success"} className="ml-auto">
            {user.role}
          </Badge>
        </div>
        <div className="space-y-1">
          {roleLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <item.icon className="size-4 text-muted-foreground" />
              {item.label}
            </Link>
          ))}
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            await logout();
            toast.success("Signed out.");
            router.push("/");
          }}
        >
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 transition-colors hover:border-foreground/20">
          <Avatar src={user.avatar} name={user.name} size="sm" />
          <span className="hidden max-w-24 truncate text-xs font-semibold xl:block">
            {user.name.split(" ")[0]}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="normal-case tracking-normal">
          <div className="flex items-center gap-2.5 py-1">
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-[0.7rem] text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="mt-1 flex gap-1.5">
            <Badge variant="outline" className="capitalize">{user.role}</Badge>
            <Badge variant={mode === "demo" ? "warning" : "success"}>
              {mode === "demo" ? "Demo session" : "Live session"}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roleLinks.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href}>
              <item.icon /> {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          danger
          onSelect={async () => {
            await logout();
            toast.success("Signed out.");
            router.push("/");
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const mounted = useMounted();
  const [scrolled, setScrolled] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const openCart = useCartStore((state) => state.openCart);
  const cartCount = useCartCount();
  const subtotal = useCartSubtotal();
  const wishlistCount = useWishlistCount();
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  return (
    <>
      {announcementOpen && (
        <div className="relative z-50 bg-primary text-primary-foreground">
          <div className="container-page flex h-9 items-center justify-center gap-2 text-[0.68rem] font-medium tracking-wide">
            <Sparkles className="size-3.5 text-accent" aria-hidden />
            <span className="hidden sm:inline">Free carbon-neutral shipping over $100</span>
            <span className="sm:hidden">Free shipping over $100</span>
            <span className="mx-1 opacity-40">·</span>
            <span>30-day returns</span>
            <button
              onClick={() => setAnnouncementOpen(false)}
              className="absolute right-4 rounded-full p-1 opacity-60 transition-opacity hover:opacity-100"
              aria-label="Dismiss announcement"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      <header className={cn("sticky top-0 z-40 transition-all duration-300", scrolled ? "shadow-soft" : "")}>
        <div
          className={cn(
            "border-b transition-colors duration-300",
            scrolled ? "border-border bg-background/85 backdrop-blur-xl" : "border-transparent bg-background",
          )}
        >
          <div className="container-page flex h-16 items-center gap-4 lg:h-[4.5rem] lg:gap-6">
            <Logo />

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
              <DropdownMenu open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.82rem] font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground">
                    Shop
                    <ChevronDown
                      className={cn("size-3.5 text-muted-foreground transition-transform", categoriesOpen && "rotate-180")}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[560px] p-3" sideOffset={10}>
                  <div className="grid grid-cols-2 gap-1">
                    {categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/products?category=${category.slug}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="group flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted"
                      >
                        <span
                          className="size-10 shrink-0 rounded-lg bg-cover bg-center"
                          style={{ backgroundImage: `url(${category.image})` }}
                          aria-hidden
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">{category.label}</span>
                          <span className="block truncate text-[0.7rem] text-muted-foreground">
                            {category.description}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 border-t border-border pt-2">
                    <Link
                      href="/products"
                      onClick={() => setCategoriesOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold hover:bg-muted"
                    >
                      Browse the full catalogue
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              {mainNav.slice(1).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3.5 py-2 text-[0.82rem] font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <button
              onClick={() => setSearchOpen(true)}
              className="group hidden h-10 flex-1 items-center gap-2.5 rounded-full border border-border bg-card/70 px-4 text-left text-sm text-muted-foreground transition-all hover:border-foreground/20 hover:bg-card md:flex lg:max-w-sm xl:max-w-md"
            >
              <Search className="size-4 shrink-0" />
              <span className="flex-1 truncate">Search products, brands, vendors…</span>
              <kbd className="hidden shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[0.6rem] font-semibold lg:inline">
                ⌘K
              </kbd>
            </button>

            <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={() => setSearchOpen(true)}
                className="inline-flex size-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground md:hidden"
                aria-label="Search"
              >
                <Search className="size-[18px]" />
              </button>

              <button
                onClick={toggleTheme}
                className="hidden size-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {mounted && theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
              </button>

              <Link
                href="/wishlist"
                className="relative hidden size-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
                aria-label={`Wishlist${mounted && wishlistCount ? `, ${wishlistCount} items` : ""}`}
              >
                <Heart className="size-[18px]" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute right-1 top-1 size-2 rounded-full bg-coral" />
                )}
              </Link>

              <div className="hidden sm:block">
                {mounted ? <AccountMenu /> : <div className="h-9 w-24" />}
              </div>

              <button
                onClick={openCart}
                className="group relative ml-0.5 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-3 text-primary-foreground transition-all hover:shadow-soft sm:px-4"
                aria-label="Open cart"
              >
                <ShoppingBag className="size-[18px]" />
                <span className="hidden text-xs font-semibold tabular-nums lg:inline">
                  {mounted && subtotal > 0 ? formatCurrency(subtotal, "USD", 0) : "Cart"}
                </span>
                {mounted && cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-coral px-1 text-[0.6rem] font-bold text-white ring-2 ring-background animate-badge-pop">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileOpen(true)}
                className="inline-flex size-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="p-0">
          <div className="flex h-full flex-col overflow-y-auto p-6">
            <div className="mb-6 pr-10">
              <Logo />
            </div>
            <div className="space-y-1">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-base font-semibold transition-colors hover:bg-muted"
                >
                  {item.label}
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
            <div className="mt-6 border-t border-border pt-5">
              <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Categories
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {categories.slice(0, 6).map((category) => (
                  <Link
                    key={category.slug}
                    href={`/products?category=${category.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl bg-muted/60 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    {category.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-6 border-t border-border pt-5">
              <AccountMenu mobile />
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-border pt-5">
              <span className="text-xs text-muted-foreground">Appearance</span>
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
