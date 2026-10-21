import type { Metadata } from "next";
import { VendorReviews } from "@/components/vendor/vendor-reviews";

export const metadata: Metadata = {
  title: "Reviews",
};

export default function VendorReviewsPage() {
  return <VendorReviews />;
}
