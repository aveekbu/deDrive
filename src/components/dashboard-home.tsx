"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getQuestionCounts } from "@/lib/question-loader";
import { calculateProgressStats, useProgressStore } from "@/store/progress-store";
import { useSettingsStore } from "@/store/settings-store";

export function DashboardHome() {
  const { language } = useSettingsStore();
  const attempts = useProgressStore((state) => state.attempts);
  const spacedRepetition = useProgressStore((state) => state.spacedRepetition);
  const stats = useMemo(() => calculateProgressStats(attempts, spacedRepetition), [attempts, spacedRepetition]);
  const counts = getQuestionCounts(language);

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <article className="card">
        <h1 className="title">Driving Theory Trainer</h1>
        <p className="muted">
          Practice German driving theory with spaced repetition. Data source currently loaded from local JSON for offline-first behavior.
        </p>
      </article>

      <section className="grid stats">
        <article className="card">
          <p className="muted">Language</p>
          <h2>{language.toUpperCase()}</h2>
        </article>
        <article className="card">
          <p className="muted">Questions</p>
          <h2>{counts.total}</h2>
        </article>
        <article className="card">
          <p className="muted">Themes</p>
          <h2>{counts.themes}</h2>
        </article>
        <article className="card">
          <p className="muted">Accuracy</p>
          <h2>{stats.accuracy}%</h2>
        </article>
        <article className="card">
          <p className="muted">Due For Review</p>
          <h2>{stats.dueCount}</h2>
        </article>
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Start Learning</h2>
        </div>
        <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
          <Link href="/quiz" className="button primary">
            Start Quiz
          </Link>
          <Link href="/topics" className="button secondary">
            Browse Topics
          </Link>
          <Link href="/progress" className="button secondary">
            View Progress
          </Link>
        </div>
      </section>
    </section>
  );
}
