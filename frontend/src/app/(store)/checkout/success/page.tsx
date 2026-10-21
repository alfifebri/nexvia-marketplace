import type { Metadata } from "next";
import { CheckoutSuccessView } from "@/components/checkout/checkout-success-view";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return <CheckoutSuccessView orderNumber={order ?? ""} />;
}
