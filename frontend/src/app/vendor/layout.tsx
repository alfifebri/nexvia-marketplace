import type { Metadata } from "next";
import { VendorShell } from "@/components/vendor/vendor-shell";
import { RequireAuth } from "@/components/auth/require-auth";

export const metadata: Metadata = {
  title: { default: "Vendor portal", template: "%s · Nexvia vendor" },
  robots: { index: false, follow: false },
};

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={["vendor", "admin"]}>
      <VendorShell>{children}</VendorShell>
    </RequireAuth>
  );
}
