import type { Metadata } from "next";
import { VendorOrders } from "@/components/vendor/vendor-orders";

export const metadata: Metadata = {
  title: "Orders",
};

export default function VendorOrdersPage() {
  return <VendorOrders />;
}
