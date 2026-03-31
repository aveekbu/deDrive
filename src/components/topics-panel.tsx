"use client";

import Link from "next/link";
import { getThemeSummaries } from "@/lib/question-loader";
import { useSettingsStore } from "@/store/settings-store";

export function TopicsPanel() {
  const { language } = useSettingsStore();
  const themes = getThemeSummaries(language);

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <article className="card">
        <h1 className="title">Topics</h1>
        <p className="muted">Browse sorted themes, pick a chapter, and jump straight into focused practice.</p>
      </article>

      <section className="topic-grid">
        {themes.map((theme, index) => {
          const hue = (index * 31) % 360;
          const background = `linear-gradient(140deg, hsl(${hue} 85% 95%) 0%, hsl(${(hue + 28) % 360} 86% 90%) 100%)`;

          return (
            <article key={theme.themeNumber} className="card topic-card" style={{ background }}>
              <div className="topic-meta">
                <p className="topic-number">{theme.themeNumber}</p>
                <h2>{theme.themeName}</h2>
                <p className="muted">
                  {theme.questionCount} questions • {theme.mediaCount} with image/video
                </p>
                <Link
                  href={`/quiz?theme=${encodeURIComponent(theme.themeNumber)}`}
                  className="button secondary"
                  style={{ display: "inline-block", marginTop: "0.8rem" }}
                >
                  Practice This Theme
                </Link>
              </div>

              <div className="topic-visual">
                {theme.coverImageUrl ? (
                  <img src={theme.coverImageUrl} alt={`Preview for ${theme.themeName}`} loading="lazy" />
                ) : (
                  <img src="/traffic-hero.svg" alt="Driving theory illustration" loading="lazy" />
                )}
              </div>
            </article>
          );
        })}
      </section>
    </section>
  );
}
