import type { Metadata } from "next";
import { VendorProducts } from "@/components/vendor/vendor-products";

export const metadata: Metadata = {
  title: "Products",
};

export default function VendorProductsPage() {
  return <VendorProducts />;
}
