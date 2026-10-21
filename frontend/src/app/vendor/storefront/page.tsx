import type { Metadata } from "next";
import { VendorStorefront } from "@/components/vendor/vendor-storefront";

export const metadata: Metadata = {
  title: "Storefront",
};

export default function VendorStorefrontPage() {
  return <VendorStorefront />;
}
