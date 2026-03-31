"use client";

import { useMemo } from "react";
import Image from "next/image";
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
      <article className="card hero-card">
        <div className="hero-layout">
          <div className="hero-copy">
            <p className="badge">Adaptive Learning System</p>
            <h1 className="title hero-title">Pass Driving Theory Faster With Structured Daily Practice</h1>
            <p className="muted hero-description">
              Train with real exam-style questions, automatic spaced-repetition scheduling, and a focused study flow designed for German
              driving theory preparation.
            </p>
            <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
              <Link href="/quiz" className="button primary">
                Start Quiz Session
              </Link>
              <Link href="/topics" className="button secondary">
                Explore Topics
              </Link>
            </div>
            <div className="hero-tags">
              <span className="tag">Language: {language.toUpperCase()}</span>
              <span className="tag">{counts.total} official-style questions</span>
              <span className="tag">{stats.dueCount} due right now</span>
            </div>
          </div>

          <div className="hero-art">
            <Image src="/traffic-hero.svg" alt="Driving theory dashboard illustration" width={520} height={346} priority />
          </div>
        </div>
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
          <h2>Study Actions</h2>
        </div>
        <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
          <Link href="/quiz" className="button primary">
            Continue Practice
          </Link>
          <Link href="/topics" className="button secondary">
            Choose By Topic
          </Link>
          <Link href="/progress" className="button secondary">
            Analyze Progress
          </Link>
        </div>
      </section>
    </section>
  );
}
