import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SearchCommand } from "@/components/layout/search-command";
import { CartDrawer } from "@/components/layout/cart-drawer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(70% 50% at 50% -10%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%)",
        }}
        aria-hidden
      />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <SearchCommand />
      <CartDrawer />
    </div>
  );
}
