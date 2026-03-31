"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getQuestionById, getThemeSummaries } from "@/lib/question-loader";
import { QuestionCard } from "@/components/question-card";
import { useProgressStore } from "@/store/progress-store";
import { useQuizStore } from "@/store/quiz-store";
import { useSettingsStore } from "@/store/settings-store";
import type { Language, Question } from "@/lib/types";

function asSet(items: string[]): Set<string> {
  return new Set(items.sort());
}

function setsEqual(left: Set<string>, right: Set<string>): boolean {
  if (left.size !== right.size) {
    return false;
  }

  for (const value of left) {
    if (!right.has(value)) {
      return false;
    }
  }

  return true;
}

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "de";
}

export function QuizPanel() {
  const { language } = useSettingsStore();
  const themes = getThemeSummaries(language);

  const { questions, index, startedAt, filters, setFilters, startQuiz, nextQuestion, resetQuiz } = useQuizStore();
  const addAttempt = useProgressStore((state) => state.addAttempt);

  const current = questions[index];
  const [reviewQuestion, setReviewQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);

  const activeQuestion = reviewQuestion ?? current;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedTheme = params.get("theme");
    if (!requestedTheme || filters.themeNumber === requestedTheme) {
      return;
    }

    setFilters({ ...filters, themeNumber: requestedTheme });
  }, [filters, setFilters]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reviewQuestionId = params.get("review");
    if (!reviewQuestionId) {
      if (reviewQuestion) {
        setReviewQuestion(null);
      }
      return;
    }

    const requestedLanguage = params.get("lang");
    const lookupLanguage = isLanguage(requestedLanguage) ? requestedLanguage : language;
    const question = getQuestionById(reviewQuestionId, lookupLanguage) ?? null;
    setReviewQuestion(question);
    setSelected([]);
    setRevealed(false);
  }, [language, reviewQuestion]);

  useEffect(() => {
    if (questions.length === 0) {
      return;
    }

    const quizLanguage = questions[0]?.language;
    if (quizLanguage && quizLanguage !== language) {
      setSelected([]);
      setRevealed(false);
      startQuiz(language, filters);
    }
  }, [filters, language, questions, startQuiz]);

  const canStart = themes.length > 0;
  const completed = questions.length > 0 && index === questions.length - 1 && revealed;

  const quizProgress = useMemo(() => {
    if (questions.length === 0) {
      return "No active quiz";
    }

    return `Question ${index + 1} / ${questions.length}`;
  }, [index, questions.length]);

  function toggleOption(optionId: string): void {
    setSelected((prev) => (prev.includes(optionId) ? prev.filter((item) => item !== optionId) : [...prev, optionId]));
  }

  function submitAnswer(): void {
    if (!activeQuestion || selected.length === 0 || revealed) {
      return;
    }

    const correctIds = activeQuestion.options.filter((item) => item.isCorrect).map((item) => item.id);
    const isCorrect = setsEqual(asSet(selected), asSet(correctIds));

    addAttempt({
      id: `${Date.now()}-${activeQuestion.id}`,
      questionId: activeQuestion.id,
      questionText: activeQuestion.text,
      themeNumber: activeQuestion.themeNumber,
      language: activeQuestion.language,
      selectedOptionIds: selected,
      correctOptionIds: correctIds,
      isCorrect,
      attemptedAt: Date.now(),
      timeTakenSeconds: startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0,
    });

    setRevealed(true);
  }

  function goNext(): void {
    if (reviewQuestion) {
      setSelected([]);
      setRevealed(false);
      return;
    }

    setSelected([]);
    setRevealed(false);
    nextQuestion();
  }

  return (
    <section className="grid" style={{ gap: "1rem" }}>
      <article className="card">
        <div className="section-head">
          <h1 className="title">Quiz</h1>
          <span className="muted">{quizProgress}</span>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: "0.8rem" }}>
          <div>
            <label htmlFor="theme" className="muted">
              Theme
            </label>
            <select
              id="theme"
              className="field"
              value={filters.themeNumber ?? ""}
              onChange={(event) => setFilters({ ...filters, themeNumber: event.target.value || undefined })}
            >
              <option value="">All themes</option>
              {themes.map((theme) => (
                <option key={theme.themeNumber} value={theme.themeNumber}>
                  {theme.themeName} ({theme.themeNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="min-points" className="muted">
              Min points
            </label>
            <input
              id="min-points"
              className="field"
              type="number"
              min={1}
              max={7}
              value={filters.minPoints ?? ""}
              onChange={(event) => {
                const next = event.target.value ? Number(event.target.value) : undefined;
                setFilters({ ...filters, minPoints: next });
              }}
            />
          </div>

          <div>
            <label htmlFor="max-points" className="muted">
              Max points
            </label>
            <input
              id="max-points"
              className="field"
              type="number"
              min={1}
              max={7}
              value={filters.maxPoints ?? ""}
              onChange={(event) => {
                const next = event.target.value ? Number(event.target.value) : undefined;
                setFilters({ ...filters, maxPoints: next });
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button className="button primary" onClick={() => startQuiz(language, filters)} disabled={!canStart}>
            Start / Restart
          </button>
          <button className="button secondary" onClick={resetQuiz}>
            Reset Session
          </button>
        </div>
      </article>

      {activeQuestion ? (
        <>
          {reviewQuestion ? (
            <article className="card" style={{ background: "#f6f9ff" }}>
              <h3 style={{ marginBottom: "0.35rem" }}>Review Mode</h3>
              <p className="muted">This question was opened from your recent attempts so you can revisit it directly.</p>
              <Link href="/progress" className="button secondary" style={{ display: "inline-block", marginTop: "0.8rem" }}>
                Back to Progress
              </Link>
            </article>
          ) : null}

          <QuestionCard question={activeQuestion} selected={selected} revealed={revealed} onToggle={toggleOption} />
          <article className="card" style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <button className="button primary" onClick={submitAnswer} disabled={selected.length === 0 || revealed}>
              Check Answer
            </button>
            {reviewQuestion ? (
              <button className="button secondary" onClick={goNext} disabled={!revealed}>
                Retry Question
              </button>
            ) : (
              <button className="button secondary" onClick={goNext} disabled={!revealed || index === questions.length - 1}>
                Next Question
              </button>
            )}
          </article>
        </>
      ) : (
        <article className="card">
          <p className="muted">Start a quiz to begin practicing.</p>
        </article>
      )}

      {completed ? (
        <article className="card" style={{ background: "#f4fffb" }}>
          <h3>Session Complete</h3>
          <p className="muted">Great work. Start another session or switch filters for a focused drill.</p>
        </article>
      ) : null}
    </section>
  );
}
