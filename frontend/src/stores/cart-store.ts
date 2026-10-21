"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Coupon } from "@/types";
import { shippingMethods } from "@/lib/constants";
import { roundCurrency } from "@/lib/utils";
import { useDemoStore } from "@/stores/demo-store";

export const lineKey = (productId: string, variant?: Record<string, string>) => {
  const suffix = variant
    ? Object.entries(variant)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}:${value}`)
        .join("|")
    : "base";
  return `${productId}::${suffix}`;
};

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  coupon: Coupon | null;
  shippingMethodId: string;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: Omit<CartLine, "key">, quantity?: number) => void;
  removeLine: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
  setShippingMethod: (id: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      coupon: null,
      shippingMethodId: "standard",
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addLine: (line, quantity = 1) => {
        const key = lineKey(line.productId, line.variant);
        const existing = get().lines.find((item) => item.key === key);
        if (existing) {
          const nextQty = Math.min(existing.quantity + quantity, existing.stock);
          set({
            lines: get().lines.map((item) =>
              item.key === key ? { ...item, quantity: nextQty } : item,
            ),
            isOpen: true,
          });
          return;
        }
        const nextQuantity = Math.max(1, Math.min(quantity, line.stock));
        set({ lines: [...get().lines, { ...line, key, quantity: nextQuantity }], isOpen: true });
      },
      removeLine: (key) =>
        set({
          lines: get().lines.filter((item) => item.key !== key),
        }),
      setQuantity: (key, quantity) => {
        if (quantity <= 0) {
          set({ lines: get().lines.filter((item) => item.key !== key) });
          return;
        }
        set({
          lines: get().lines.map((item) =>
            item.key === key
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
              : item,
          ),
        });
      },
      clearCart: () => set({ lines: [], coupon: null }),
      applyCoupon: (code) => {
        const coupons = useDemoStore.getState().coupons;
        const coupon = coupons.find(
          (item) => item.code.toLowerCase() === code.trim().toLowerCase(),
        );
        if (!coupon) return { ok: false, message: "That code doesn't exist. Check the spelling." };
        if (coupon.status !== "active") {
          return {
            ok: false,
            message:
              coupon.status === "expired"
                ? "This code has expired."
                : coupon.status === "scheduled"
                  ? "This code isn't active yet."
                  : "This code is no longer available.",
          };
        }
        const now = Date.now();
        if (new Date(coupon.startsAt).getTime() > now) {
          return { ok: false, message: "This code isn't active yet." };
        }
        if (new Date(coupon.expiresAt).getTime() < now) {
          return { ok: false, message: "This code has expired." };
        }
        const subtotal = get()
          .lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
        if (subtotal < coupon.minSubtotal) {
          return {
            ok: false,
            message: `Add ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(coupon.minSubtotal - subtotal)} more to use ${coupon.code}.`,
          };
        }
        if (coupon.used >= coupon.usageLimit) {
          return { ok: false, message: "This code has reached its usage limit." };
        }
        set({ coupon });
        return { ok: true, message: `${coupon.code} applied.` };
      },
      removeCoupon: () => set({ coupon: null }),
      setShippingMethod: (id) => set({ shippingMethodId: id }),
    }),
    {
      name: "nexvia-cart-v1",
      partialize: (state) => ({
        lines: state.lines,
        coupon: state.coupon,
        shippingMethodId: state.shippingMethodId,
      }),
    },
  ),
);

export const useCartCount = () =>
  useCartStore((state) => state.lines.reduce((sum, line) => sum + line.quantity, 0));

export const useCartSubtotal = () =>
  useCartStore((state) =>
    roundCurrency(state.lines.reduce((sum, line) => sum + line.price * line.quantity, 0)),
  );

export const useCartShipping = () => {
  const subtotal = useCartSubtotal();
  const shippingMethodId = useCartStore((state) => state.shippingMethodId);
  const method = shippingMethods.find((item) => item.id === shippingMethodId) ?? shippingMethods[0];
  if (method.id === "standard" && subtotal >= 100) return 0;
  return method.price;
};

export const useCartTotals = () => {
  const lines = useCartStore((state) => state.lines);
  const coupon = useCartStore((state) => state.coupon);
  const shippingMethodId = useCartStore((state) => state.shippingMethodId);
  const subtotal = roundCurrency(lines.reduce((sum, line) => sum + line.price * line.quantity, 0));
  const method = shippingMethods.find((item) => item.id === shippingMethodId) ?? shippingMethods[0];
  let shipping = method.id === "standard" && subtotal >= 100 ? 0 : method.price;

  let discount = 0;
  if (coupon) {
    if (coupon.type === "percent") {
      discount = roundCurrency(Math.min(subtotal * (coupon.value / 100), coupon.maxDiscount ?? Infinity));
    } else if (coupon.type === "fixed") {
      discount = Math.min(coupon.value, subtotal);
    } else if (coupon.type === "shipping") {
      shipping = 0;
    }
  }

  const taxable = Math.max(0, subtotal - discount);
  const tax = roundCurrency(taxable * 0.06);
  const total = roundCurrency(Math.max(0, taxable + shipping + tax));

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
  };
};
