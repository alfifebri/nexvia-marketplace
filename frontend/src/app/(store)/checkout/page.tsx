import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/checkout-view";
import { RequireAuth } from "@/components/auth/require-auth";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutView />
    </RequireAuth>
  );
}
