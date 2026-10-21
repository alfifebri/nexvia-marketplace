import type { Metadata } from "next";
import { AdminVendors } from "@/components/admin/admin-vendors";

export const metadata: Metadata = {
  title: "Vendors",
};

export default function AdminVendorsPage() {
  return <AdminVendors />;
}
