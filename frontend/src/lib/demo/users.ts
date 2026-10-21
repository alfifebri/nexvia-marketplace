import type { Address, User } from "@/types";

const address: Address = {
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

export const demoUsers: Record<"customer" | "vendor" | "admin", User> = {
  customer: {
    id: "u-customer-riya",
    name: "Riya Sharma",
    email: "customer.riya@nexvia.dev",
    role: "customer",
    phone: "+91 98765 43210",
    avatar: "https://picsum.photos/seed/riya/160/160",
    addresses: [address],
    isEmailVerified: true,
    isActive: true,
    createdAt: "2024-06-11T09:00:00.000Z",
  },
  vendor: {
    id: "u-vendor-nova",
    name: "Nadia Okafor",
    email: "vendor.nova@nexvia.dev",
    role: "vendor",
    phone: "+45 32 14 88 20",
    avatar: "https://picsum.photos/seed/nadia/160/160",
    addresses: [],
    isEmailVerified: true,
    isActive: true,
    createdAt: "2021-03-12T09:00:00.000Z",
  },
  admin: {
    id: "u-admin-nexvia",
    name: "Nexvia Admin",
    email: "admin@nexvia.dev",
    role: "admin",
    phone: "+1 415 555 0100",
    avatar: "https://picsum.photos/seed/nexvia-admin/160/160",
    addresses: [],
    isEmailVerified: true,
    isActive: true,
    createdAt: "2019-01-01T09:00:00.000Z",
  },
};

export const demoAddress = address;
