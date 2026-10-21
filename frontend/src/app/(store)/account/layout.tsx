import type { Metadata } from "next";
import { AccountNav } from "@/components/account/account-nav";
import { RequireAuth } from "@/components/auth/require-auth";

export const metadata: Metadata = {
  title: { default: "Your account", template: "%s · Nexvia account" },
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="container-page py-8 lg:py-10">
        <div className="lg:grid lg:grid-cols-[236px_1fr] lg:gap-8 xl:gap-10">
          <AccountNav />
          <main className="mt-6 min-w-0 lg:mt-0">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
