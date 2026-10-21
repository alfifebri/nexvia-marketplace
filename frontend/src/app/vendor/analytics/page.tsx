import type { Metadata } from "next";
import { VendorAnalytics } from "@/components/vendor/vendor-analytics";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function VendorAnalyticsPage() {
  return <VendorAnalytics />;
}
