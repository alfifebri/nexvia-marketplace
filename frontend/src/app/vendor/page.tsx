import type { Metadata } from "next";
import { VendorOverview } from "@/components/vendor/vendor-overview";

export const metadata: Metadata = {
  title: "Overview",
};

export default function VendorDashboardPage() {
  return <VendorOverview />;
}
