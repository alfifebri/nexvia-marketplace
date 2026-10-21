import type { Metadata } from "next";
import { VendorSettings } from "@/components/vendor/vendor-settings";

export const metadata: Metadata = {
  title: "Settings",
};

export default function VendorSettingsPage() {
  return <VendorSettings />;
}
