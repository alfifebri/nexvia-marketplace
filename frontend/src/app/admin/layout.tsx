import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { RequireAuth } from "@/components/auth/require-auth";

export const metadata: Metadata = {
  title: {
    default: "Admin console",
    template: "%s · Nexvia Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth roles={["admin"]}>
      <AdminShell>{children}</AdminShell>
    </RequireAuth>
  );
}
