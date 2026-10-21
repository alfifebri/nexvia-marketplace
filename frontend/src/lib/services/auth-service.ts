import type { Address, AuthSession, Store, User, UserRole } from "@/types";
import { apiGet, apiPatch, apiPost, setAccessToken } from "@/lib/api";

interface BackendUser {
  id?: string;
  _id?: string;
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

interface BackendStore {
  id?: string;
  _id?: string;
  owner?: string;
  ownerId?: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  email?: string;
  phone?: string;
  status?: Store["status"];
  isVerified?: boolean;
  rating?: { average?: number; count?: number };
  settings?: Partial<Store["settings"]>;
  socials?: Store["socials"];
  policies?: Store["policies"];
  createdAt?: string;
}

interface BackendSession {
  user: BackendUser;
  store?: BackendStore | null;
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
}

const defaultSettings: Store["settings"] = {
  currency: "USD",
  taxRate: 6,
  shippingFee: 8.95,
  freeShippingThreshold: 100,
  commissionRate: 12,
  acceptsReturns: true,
  returnWindowDays: 14,
};

const toUser = (user: BackendUser): User => ({
  id: user.id ?? user._id ?? "",
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone ?? "",
  avatar: user.avatar ?? "",
  addresses: user.addresses ?? [],
  isEmailVerified: user.isEmailVerified ?? false,
  isActive: user.isActive ?? true,
  createdAt: user.createdAt ?? new Date().toISOString(),
});

const toStore = (store: BackendStore | null | undefined): Store | null => {
  if (!store) return null;
  return {
    id: store.id ?? store._id ?? "",
    ownerId: store.ownerId ?? store.owner ?? "",
    name: store.name,
    slug: store.slug,
    description: store.description ?? "",
    logo: store.logo ?? "",
    banner: store.banner ?? "",
    email: store.email ?? "",
    phone: store.phone ?? "",
    status: store.status ?? "pending",
    isVerified: store.isVerified ?? false,
    rating: {
      average: store.rating?.average ?? 0,
      count: store.rating?.count ?? 0,
    },
    settings: { ...defaultSettings, ...store.settings },
    socials: store.socials,
    policies: store.policies,
    createdAt: store.createdAt ?? new Date().toISOString(),
  };
};

const toSession = (session: BackendSession): AuthSession => {
  if (session.accessToken) setAccessToken(session.accessToken);
  return {
    user: toUser(session.user),
    store: toStore(session.store),
    accessToken: session.accessToken,
    tokenType: session.tokenType,
    expiresIn: session.expiresIn,
  };
};

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  storeName?: string;
  phone?: string;
}

export async function loginRequest(input: LoginInput): Promise<AuthSession> {
  const response = await apiPost<BackendSession>("/auth/login", input);
  return toSession(response.data);
}

export async function registerRequest(input: RegisterInput): Promise<AuthSession> {
  const response = await apiPost<BackendSession>("/auth/register", input);
  return toSession(response.data);
}

export async function meRequest(): Promise<AuthSession> {
  const response = await apiGet<BackendSession>("/auth/me");
  return toSession(response.data);
}

export async function logoutRequest(): Promise<void> {
  try {
    await apiPost("/auth/logout");
  } finally {
    setAccessToken(null);
  }
}

export async function updatePasswordRequest(input: { currentPassword: string; newPassword: string }) {
  return apiPatch("/auth/password", input);
}
