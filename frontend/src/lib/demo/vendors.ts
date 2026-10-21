import type { Store, Vendor } from "@/types";

const baseSettings = {
  currency: "USD" as const,
  taxRate: 6,
  shippingFee: 8.95,
  freeShippingThreshold: 100,
  commissionRate: 12,
  acceptsReturns: true,
  returnWindowDays: 14,
};

const baseAddress = {
  recipientName: "",
  line1: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

export const demoStores: Store[] = [
  {
    id: "s-nova-audio",
    ownerId: "u-vendor-nova",
    name: "Nova Audio",
    slug: "nova-audio",
    description:
      "Independent acoustic studio building warm, room-filling sound since 2016. Every product is tuned by hand in our Copenhagen workshop.",
    logo: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=240&q=80",
    banner:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80",
    email: "vendor.nova@nexvia.dev",
    phone: "+45 32 14 88 20",
    status: "active",
    isVerified: true,
    rating: { average: 4.9, count: 214 },
    settings: { ...baseSettings, commissionRate: 12, returnWindowDays: 30 },
    socials: { website: "https://nova.audio", instagram: "@novaaudio" },
    address: {
      ...baseAddress,
      recipientName: "Nova Audio Studio",
      line1: "Bredgade 24",
      city: "Copenhagen",
      state: "Capital Region",
      postalCode: "1260",
      country: "Denmark",
    },
    policies: {
      shipping: "Dispatched within 24 hours. Free carbon-neutral shipping on orders over $100.",
      returns: "30-day no-questions returns on unopened audio equipment.",
    },
    createdAt: "2021-03-12T09:00:00.000Z",
  },
  {
    id: "s-pixel-forge",
    ownerId: "u-vendor-pixel",
    name: "Pixel Forge",
    slug: "pixel-forge",
    description:
      "Precision input devices and displays for people who spend their day at a desk. Engineer-owned, endlessly repairable.",
    logo: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=240&q=80",
    banner:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80",
    email: "vendor.pixel@nexvia.dev",
    phone: "+1 415 555 0142",
    status: "active",
    isVerified: true,
    rating: { average: 4.8, count: 176 },
    settings: { ...baseSettings, commissionRate: 9.5, shippingFee: 0 },
    socials: { website: "https://pixelforge.dev", x: "@pixelforge" },
    address: {
      ...baseAddress,
      recipientName: "Pixel Forge Inc.",
      line1: "88 Townsend Street",
      city: "San Francisco",
      state: "CA",
      postalCode: "94107",
      country: "United States",
    },
    policies: {
      shipping: "Ships from San Francisco within 2 business days.",
      returns: "14-day returns. 2-year hardware warranty on all peripherals.",
    },
    createdAt: "2020-08-04T09:00:00.000Z",
  },
  {
    id: "s-aether-apparel",
    ownerId: "u-vendor-aether",
    name: "Aether Apparel",
    slug: "aether-apparel",
    description:
      "Technical essentials cut from natural fibres. Designed in Lisbon, made in small batches across Portugal.",
    logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=240&q=80",
    banner:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=80",
    email: "vendor.aether@nexvia.dev",
    phone: "+351 21 555 0198",
    status: "active",
    isVerified: true,
    rating: { average: 4.7, count: 98 },
    settings: { ...baseSettings, commissionRate: 14, freeShippingThreshold: 150 },
    socials: { website: "https://aether.studio", instagram: "@aether.studio" },
    address: {
      ...baseAddress,
      recipientName: "Aether Studio",
      line1: "Rua da Prata 71",
      city: "Lisbon",
      state: "Lisboa",
      postalCode: "1100-052",
      country: "Portugal",
    },
    policies: {
      shipping: "Small-batch dispatch in 1–3 days. Free returns within the EU.",
      returns: "30-day returns on unworn items with tags attached.",
    },
    createdAt: "2022-01-19T09:00:00.000Z",
  },
  {
    id: "s-kanso-living",
    ownerId: "u-vendor-kanso",
    name: "Kanso Living",
    slug: "kanso-living",
    description:
      "Quiet homeware rooted in Japanese minimalism. Solid oak, stoneware and linen, built to outlive trends.",
    logo: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=240&q=80",
    banner:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
    email: "vendor.kanso@nexvia.dev",
    phone: "+81 3 5555 0177",
    status: "active",
    isVerified: true,
    rating: { average: 4.8, count: 142 },
    settings: { ...baseSettings, commissionRate: 11, shippingFee: 12 },
    socials: { website: "https://kanso.jp", instagram: "@kanso.living" },
    address: {
      ...baseAddress,
      recipientName: "Kanso Living",
      line1: "2-14-6 Meguro",
      city: "Tokyo",
      state: "Tokyo",
      postalCode: "153-0063",
      country: "Japan",
    },
    policies: {
      shipping: "White-glove delivery on furniture. Flat $12 on homeware.",
      returns: "14-day returns. Made-to-order items are final sale.",
    },
    createdAt: "2019-11-02T09:00:00.000Z",
  },
  {
    id: "s-terra-goods",
    ownerId: "u-vendor-terra",
    name: "Terra Goods",
    slug: "terra-goods",
    description:
      "Plant-based skincare and outdoor provisions. Refillable packaging, traceable ingredients, no greenwash.",
    logo: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=240&q=80",
    banner:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1600&q=80",
    email: "vendor.terra@nexvia.dev",
    phone: "+234 1 555 0110",
    status: "active",
    isVerified: true,
    rating: { average: 4.6, count: 87 },
    settings: { ...baseSettings, commissionRate: 13, taxRate: 4 },
    socials: { website: "https://terragoods.co", instagram: "@terragoods" },
    address: {
      ...baseAddress,
      recipientName: "Terra Goods",
      line1: "12 Adeola Odeku Street",
      city: "Lagos",
      state: "Lagos",
      postalCode: "101241",
      country: "Nigeria",
    },
    policies: {
      shipping: "Plastic-free packaging, shipped within 2 business days.",
      returns: "Unopened skincare can be returned within 30 days.",
    },
    createdAt: "2023-05-08T09:00:00.000Z",
  },
  {
    id: "s-orbit-supply",
    ownerId: "u-vendor-orbit",
    name: "Orbit Supply",
    slug: "orbit-supply",
    description:
      "Trail-tested outdoor gear from a two-person team in Boulder. New to Nexvia and currently in review.",
    logo: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=240&q=80",
    banner:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
    email: "vendor.orbit@nexvia.dev",
    phone: "+1 720 555 0128",
    status: "pending",
    isVerified: false,
    rating: { average: 0, count: 0 },
    settings: { ...baseSettings, commissionRate: 10.5 },
    socials: { website: "https://orbitsupply.co" },
    address: {
      ...baseAddress,
      recipientName: "Orbit Supply LLC",
      line1: "1942 Pearl Street",
      city: "Boulder",
      state: "CO",
      postalCode: "80302",
      country: "United States",
    },
    createdAt: "2026-09-28T09:00:00.000Z",
  },
  {
    id: "s-lumen-lab",
    ownerId: "u-vendor-lumen",
    name: "Lumen Lab",
    slug: "lumen-lab",
    description:
      "Clinical-adjacent beauty with a soft spot for refillable glass. Formulated in small batches in Bengaluru.",
    logo: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=240&q=80",
    banner:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1600&q=80",
    email: "vendor.lumen@nexvia.dev",
    phone: "+91 80 5555 0193",
    status: "active",
    isVerified: true,
    rating: { average: 4.4, count: 41 },
    settings: { ...baseSettings, commissionRate: 12.5, taxRate: 5 },
    socials: { website: "https://lumenlab.in", instagram: "@lumenlab" },
    address: {
      ...baseAddress,
      recipientName: "Lumen Lab",
      line1: "31 Indiranagar 100ft Road",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      country: "India",
    },
    createdAt: "2024-02-14T09:00:00.000Z",
  },
];

const owners: Record<string, { name: string; email: string }> = {
  "u-vendor-nova": { name: "Nadia Okafor", email: "vendor.nova@nexvia.dev" },
  "u-vendor-pixel": { name: "Kenji Sato", email: "vendor.pixel@nexvia.dev" },
  "u-vendor-aether": { name: "Elena Rossi", email: "vendor.aether@nexvia.dev" },
  "u-vendor-kanso": { name: "Haruto Tanaka", email: "vendor.kanso@nexvia.dev" },
  "u-vendor-terra": { name: "Amara Bello", email: "vendor.terra@nexvia.dev" },
  "u-vendor-orbit": { name: "Marcus Reid", email: "vendor.orbit@nexvia.dev" },
  "u-vendor-lumen": { name: "Priya Iyer", email: "vendor.lumen@nexvia.dev" },
};

export const demoVendors: Vendor[] = demoStores.map((store, index) => {
  const owner = owners[store.ownerId] ?? { name: "Store Owner", email: store.email };
  return {
    ...store,
    ownerName: owner.name,
    ownerEmail: owner.email,
    joinedAt: store.createdAt,
    orderCount: [186, 142, 88, 121, 64, 0, 22][index] ?? 0,
    revenue: [48210, 39640, 27480, 21950, 12240, 0, 3860][index] ?? 0,
  };
});

export const getStore = (id: string) => demoStores.find((store) => store.id === id);
export const getStoreByVendor = (vendorId: string) =>
  demoStores.find((store) => store.ownerId === vendorId);
