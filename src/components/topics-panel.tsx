"use client";

import Link from "next/link";
import { getQuestions, getThemeNumbers } from "@/lib/question-loader";
import { useSettingsStore } from "@/store/settings-store";

export function TopicsPanel() {
  const { language } = useSettingsStore();
  const themes = getThemeNumbers(language);

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <article className="card">
        <h1 className="title">Topics</h1>
        <p className="muted">Browse themes and launch focused sessions by selecting a theme in Quiz filters.</p>
      </article>

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        {themes.map((theme) => {
          const questions = getQuestions({ language, themeNumber: theme });
          return (
            <article key={theme} className="card">
              <p className="muted">{theme}</p>
              <h2 style={{ margin: "0.35rem 0" }}>{questions[0]?.themeName ?? "Unknown Theme"}</h2>
              <p className="muted">Questions: {questions.length}</p>
              <Link href="/quiz" className="button secondary" style={{ display: "inline-block", marginTop: "0.8rem" }}>
                Practice This Theme
              </Link>
            </article>
          );
        })}
      </section>
    </section>
  );
}
