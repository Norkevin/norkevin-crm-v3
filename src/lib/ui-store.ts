import { create } from "zustand";

export type QuickDialog =
  | "lead"
  | "job"
  | "client"
  | "invoice"
  | "quote"
  | "appointment"
  | null;

interface UIState {
  quickDialog: QuickDialog;
  openQuick: (d: QuickDialog) => void;
  closeQuick: () => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  quickDialog: null,
  openQuick: (d) => set({ quickDialog: d }),
  closeQuick: () => set({ quickDialog: null }),
  searchOpen: false,
  setSearchOpen: (v) => set({ searchOpen: v }),
}));
