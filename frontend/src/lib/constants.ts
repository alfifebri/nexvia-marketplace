import type { Category, OrderStatus, ShippingMethod, Store, UserRole } from "@/types";

export const siteConfig = {
  name: "Nexvia",
  legalName: "Nexvia Technologies",
  tagline: "The marketplace for things worth keeping.",
  description:
    "Nexvia is a curated multi-vendor marketplace for considered design, independent makers and everyday essentials — with transparent split payouts for every seller.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supportEmail: "concierge@nexvia.dev",
  socials: {
    instagram: "https://instagram.com",
    x: "https://x.com",
    linkedin: "https://linkedin.com",
  },
};

export const categories: Category[] = [
  {
    slug: "audio",
    label: "Audio",
    description: "Headphones, speakers and analog sound.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    accent: "#d8fb74",
    icon: "Headphones",
  },
  {
    slug: "wearables",
    label: "Wearables",
    description: "Timepieces and tech you actually wear.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80",
    accent: "#ffb59a",
    icon: "Watch",
  },
  {
    slug: "computing",
    label: "Computing",
    description: "Desks built for deep work.",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80",
    accent: "#b8d7ff",
    icon: "Keyboard",
  },
  {
    slug: "home-living",
    label: "Home & Living",
    description: "Objects that make a room feel finished.",
    image:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80",
    accent: "#e8d5b5",
    icon: "Armchair",
  },
  {
    slug: "apparel",
    label: "Apparel",
    description: "Fewer, better layers for every climate.",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80",
    accent: "#ffc9c9",
    icon: "Shirt",
  },
  {
    slug: "beauty",
    label: "Beauty",
    description: "Botanical formulas, quietly effective.",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80",
    accent: "#f3d6ff",
    icon: "Sparkles",
  },
  {
    slug: "outdoors",
    label: "Outdoors",
    description: "Gear for the long way around.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80",
    accent: "#c7e8cf",
    icon: "Mountain",
  },
  {
    slug: "gaming",
    label: "Gaming",
    description: "Play setups without the plastic.",
    image:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1000&q=80",
    accent: "#c9c2ff",
    icon: "Gamepad2",
  },
];

export const categoryLabel = (slug: string) =>
  categories.find((category) => category.slug === slug)?.label ??
  slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const demoAccounts: {
  role: UserRole;
  label: string;
  blurb: string;
  email: string;
  password: string;
  name: string;
}[] = [
  {
    role: "customer",
    label: "Customer",
    blurb: "Shop, review and track orders",
    name: "Riya Sharma",
    email: process.env.NEXT_PUBLIC_DEMO_CUSTOMER_EMAIL || "customer.riya@nexvia.dev",
    password: process.env.NEXT_PUBLIC_DEMO_CUSTOMER_PASSWORD || "Customer@123",
  },
  {
    role: "vendor",
    label: "Vendor",
    blurb: "Manage Nova Audio storefront",
    name: "Nadia Okafor",
    email: process.env.NEXT_PUBLIC_DEMO_VENDOR_EMAIL || "vendor.nova@nexvia.dev",
    password: process.env.NEXT_PUBLIC_DEMO_VENDOR_PASSWORD || "Vendor@123",
  },
  {
    role: "admin",
    label: "Admin",
    blurb: "Platform analytics & payouts",
    name: "Nexvia Admin",
    email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || "admin@nexvia.dev",
    password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || "Admin@123",
  },
];

export const mainNav = [
  { label: "Shop all", href: "/products" },
  { label: "New in", href: "/products?sort=newest" },
  { label: "Deals", href: "/products?onSale=true" },
  { label: "Vendors", href: "/vendors" },
];

export const footerNav = {
  shop: [
    { label: "All products", href: "/products" },
    { label: "New arrivals", href: "/products?sort=newest" },
    { label: "Editor's picks", href: "/products?sort=featured" },
    { label: "Sale", href: "/products?onSale=true" },
  ],
  company: [
    { label: "Our story", href: "/about" },
    { label: "Sell on Nexvia", href: "/vendor/onboarding" },
    { label: "Vendor portal", href: "/vendor" },
    { label: "Careers", href: "/about#careers" },
  ],
  support: [
    { label: "Help centre", href: "/support" },
    { label: "Shipping & returns", href: "/support#shipping" },
    { label: "Track an order", href: "/account/orders" },
    { label: "Contact us", href: "/support#contact" },
  ],
};

export const shippingMethods: ShippingMethod[] = [
  {
    id: "standard",
    label: "Standard delivery",
    description: "Carbon-neutral courier, tracked end to end.",
    eta: "3–5 business days",
    price: 8.95,
    badge: "Free over $100",
  },
  {
    id: "express",
    label: "Express delivery",
    description: "Priority handling, first out of the warehouse.",
    eta: "1–2 business days",
    price: 18.5,
    badge: "Most popular",
  },
  {
    id: "pickup",
    label: "Studio pickup",
    description: "Collect from your nearest Nexvia partner studio.",
    eta: "Ready in 24 hours",
    price: 0,
  },
];

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; tone: string; description: string; step: number }
> = {
  pending: {
    label: "Pending",
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    description: "Awaiting payment confirmation",
    step: 0,
  },
  confirmed: {
    label: "Confirmed",
    tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
    description: "Payment captured and order accepted",
    step: 1,
  },
  processing: {
    label: "Packed",
    tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
    description: "Your items are being packed",
    step: 2,
  },
  shipped: {
    label: "Shipped",
    tone: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    description: "On the way to you",
    step: 3,
  },
  delivered: {
    label: "Delivered",
    tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    description: "Delivered successfully",
    step: 4,
  },
  cancelled: {
    label: "Cancelled",
    tone: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    description: "Order cancelled",
    step: -1,
  },
  refunded: {
    label: "Refunded",
    tone: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
    description: "Payment refunded",
    step: -1,
  },
};

export const fulfillmentFlow: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered"];

export const storeStatusTone: Record<Store["status"], string> = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  suspended: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
};

export const trustedBrands = [
  "NOVA AUDIO",
  "PIXEL FORGE",
  "AETHER",
  "KANSO",
  "TERRA GOODS",
  "ORBIT SUPPLY",
  "LUMEN LAB",
];
