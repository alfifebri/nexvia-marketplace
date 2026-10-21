"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  ids: string[];
  toggle: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const exists = get().ids.includes(id);
        set({ ids: exists ? get().ids.filter((item) => item !== id) : [id, ...get().ids] });
        return !exists;
      },
      remove: (id) => set({ ids: get().ids.filter((item) => item !== id) }),
      clear: () => set({ ids: [] }),
    }),
    { name: "nexvia-wishlist-v1" },
  ),
);

export const useWishlistCount = () => useWishlistStore((state) => state.ids.length);
