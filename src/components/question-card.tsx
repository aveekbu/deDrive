"use client";

import { useMemo } from "react";
import type { Question } from "@/lib/types";

type QuestionCardProps = {
  question: Question;
  selected: string[];
  revealed: boolean;
  onToggle: (optionId: string) => void;
};

export function QuestionCard({ question, selected, revealed, onToggle }: QuestionCardProps) {
  const hasMultipleCorrect = useMemo(() => question.options.filter((item) => item.isCorrect).length > 1, [question.options]);

  return (
    <article className="card">
      <div className="section-head">
        <div>
          <p className="muted">{question.themeNumber}</p>
          <h2 style={{ marginTop: "0.25rem" }}>{question.text}</h2>
        </div>
        <span className="muted">{question.points} pts</span>
      </div>

      <p className="muted" style={{ marginBottom: "0.8rem" }}>
        {hasMultipleCorrect ? "Multiple answers may be correct." : "Choose one answer."}
      </p>

      {question.imageUrls.length > 0 ? (
        <section style={{ marginBottom: "0.9rem" }}>
          <p className="muted" style={{ marginBottom: "0.5rem" }}>
            Traffic Sign
          </p>
          <div className="grid" style={{ gap: "0.6rem" }}>
            {question.imageUrls.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer" className="muted" style={{ display: "block" }}>
                <img
                  src={url}
                  alt="Traffic sign for this question"
                  loading="lazy"
                  style={{ width: "100%", maxWidth: "460px", borderRadius: "10px", border: "1px solid var(--border)" }}
                />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {question.videoUrls.length > 0 ? (
        <section style={{ marginBottom: "0.9rem" }}>
          <p className="muted" style={{ marginBottom: "0.5rem" }}>
            Video Scenario
          </p>
          <div className="grid" style={{ gap: "0.6rem" }}>
            {question.videoUrls.map((url) => (
              <div key={url}>
                <video controls preload="metadata" style={{ width: "100%", maxWidth: "560px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                  <source src={url} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
                <a href={url} target="_blank" rel="noreferrer" className="muted" style={{ display: "inline-block", marginTop: "0.35rem" }}>
                  Open video in new tab
                </a>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid">
        {question.options.map((option) => {
          const isSelected = selected.includes(option.id);
          const isCorrect = option.isCorrect;

          let background = "white";
          let borderColor = "var(--border)";

          if (revealed && isCorrect) {
            background = "#ddf8ea";
            borderColor = "#68bc8d";
          } else if (revealed && isSelected && !isCorrect) {
            background = "#ffe1d9";
            borderColor = "#ea8a7a";
          } else if (isSelected) {
            background = "#eef6ff";
            borderColor = "#74a7e2";
          }

          return (
            <button
              key={option.id}
              type="button"
              className="button secondary"
              onClick={() => onToggle(option.id)}
              style={{ textAlign: "left", background, borderColor }}
              disabled={revealed}
            >
              <strong style={{ marginRight: "0.5rem" }}>{option.id}.</strong>
              {option.text}
            </button>
          );
        })}
      </div>

      {revealed ? (
        <div className="card" style={{ marginTop: "0.9rem", background: "#fbfcff" }}>
          <h3 style={{ marginBottom: "0.4rem" }}>Explanation</h3>
          <p className="muted">{question.explanation}</p>
        </div>
      ) : null}
    </article>
  );
}
