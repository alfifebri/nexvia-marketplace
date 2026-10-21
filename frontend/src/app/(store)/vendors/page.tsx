import type { Metadata } from "next";
import { VendorsDirectory } from "@/components/vendors/vendors-directory";

export const metadata: Metadata = {
  title: "Vendors & makers",
  description:
    "Meet the independent studios behind Nexvia — vetted makers of audio, apparel, homeware and more.",
  alternates: { canonical: "/vendors" },
};

export default function VendorsPage() {
  return <VendorsDirectory />;
}
