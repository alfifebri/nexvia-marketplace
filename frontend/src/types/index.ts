export type ID = string;
export type Currency = "USD" | "INR" | "EUR";
export type UserRole = "customer" | "vendor" | "admin";

export interface Address {
  id?: string;
  label?: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  addresses?: Address[];
  isEmailVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthSession {
  user: User;
  store: Store | null;
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface Store {
  id: ID;
  ownerId: ID;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  email: string;
  phone: string;
  status: "pending" | "active" | "suspended";
  isVerified: boolean;
  rating: { average: number; count: number };
  settings: {
    currency: Currency;
    taxRate: number;
    shippingFee: number;
    freeShippingThreshold: number;
    commissionRate: number;
    acceptsReturns: boolean;
    returnWindowDays: number;
  };
  socials?: {
    website?: string;
    instagram?: string;
    facebook?: string;
    x?: string;
  };
  address?: Partial<Address>;
  policies?: { shipping?: string; returns?: string };
  createdAt: string;
  productCount?: number;
  revenue?: number;
}

export interface Vendor extends Store {
  ownerName: string;
  ownerEmail: string;
  joinedAt: string;
  orderCount: number;
}

export interface VariantOption {
  label: string;
  value: string;
  swatch?: string;
  priceDelta?: number;
  stock?: number;
}

export interface VariantGroup {
  name: string;
  options: VariantOption[];
}

export interface Product {
  id: ID;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  price: number;
  compareAtPrice?: number;
  currency: Currency;
  category: string;
  categoryLabel: string;
  brand: string;
  images: string[];
  thumbnail: string;
  rating: { rate: number; count: number };
  stock: number;
  sku: string;
  discountPercentage: number;
  tags: string[];
  attributes: Record<string, string | number>;
  variants: VariantGroup[];
  warrantyInformation: string;
  shippingInformation: string;
  returnPolicy: string;
  vendorId: ID;
  storeId: ID;
  storeName: string;
  status: "draft" | "active" | "archived";
  isFeatured: boolean;
  soldCount: number;
  source: string;
  createdAt: string;
}

export interface Review {
  id: ID;
  productId: ID;
  userId: ID;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  vendorReply?: { comment: string; repliedAt: string };
}

export interface Category {
  slug: string;
  label: string;
  description: string;
  image: string;
  accent: string;
  icon: string;
}

export interface CartLine {
  key: string;
  productId: ID;
  slug: string;
  title: string;
  thumbnail: string;
  price: number;
  currency: Currency;
  quantity: number;
  stock: number;
  vendorId: ID;
  storeId: ID;
  storeName: string;
  variant?: Record<string, string>;
  variantLabel?: string;
}

export interface Coupon {
  id: ID;
  code: string;
  description: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
  usageLimit: number;
  used: number;
  status: "active" | "scheduled" | "expired" | "disabled";
  startsAt: string;
  expiresAt: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded";
export type PaymentProvider = "stripe" | "razorpay" | "cod";

export interface OrderItem {
  id: ID;
  productId: ID;
  slug: string;
  title: string;
  image: string;
  sku: string;
  price: number;
  quantity: number;
  variant?: Record<string, string>;
  variantLabel?: string;
  lineTotal: number;
  vendorId: ID;
  storeId: ID;
  storeName: string;
  commissionRate: number;
  platformFee: number;
  vendorPayout: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
}

export interface SplitTransfer {
  vendorId: ID;
  storeName: string;
  amount: number;
  commission: number;
  status: "pending" | "paid" | "failed" | "reversed";
  transferId?: string;
}

export interface Order {
  id: ID;
  orderNumber: string;
  customerId: ID;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  shippingAddress: Address;
  totals: {
    itemsTotal: number;
    discount: number;
    shippingFee: number;
    tax: number;
    grandTotal: number;
    currency: Currency;
  };
  payment: {
    provider: PaymentProvider;
    method: string;
    status: PaymentStatus;
    paymentIntentId?: string;
    paidAt?: string;
    transfers: SplitTransfer[];
  };
  coupon?: { code: string; discount: number };
  shippingMethod: {
    id: string;
    label: string;
    description: string;
    eta: string;
    price: number;
  };
  status: OrderStatus;
  statusHistory: { status: OrderStatus; note: string; at: string }[];
  placedAt: string;
  deliveredAt?: string;
  notes?: string;
}

export interface ShippingMethod {
  id: string;
  label: string;
  description: string;
  eta: string;
  price: number;
  badge?: string;
}

export interface ProductFilters {
  q: string;
  categories: string[];
  brands: string[];
  minPrice: number;
  maxPrice: number;
  rating: number;
  inStock: boolean;
  onSale: boolean;
  sort: SortKey;
  page: number;
  pageSize: number;
}

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating" | "popular";

export interface FacetBucket {
  value: string;
  label: string;
  count: number;
}

export interface SearchResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  facets: {
    categories: FacetBucket[];
    brands: FacetBucket[];
    price: { min: number; max: number };
    availability: { inStock: number; onSale: number };
  };
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  commission: number;
  orders: number;
}

export interface AdminMetrics {
  gmv: number;
  commission: number;
  orders: number;
  customers: number;
  vendors: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueSeries: RevenuePoint[];
  categoryShare: { name: string; value: number; color: string }[];
  topVendors: { id: ID; name: string; revenue: number; commission: number; orders: number; status: Store["status"] }[];
}
