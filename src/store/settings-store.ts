"use client";

import { create } from "zustand";
import { readStorage, writeStorage } from "@/lib/storage";
import type { Language } from "@/lib/types";

type SettingsState = {
  language: Language;
  hasHydrated: boolean;
  hydrate: () => void;
  setLanguage: (language: Language) => void;
};

const STORAGE_KEY = "ddt-settings-v1";

export const useSettingsStore = create<SettingsState>((set) => ({
  language: "en",
  hasHydrated: false,
  hydrate: () => {
    const persisted = readStorage<{ language: Language }>(STORAGE_KEY, { language: "en" });
    set({ language: persisted.language, hasHydrated: true });
  },
  setLanguage: (language) => {
    writeStorage(STORAGE_KEY, { language });
    set({ language });
  },
}));
