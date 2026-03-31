"use client";

import { create } from "zustand";
import { readStorage, writeStorage } from "@/lib/storage";
import type { Language } from "@/lib/types";

type SettingsState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const STORAGE_KEY = "ddt-settings-v1";

const persisted = readStorage<{ language: Language }>(STORAGE_KEY, { language: "en" });

export const useSettingsStore = create<SettingsState>((set) => ({
  language: persisted.language,
  setLanguage: (language) => {
    writeStorage(STORAGE_KEY, { language });
    set({ language });
  },
}));
