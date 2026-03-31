"use client";

import { useEffect, useMemo, useState } from "react";
import { getThemeNumbers } from "@/lib/question-loader";
import { QuestionCard } from "@/components/question-card";
import { useProgressStore } from "@/store/progress-store";
import { useQuizStore } from "@/store/quiz-store";
import { useSettingsStore } from "@/store/settings-store";

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

export function QuizPanel() {
  const { language } = useSettingsStore();
  const themes = getThemeNumbers(language);

  const { questions, index, startedAt, filters, setFilters, startQuiz, nextQuestion, resetQuiz } = useQuizStore();
  const addAttempt = useProgressStore((state) => state.addAttempt);

  const current = questions[index];
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);

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
    if (!current || selected.length === 0 || revealed) {
      return;
    }

    const correctIds = current.options.filter((item) => item.isCorrect).map((item) => item.id);
    const isCorrect = setsEqual(asSet(selected), asSet(correctIds));

    addAttempt({
      id: `${Date.now()}-${current.id}`,
      questionId: current.id,
      questionText: current.text,
      themeNumber: current.themeNumber,
      language: current.language,
      selectedOptionIds: selected,
      correctOptionIds: correctIds,
      isCorrect,
      attemptedAt: Date.now(),
      timeTakenSeconds: startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0,
    });

    setRevealed(true);
  }

  function goNext(): void {
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
                <option key={theme} value={theme}>
                  {theme}
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

      {current ? (
        <>
          <QuestionCard question={current} selected={selected} revealed={revealed} onToggle={toggleOption} />
          <article className="card" style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <button className="button primary" onClick={submitAnswer} disabled={selected.length === 0 || revealed}>
              Check Answer
            </button>
            <button className="button secondary" onClick={goNext} disabled={!revealed || index === questions.length - 1}>
              Next Question
            </button>
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
