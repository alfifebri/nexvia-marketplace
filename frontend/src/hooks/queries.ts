"use client";

import { useMemo } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Coupon,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductFilters,
  Review,
  Store,
} from "@/types";
import { useDemoStore } from "@/stores/demo-store";
import { useAuthStore } from "@/stores/auth-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { demoVendors } from "@/lib/demo/vendors";
import { getVendorMetrics } from "@/lib/demo/analytics";
import {
  featuredProducts,
  fetchProduct,
  relatedProducts,
  searchProducts,
} from "@/lib/services/catalog-service";

export function useCatalog(filters: ProductFilters) {
  const products = useDemoStore((state) => state.products);
  return useQuery({
    queryKey: ["catalog", filters],
    queryFn: () => searchProducts(filters, products),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(slug: string) {
  const products = useDemoStore((state) => state.products);
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug, products),
    enabled: Boolean(slug),
  });
}

export function useFeatured(limit = 8) {
  const products = useDemoStore((state) => state.products);
  return useQuery({
    queryKey: ["featured", limit],
    queryFn: async () => featuredProducts(products, limit),
  });
}

export function useRelated(product: Product | null | undefined, limit = 4) {
  const products = useDemoStore((state) => state.products);
  return useMemo(
    () => (product ? relatedProducts(product, products, limit) : []),
    [product, products, limit],
  );
}

export function useAllProducts() {
  return useDemoStore((state) => state.products);
}

export function useReviews(productId: string) {
  const reviews = useDemoStore((state) => state.reviews);
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () =>
      reviews
        .filter((review) => review.productId === productId && review.status === "approved")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    enabled: Boolean(productId),
  });
}

export function useWishlistProducts() {
  const ids = useWishlistStore((state) => state.ids);
  const products = useDemoStore((state) => state.products);
  return useMemo(
    () => ids.map((id) => products.find((product) => product.id === id)).filter(Boolean) as Product[],
    [ids, products],
  );
}

export function useCurrentOrders() {
  const orders = useDemoStore((state) => state.orders);
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["orders", user?.id, user?.role],
    queryFn: async () =>
      user?.role === "admin"
        ? orders
        : user?.role === "vendor"
          ? orders.filter((order) => order.items.some((item) => item.vendorId === user.id))
          : orders.filter((order) => order.customerId === user?.id),
    enabled: Boolean(user),
  });
}

export function useOrder(orderId: string) {
  const orders = useDemoStore((state) => state.orders);
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => orders.find((order) => order.id === orderId || order.orderNumber === orderId) ?? null,
    enabled: Boolean(orderId),
  });
}

export function useVendorWorkspace() {
  const user = useAuthStore((state) => state.user);
  const authStore = useAuthStore((state) => state.store);
  const products = useDemoStore((state) => state.products);
  const orders = useDemoStore((state) => state.orders);
  const vendors = useDemoStore((state) => state.vendors);
  const storeRecords = useDemoStore((state) => state.vendors);

  const baseVendor = useMemo(
    () =>
      demoVendors.find((item) => item.ownerEmail === user?.email) ??
      demoVendors.find((item) => item.email === user?.email) ??
      demoVendors[0],
    [user?.email],
  );
  const vendor = useMemo(
    () => vendors.find((item) => item.id === baseVendor.id) ?? baseVendor,
    [vendors, baseVendor],
  );

  const vendorId = vendor.ownerId;
  const vendorProducts = useMemo(
    () => products.filter((product) => product.vendorId === vendorId),
    [products, vendorId],
  );
  const vendorOrders = useMemo(
    () => orders.filter((order) => order.items.some((item) => item.vendorId === vendorId)),
    [orders, vendorId],
  );
  const metrics = useMemo(() => getVendorMetrics(vendorId), [vendorId]);
  const store = vendor ?? authStore;

  return {
    vendor,
    store,
    vendorId,
    products: vendorProducts,
    orders: vendorOrders,
    metrics,
    vendors: storeRecords,
    user,
  };
}

export function useAdminData() {
  const orders = useDemoStore((state) => state.orders);
  const products = useDemoStore((state) => state.products);
  const vendors = useDemoStore((state) => state.vendors);
  const coupons = useDemoStore((state) => state.coupons);

  return useQuery({
    queryKey: ["admin-data"],
    queryFn: async () => {
      const { adminMetrics } = await import("@/lib/demo/analytics");
      return {
        metrics: adminMetrics,
        orders,
        products,
        vendors,
        coupons,
      };
    },
  });
}

export function useCoupons() {
  return useDemoStore((state) => state.coupons);
}

export function useAddReview() {
  const queryClient = useQueryClient();
  const addReview = useDemoStore((state) => state.addReview);
  return useMutation({
    mutationFn: async (review: Review) => {
      addReview(review);
      return review;
    },
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: ["reviews", review.productId] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });
}

export function useMarkReviewHelpful() {
  const markHelpful = useDemoStore((state) => state.markReviewHelpful);
  return (id: string) => markHelpful(id);
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const updateOrderStatus = useDemoStore((state) => state.updateOrderStatus);
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      note,
      paymentStatus,
    }: {
      orderId: string;
      status: OrderStatus;
      note?: string;
      paymentStatus?: PaymentStatus;
    }) => {
      updateOrderStatus(orderId, status, note, paymentStatus);
      return { orderId, status };
    },
    onSuccess: ({ orderId }) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin-data"] });
    },
  });
}

export function useProductMutations() {
  const queryClient = useQueryClient();
  const addProduct = useDemoStore((state) => state.addProduct);
  const updateProduct = useDemoStore((state) => state.updateProduct);
  const deleteProduct = useDemoStore((state) => state.deleteProduct);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["catalog"] });
    queryClient.invalidateQueries({ queryKey: ["featured"] });
    queryClient.invalidateQueries({ queryKey: ["product"] });
    queryClient.invalidateQueries({ queryKey: ["admin-data"] });
  };

  return {
    addProduct: (product: Product) => {
      addProduct(product);
      invalidate();
    },
    updateProduct: (id: string, patch: Partial<Product>) => {
      updateProduct(id, patch);
      invalidate();
    },
    deleteProduct: (id: string) => {
      deleteProduct(id);
      invalidate();
    },
  };
}

export function useCouponMutations() {
  const queryClient = useQueryClient();
  const addCoupon = useDemoStore((state) => state.addCoupon);
  const updateCoupon = useDemoStore((state) => state.updateCoupon);
  const deleteCoupon = useDemoStore((state) => state.deleteCoupon);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-data"] });

  return {
    addCoupon: (coupon: Coupon) => {
      addCoupon(coupon);
      invalidate();
    },
    updateCoupon: (id: string, patch: Partial<Coupon>) => {
      updateCoupon(id, patch);
      invalidate();
    },
    deleteCoupon: (id: string) => {
      deleteCoupon(id);
      invalidate();
    },
  };
}

export function useVendorStatusMutation() {
  const queryClient = useQueryClient();
  const updateVendorStatus = useDemoStore((state) => state.updateVendorStatus);
  return (id: string, status: Store["status"]) => {
    updateVendorStatus(id, status);
    queryClient.invalidateQueries({ queryKey: ["admin-data"] });
  };
}
