"use client";

import { create } from "zustand";

interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  mobileNavOpen: boolean;
  filtersOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setSearchOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setFiltersOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  mobileNavOpen: false,
  filtersOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setFiltersOpen: (open) => set({ filtersOpen: open }),
}));
