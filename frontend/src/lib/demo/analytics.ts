import type { AdminMetrics, Order, Product, RevenuePoint } from "@/types";
import { demoOrders } from "./orders";
import { demoProducts } from "./products";
import { demoVendors } from "./vendors";
import { roundCurrency } from "@/lib/utils";

const months = [
  "Nov 25",
  "Dec 25",
  "Jan 26",
  "Feb 26",
  "Mar 26",
  "Apr 26",
  "May 26",
  "Jun 26",
  "Jul 26",
  "Aug 26",
  "Sep 26",
  "Oct 26",
];

const baseRevenue = [102400, 138900, 96400, 118200, 131500, 127800, 149300, 162100, 174600, 189200, 208400, 224700];
const baseOrders = [612, 798, 571, 664, 721, 708, 812, 889, 934, 1004, 1087, 1168];

export const revenueSeries: RevenuePoint[] = months.map((month, index) => ({
  month,
  revenue: baseRevenue[index],
  commission: Math.round(baseRevenue[index] * 0.118),
  orders: baseOrders[index],
}));

export const adminMetrics: AdminMetrics = (() => {
  const gmv = revenueSeries.reduce((sum, point) => sum + point.revenue, 0);
  const commission = revenueSeries.reduce((sum, point) => sum + point.commission, 0);
  const orders = revenueSeries.reduce((sum, point) => sum + point.orders, 0);
  const categoryTotals = new Map<string, number>();
  for (const product of demoProducts) {
    const value = product.price * Math.max(1, Math.round(product.soldCount / 8));
    categoryTotals.set(product.category, (categoryTotals.get(product.category) ?? 0) + value);
  }
  const palette = ["#123c32", "#d8fb74", "#ef5b3f", "#88a5c9", "#b99ad6", "#d8b26a", "#6f9c7e", "#c9a0a0"];
  const categoryShare = [...categoryTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value], index) => ({
      name: name
        .split("-")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join(" "),
      value,
      color: palette[index % palette.length],
    }));

  return {
    gmv,
    commission,
    orders,
    customers: 18420,
    vendors: demoVendors.length,
    averageOrderValue: Math.round(gmv / orders),
    conversionRate: 3.84,
    revenueSeries,
    categoryShare,
    topVendors: demoVendors
      .filter((vendor) => vendor.revenue && vendor.revenue > 0)
      .sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0))
      .slice(0, 5)
      .map((vendor) => ({
        id: vendor.id,
        name: vendor.name,
        revenue: vendor.revenue ?? 0,
        commission: Math.round((vendor.revenue ?? 0) * (vendor.settings.commissionRate / 100)),
        orders: vendor.orderCount,
        status: vendor.status,
      })),
  };
})();

export const monthlyRevenue = (orders: Order[] = demoOrders) =>
  revenueSeries.map((point, index) => {
    const monthOrders = orders.filter((order) => {
      const date = new Date(order.placedAt);
      return date.getUTCMonth() === (new Date(2026, 9, 1).getUTCMonth() - (11 - index) + 12) % 12;
    });
    return {
      ...point,
      revenue: monthOrders.length > 0 ? point.revenue : point.revenue,
    };
  });

export interface VendorMetrics {
  revenue: number;
  commission: number;
  payout: number;
  orders: number;
  units: number;
  averageOrderValue: number;
  revenueSeries: RevenuePoint[];
  topProducts: Product[];
  pendingFulfillments: number;
  lowStock: Product[];
}

export const getVendorMetrics = (vendorId: string): VendorMetrics => {
  const products = demoProducts.filter((product) => product.vendorId === vendorId);
  const orders = demoOrders.filter((order) => order.items.some((item) => item.vendorId === vendorId));
  const items = orders.flatMap((order) => order.items.filter((item) => item.vendorId === vendorId));
  const revenue = roundCurrency(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const commission = roundCurrency(items.reduce((sum, item) => sum + item.platformFee, 0));
  const vendorSeries = revenueSeries.map((point, index) => {
    const scale = 0.12 + ((index + vendorId.length) % 5) * 0.012;
    return {
      ...point,
      revenue: Math.round(point.revenue * scale),
      commission: Math.round(point.commission * scale),
      orders: Math.max(3, Math.round(point.orders * scale * 0.35)),
    };
  });
  const pendingFulfillments = demoOrders.filter(
    (order) =>
      order.items.some(
        (item) => item.vendorId === vendorId && ["confirmed", "processing"].includes(item.status),
      ) && !["delivered", "cancelled", "refunded"].includes(order.status),
  ).length;

  return {
    revenue,
    commission,
    payout: roundCurrency(revenue - commission),
    orders: orders.length,
    units: items.reduce((sum, item) => sum + item.quantity, 0),
    averageOrderValue: orders.length ? roundCurrency(revenue / orders.length) : 0,
    revenueSeries: vendorSeries,
    topProducts: [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4),
    pendingFulfillments,
    lowStock: products.filter((product) => product.stock <= 10),
  };
};
