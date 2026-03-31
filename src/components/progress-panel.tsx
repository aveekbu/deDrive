"use client";

import { useMemo } from "react";
import { calculateProgressStats, useProgressStore } from "@/store/progress-store";

export function ProgressPanel() {
  const attempts = useProgressStore((state) => state.attempts);
  const spacedRepetition = useProgressStore((state) => state.spacedRepetition);
  const stats = useMemo(() => calculateProgressStats(attempts, spacedRepetition), [attempts, spacedRepetition]);

  const groupedByTheme = useMemo(() => {
    const map = new Map<string, { total: number; correct: number }>();

    attempts.forEach((attempt) => {
      const existing = map.get(attempt.themeNumber) ?? { total: 0, correct: 0 };
      existing.total += 1;
      if (attempt.isCorrect) {
        existing.correct += 1;
      }
      map.set(attempt.themeNumber, existing);
    });

    return [...map.entries()].slice(0, 12);
  }, [attempts]);

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <article className="card">
        <h1 className="title">Progress</h1>
        <p className="muted">Detailed charts are coming next. This version already tracks accuracy, due reviews, and topic-level performance.</p>
      </article>

      <section className="grid stats">
        <article className="card">
          <p className="muted">Answered</p>
          <h2>{stats.totalAnswered}</h2>
        </article>
        <article className="card">
          <p className="muted">Correct</p>
          <h2>{stats.correctCount}</h2>
        </article>
        <article className="card">
          <p className="muted">Accuracy</p>
          <h2>{stats.accuracy}%</h2>
        </article>
        <article className="card">
          <p className="muted">Due Reviews</p>
          <h2>{stats.dueCount}</h2>
        </article>
      </section>

      <article className="card">
        <h2 style={{ marginBottom: "0.7rem" }}>Performance By Theme</h2>
        {groupedByTheme.length === 0 ? (
          <p className="muted">No attempts yet.</p>
        ) : (
          <div className="grid">
            {groupedByTheme.map(([theme, value]) => {
              const accuracy = Math.round((value.correct / value.total) * 100);

              return (
                <div key={theme} style={{ display: "flex", justifyContent: "space-between", gap: "0.7rem" }}>
                  <span>{theme}</span>
                  <span className="muted">
                    {value.correct}/{value.total} ({accuracy}%)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </article>

      <article className="card">
        <h2 style={{ marginBottom: "0.7rem" }}>Recent Attempts</h2>
        {attempts.length === 0 ? (
          <p className="muted">Start a quiz to generate attempt history.</p>
        ) : (
          <div className="grid">
            {attempts.slice(0, 20).map((attempt) => (
              <div key={attempt.id} style={{ display: "flex", justifyContent: "space-between", gap: "0.7rem" }}>
                <span style={{ maxWidth: "70%" }}>{attempt.questionText}</span>
                <span style={{ color: attempt.isCorrect ? "#228658" : "#c94343" }}>
                  {attempt.isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
