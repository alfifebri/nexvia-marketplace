"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, Store, User, UserRole } from "@/types";
import { getApiErrorMessage } from "@/lib/api";
import { demoAccounts } from "@/lib/constants";
import { demoStores, demoUsers } from "@/lib/demo";
import {
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
  type LoginInput,
  type RegisterInput,
} from "@/lib/services/auth-service";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";
type SessionMode = "live" | "demo";

interface AuthState {
  user: User | null;
  store: Store | null;
  mode: SessionMode | null;
  status: AuthStatus;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setSession: (session: AuthSession, mode: SessionMode) => void;
  updateProfile: (patch: Partial<User>) => void;
  clearSession: () => void;
  login: (input: LoginInput) => Promise<{ ok: boolean; message?: string }>;
  register: (input: RegisterInput) => Promise<{ ok: boolean; message?: string }>;
  quickLogin: (role: UserRole) => Promise<{ ok: boolean; mode?: SessionMode; message?: string }>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const storeForVendor = (user: User) =>
  demoStores.find((store) => store.ownerId === user.id) ?? null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      store: null,
      mode: null,
      status: "idle",
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setSession: (session, mode) =>
        set({
          user: session.user,
          store: session.store,
          mode,
          status: "authenticated",
        }),
      updateProfile: (patch) => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, ...patch } });
      },
      clearSession: () =>
        set({ user: null, store: null, mode: null, status: "unauthenticated" }),
      login: async (input) => {
        set({ status: "loading" });
        try {
          const session = await loginRequest(input);
          set({
            user: session.user,
            store: session.store,
            mode: "live",
            status: "authenticated",
          });
          return { ok: true };
        } catch (error) {
          set({ status: "unauthenticated" });
          return { ok: false, message: getApiErrorMessage(error) };
        }
      },
      register: async (input) => {
        set({ status: "loading" });
        try {
          const session = await registerRequest(input);
          set({
            user: session.user,
            store: session.store,
            mode: "live",
            status: "authenticated",
          });
          return { ok: true };
        } catch (error) {
          set({ status: "unauthenticated" });
          return { ok: false, message: getApiErrorMessage(error) };
        }
      },
      quickLogin: async (role) => {
        const account = demoAccounts.find((item) => item.role === role);
        if (!account) return { ok: false, message: "Demo account unavailable." };

        set({ status: "loading" });

        try {
          const session = await loginRequest({ email: account.email, password: account.password });
          set({
            user: session.user,
            store: session.store,
            mode: "live",
            status: "authenticated",
          });
          return { ok: true, mode: "live" };
        } catch {
          const user = demoUsers[role === "vendor" ? "vendor" : role === "admin" ? "admin" : "customer"];
          set({
            user,
            store: role === "vendor" ? storeForVendor(user) : null,
            mode: "demo",
            status: "authenticated",
          });
          return {
            ok: true,
            mode: "demo",
            message: "Signed in with a local demo session. Live API is unavailable or unseeded.",
          };
        }
      },
      refreshSession: async () => {
        if (get().mode !== "live") return;
        try {
          const session = await meRequest();
          set({ user: session.user, store: session.store, status: "authenticated" });
        } catch {
          if (get().mode === "live") get().clearSession();
        }
      },
      logout: async () => {
        if (get().mode === "live") {
          try {
            await logoutRequest();
          } catch {
            /* session is already invalid — clear locally regardless */
          }
        }
        get().clearSession();
      },
    }),
    {
      name: "nexvia-auth-v1",
      partialize: (state) => ({ user: state.user, store: state.store, mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state?.user) {
          useAuthStore.setState({ status: "authenticated" });
        }
      },
    },
  ),
);

export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => Boolean(state.user));
