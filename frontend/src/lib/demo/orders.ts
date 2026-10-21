import type { Address, Currency, Order, OrderItem, OrderStatus, PaymentProvider, SplitTransfer } from "@/types";
import { demoProducts } from "./products";
import { roundCurrency } from "@/lib/utils";

const riyaAddress: Address = {
  id: "addr-riya-home",
  label: "Home",
  recipientName: "Riya Sharma",
  phone: "+91 98765 43210",
  line1: "402, Willow Residency",
  line2: "12th Main, Indiranagar",
  city: "Bengaluru",
  state: "Karnataka",
  postalCode: "560038",
  country: "India",
  isDefault: true,
};

const danielAddress: Address = {
  recipientName: "Daniel Okafor",
  phone: "+44 7700 900123",
  line1: "18 Belsize Lane",
  line2: "Flat 3",
  city: "London",
  state: "Greater London",
  postalCode: "NW3 5AB",
  country: "United Kingdom",
};

const miaAddress: Address = {
  recipientName: "Mia Chen",
  phone: "+1 415 555 0173",
  line1: "1450 Valencia Street",
  city: "San Francisco",
  state: "CA",
  postalCode: "94110",
  country: "United States",
};

const customers = {
  riya: { id: "u-customer-riya", name: "Riya Sharma", email: "customer.riya@nexvia.dev", address: riyaAddress },
  daniel: { id: "u-customer-daniel", name: "Daniel Okafor", email: "customer.daniel@nexvia.dev", address: danielAddress },
  mia: { id: "u-customer-mia", name: "Mia Chen", email: "customer.mia@nexvia.dev", address: miaAddress },
};

const statusNotes: Record<OrderStatus, string> = {
  pending: "Order created and awaiting payment confirmation.",
  confirmed: "Payment confirmed and order accepted.",
  processing: "Store has packed your items.",
  shipped: "Package handed to the delivery partner.",
  delivered: "Delivered successfully.",
  cancelled: "Order cancelled and inventory released.",
  refunded: "Payment refunded to the original method.",
};

const flow: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

const makeHistory = (status: OrderStatus, placedAt: string) => {
  if (status === "cancelled" || status === "refunded") {
    return [
      { status: "pending" as OrderStatus, note: statusNotes.pending, at: placedAt },
      { status, note: statusNotes[status], at: new Date(new Date(placedAt).getTime() + 26 * 3600_000).toISOString() },
    ];
  }

  const end = flow.indexOf(status);
  return flow.slice(0, end + 1).map((step, index) => ({
    status: step,
    note: statusNotes[step],
    at: new Date(new Date(placedAt).getTime() + index * 17 * 3600_000).toISOString(),
  }));
};

const buildItems = (
  picks: { productId: string; quantity: number; variant?: Record<string, string>; variantLabel?: string }[],
): OrderItem[] =>
  picks.map((pick, index) => {
    const product = demoProducts.find((item) => item.id === pick.productId);
    if (!product) throw new Error(`Unknown product ${pick.productId}`);
    const store = product.storeName;
    const commissionRate = product.storeId === "s-pixel-forge" ? 9.5 : product.storeId === "s-aether-apparel" ? 14 : 12;
    const lineTotal = roundCurrency(product.price * pick.quantity);
    const platformFee = roundCurrency((lineTotal * commissionRate) / 100);
    return {
      id: `oi-${index + 1}`,
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.thumbnail,
      sku: product.sku,
      price: product.price,
      quantity: pick.quantity,
      variant: pick.variant,
      variantLabel: pick.variantLabel,
      lineTotal,
      vendorId: product.vendorId,
      storeId: product.storeId,
      storeName: store,
      commissionRate,
      platformFee,
      vendorPayout: roundCurrency(lineTotal - platformFee),
      status:
        pick.productId === "p-clay-mask"
          ? "pending"
          : product.storeId === "s-nova-audio"
            ? "delivered"
            : "confirmed",
    } satisfies OrderItem;
  });

const buildTransfers = (items: OrderItem[]): SplitTransfer[] => {
  const groups = new Map<string, SplitTransfer>();
  for (const item of items) {
    const current = groups.get(item.storeId);
    if (current) {
      current.amount = roundCurrency(current.amount + item.vendorPayout);
      current.commission = roundCurrency(current.commission + item.platformFee);
    } else {
      groups.set(item.storeId, {
        vendorId: item.vendorId,
        storeName: item.storeName,
        amount: item.vendorPayout,
        commission: item.platformFee,
        status: "paid",
        transferId: `tr_${item.storeId.replace("s-", "")}`,
      });
    }
  }
  return [...groups.values()];
};

interface OrderSeed {
  id: string;
  orderNumber: string;
  customer: keyof typeof customers;
  items: Parameters<typeof buildItems>[0];
  status: OrderStatus;
  placedAt: string;
  provider?: PaymentProvider;
  discountRate?: number;
  coupon?: string;
  shippingFee?: number;
  notes?: string;
  shippingLabel?: string;
}

const seedOrders: OrderSeed[] = [
  {
    id: "o-1042",
    orderNumber: "NX-2610-8F2A",
    customer: "riya",
    items: [
      { productId: "p-arc-one", quantity: 1, variant: { color: "sand" }, variantLabel: "Sand" },
      { productId: "p-type75", quantity: 1, variant: { switch: "linear", color: "bone" }, variantLabel: "Linear / Bone" },
    ],
    status: "delivered",
    placedAt: "2026-09-28T11:24:00.000Z",
    provider: "stripe",
    discountRate: 0.1,
    coupon: "NEXVIA10",
    notes: "Please leave with the concierge if I'm out.",
  },
  {
    id: "o-1043",
    orderNumber: "NX-2610-3B71",
    customer: "riya",
    items: [
      { productId: "p-halo-buds", quantity: 1, variant: { color: "midnight" }, variantLabel: "Midnight" },
      { productId: "p-pulse-speaker", quantity: 1, variant: { color: "forest" }, variantLabel: "Forest" },
    ],
    status: "shipped",
    placedAt: "2026-10-14T08:42:00.000Z",
    provider: "razorpay",
    shippingFee: 8.95,
  },
  {
    id: "o-1044",
    orderNumber: "NX-2610-77C9",
    customer: "riya",
    items: [{ productId: "p-botanic-serum", quantity: 2, variant: { size: "30" }, variantLabel: "30 ml" }],
    status: "processing",
    placedAt: "2026-10-17T15:05:00.000Z",
    provider: "stripe",
    shippingFee: 0,
  },
  {
    id: "o-1045",
    orderNumber: "NX-2610-1D4E",
    customer: "riya",
    items: [{ productId: "p-nomad-jacket", quantity: 1, variant: { color: "forest", size: "m" }, variantLabel: "Forest / M" }],
    status: "confirmed",
    placedAt: "2026-10-19T09:18:00.000Z",
    provider: "stripe",
    shippingFee: 8.95,
  },
  {
    id: "o-1046",
    orderNumber: "NX-2609-5A20",
    customer: "riya",
    items: [{ productId: "p-drift-chair", quantity: 1, variant: { leather: "cognac" }, variantLabel: "Cognac" }],
    status: "delivered",
    placedAt: "2026-08-30T12:00:00.000Z",
    provider: "stripe",
    discountRate: 0.05,
    coupon: "WELCOME15",
    shippingFee: 0,
  },
  {
    id: "o-1047",
    orderNumber: "NX-2610-9E13",
    customer: "daniel",
    items: [
      { productId: "p-void-headset", quantity: 1, variant: { color: "graphite" }, variantLabel: "Graphite" },
      { productId: "p-nexus-controller", quantity: 2, variant: { color: "black" }, variantLabel: "Black" },
    ],
    status: "shipped",
    placedAt: "2026-10-15T18:22:00.000Z",
    provider: "razorpay",
    shippingFee: 18.5,
    shippingLabel: "Express delivery",
  },
  {
    id: "o-1048",
    orderNumber: "NX-2610-2C88",
    customer: "mia",
    items: [
      { productId: "p-meridian-watch", quantity: 1, variant: { case: "titanium", "band-size": "m-l" }, variantLabel: "Titanium / M-L" },
      { productId: "p-glasshouse-serum", quantity: 1, variant: { size: "30" }, variantLabel: "30 ml" },
    ],
    status: "processing",
    placedAt: "2026-10-18T10:11:00.000Z",
    provider: "stripe",
    shippingFee: 8.95,
  },
  {
    id: "o-1049",
    orderNumber: "NX-2609-4F6D",
    customer: "daniel",
    items: [{ productId: "p-voyager-pack", quantity: 1, variant: { color: "olive" }, variantLabel: "Olive" }],
    status: "delivered",
    placedAt: "2026-09-12T07:40:00.000Z",
    provider: "cod",
    shippingFee: 8.95,
  },
  {
    id: "o-1050",
    orderNumber: "NX-2610-6H92",
    customer: "mia",
    items: [{ productId: "p-clay-mask", quantity: 1 }],
    status: "cancelled",
    placedAt: "2026-10-16T13:04:00.000Z",
    provider: "stripe",
    shippingFee: 8.95,
    notes: "Duplicate order — customer requested cancellation.",
  },
];

export const demoOrders: Order[] = seedOrders.map((seed) => {
  const customer = customers[seed.customer];
  const items = buildItems(seed.items);
  const itemStatus =
    seed.status === "delivered"
      ? "delivered"
      : seed.status === "shipped"
        ? "shipped"
        : seed.status === "cancelled" || seed.status === "refunded"
          ? "cancelled"
          : "confirmed";
  items.forEach((item) => {
    item.status = itemStatus;
  });
  const itemsTotal = roundCurrency(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const discount = seed.discountRate ? roundCurrency(itemsTotal * seed.discountRate) : 0;
  const shippingFee = seed.shippingFee ?? 0;
  const tax = roundCurrency((itemsTotal - discount) * 0.06);
  const grandTotal = roundCurrency(itemsTotal - discount + shippingFee + tax);
  const history = makeHistory(seed.status, seed.placedAt);
  const paid = seed.status !== "pending" && seed.status !== "cancelled";

  return {
    id: seed.id,
    orderNumber: seed.orderNumber,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email,
    items,
    shippingAddress: customer.address,
    totals: {
      itemsTotal,
      discount,
      shippingFee,
      tax,
      grandTotal,
      currency: "USD" as Currency,
    },
    payment: {
      provider: seed.provider ?? "stripe",
      method: seed.provider === "cod" ? "cash" : seed.provider === "razorpay" ? "upi" : "card",
      status: paid ? (seed.status === "refunded" ? "refunded" : "paid") : "pending",
      paymentIntentId: seed.provider === "razorpay" ? undefined : `pi_demo_${seed.id}`,
      paidAt: paid ? new Date(new Date(seed.placedAt).getTime() + 5 * 60_000).toISOString() : undefined,
      transfers: buildTransfers(items),
    },
    coupon: seed.coupon ? { code: seed.coupon, discount } : undefined,
    shippingMethod: {
      id: seed.shippingLabel ? "express" : "standard",
      label: seed.shippingLabel ?? "Standard delivery",
      description: "Tracked end to end.",
      eta: seed.shippingLabel ? "1–2 business days" : "3–5 business days",
      price: shippingFee,
    },
    status: seed.status,
    statusHistory: history,
    placedAt: seed.placedAt,
    deliveredAt: seed.status === "delivered" ? history.at(-1)?.at : undefined,
    notes: seed.notes,
  } as Order;
});

export const getOrderById = (id: string) =>
  demoOrders.find((order) => order.id === id || order.orderNumber === id);

export const ordersForCustomer = (customerId: string) =>
  demoOrders.filter((order) => order.customerId === customerId);

export const ordersForVendor = (vendorId: string) =>
  demoOrders.filter((order) => order.items.some((item) => item.vendorId === vendorId));
