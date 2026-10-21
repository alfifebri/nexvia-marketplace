"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Coupon,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  Review,
  Store,
  Vendor,
} from "@/types";
import { demoCoupons } from "@/lib/demo/coupons";
import { demoOrders } from "@/lib/demo/orders";
import { demoProducts } from "@/lib/demo/products";
import { demoReviews } from "@/lib/demo/reviews";
import { demoVendors } from "@/lib/demo/vendors";
import { orderStatusMeta } from "@/lib/constants";

interface DemoState {
  products: Product[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  vendors: Vendor[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Order) => void;
  addReview: (review: Review) => void;
  markReviewHelpful: (id: string) => void;
  replyToReview: (id: string, comment: string) => void;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    note?: string,
    paymentStatus?: PaymentStatus,
  ) => void;
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (id: string, patch: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  updateVendorStatus: (id: string, status: Store["status"]) => void;
  updateVendorProfile: (id: string, patch: Partial<Vendor>) => void;
  resetDemoData: () => void;
}

const initialState = {
  products: demoProducts,
  orders: demoOrders,
  reviews: demoReviews,
  coupons: demoCoupons,
  vendors: demoVendors,
};

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      ...initialState,
      addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
      updateProduct: (id, patch) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, ...patch } : product,
          ),
        })),
      deleteProduct: (id) =>
        set((state) => ({ products: state.products.filter((product) => product.id !== id) })),
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      addReview: (review) => set((state) => ({ reviews: [review, ...state.reviews] })),
      markReviewHelpful: (id) =>
        set((state) => ({
          reviews: state.reviews.map((review) =>
            review.id === id ? { ...review, helpfulCount: review.helpfulCount + 1 } : review,
          ),
        })),
      replyToReview: (id, comment) =>
        set((state) => ({
          reviews: state.reviews.map((review) =>
            review.id === id
              ? { ...review, vendorReply: { comment, repliedAt: new Date().toISOString() } }
              : review,
          ),
        })),
      updateOrderStatus: (orderId, status, note, paymentStatus) =>
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) return order;
            const at = new Date().toISOString();
            return {
              ...order,
              status,
              payment: paymentStatus ? { ...order.payment, status: paymentStatus } : order.payment,
              items: order.items.map((item) => ({
                ...item,
                status:
                  status === "delivered"
                    ? "delivered"
                    : status === "shipped"
                      ? "shipped"
                      : status === "cancelled" || status === "refunded"
                        ? "cancelled"
                        : "confirmed",
              })),
              deliveredAt: status === "delivered" ? at : order.deliveredAt,
              statusHistory: [
                ...order.statusHistory,
                {
                  status,
                  note: note || orderStatusMeta[status].description,
                  at,
                },
              ],
            };
          }),
        })),
      addCoupon: (coupon) => set((state) => ({ coupons: [coupon, ...state.coupons] })),
      updateCoupon: (id, patch) =>
        set((state) => ({
          coupons: state.coupons.map((coupon) =>
            coupon.id === id ? { ...coupon, ...patch } : coupon,
          ),
        })),
      deleteCoupon: (id) =>
        set((state) => ({ coupons: state.coupons.filter((coupon) => coupon.id !== id) })),
      updateVendorStatus: (id, status) =>
        set((state) => ({
          vendors: state.vendors.map((vendor) => (vendor.id === id ? { ...vendor, status } : vendor)),
        })),
      updateVendorProfile: (id, patch) =>
        set((state) => ({
          vendors: state.vendors.map((vendor) => (vendor.id === id ? { ...vendor, ...patch } : vendor)),
        })),
      resetDemoData: () => set({ ...initialState }),
    }),
    {
      name: "nexvia-demo-v1",
      version: 1,
      partialize: (state) => ({
        products: state.products,
        orders: state.orders,
        reviews: state.reviews,
        coupons: state.coupons,
        vendors: state.vendors,
      }),
    },
  ),
);
