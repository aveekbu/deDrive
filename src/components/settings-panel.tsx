"use client";

import { useSettingsStore } from "@/store/settings-store";
import { useProgressStore } from "@/store/progress-store";

export function SettingsPanel() {
  const { language, setLanguage } = useSettingsStore();
  const clearProgress = useProgressStore((state) => state.clearProgress);

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <article className="card">
        <h1 className="title">Settings</h1>
        <p className="muted">Control language and local progress data.</p>
      </article>

      <article className="card">
        <h2 style={{ marginBottom: "0.7rem" }}>Language</h2>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button
            className="button secondary"
            onClick={() => setLanguage("en")}
            style={{ borderColor: language === "en" ? "var(--accent)" : undefined }}
          >
            English
          </button>
          <button
            className="button secondary"
            onClick={() => setLanguage("de")}
            style={{ borderColor: language === "de" ? "var(--accent)" : undefined }}
          >
            German
          </button>
        </div>
      </article>

      <article className="card">
        <h2 style={{ marginBottom: "0.7rem" }}>Data</h2>
        <p className="muted" style={{ marginBottom: "0.7rem" }}>
          Progress is stored in local browser storage for now.
        </p>
        <button
          className="button secondary"
          onClick={() => {
            const confirmed = window.confirm("Reset all local progress data?");
            if (confirmed) {
              clearProgress();
            }
          }}
        >
          Reset Progress
        </button>
      </article>
    </section>
  );
}
