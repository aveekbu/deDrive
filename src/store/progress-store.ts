"use client";

import { create } from "zustand";
import { isDueForReview, scheduleReview } from "@/lib/spaced-repetition";
import { readStorage, writeStorage } from "@/lib/storage";
import type { ProgressSnapshot, SpacedRepetitionData, UserAttempt } from "@/lib/types";

type ProgressStats = {
  totalAnswered: number;
  correctCount: number;
  accuracy: number;
  dueCount: number;
};

export function calculateProgressStats(
  attempts: UserAttempt[],
  spacedRepetition: Record<string, SpacedRepetitionData>,
): ProgressStats {
  const totalAnswered = attempts.length;
  const correctCount = attempts.filter((item) => item.isCorrect).length;
  const accuracy = totalAnswered === 0 ? 0 : Math.round((correctCount / totalAnswered) * 100);
  const dueCount = Object.values(spacedRepetition).filter((item) => isDueForReview(item.nextReviewAt)).length;

  return {
    totalAnswered,
    correctCount,
    accuracy,
    dueCount,
  };
}

type ProgressState = {
  attempts: UserAttempt[];
  spacedRepetition: Record<string, SpacedRepetitionData>;
  addAttempt: (attempt: UserAttempt) => void;
  clearProgress: () => void;
  getStats: () => ProgressStats;
};

const STORAGE_KEY = "ddt-progress-v1";

const initialSnapshot = readStorage<ProgressSnapshot>(STORAGE_KEY, {
  attempts: [],
  spacedRepetition: {},
});

function persist(snapshot: ProgressSnapshot): void {
  writeStorage(STORAGE_KEY, snapshot);
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  attempts: initialSnapshot.attempts,
  spacedRepetition: initialSnapshot.spacedRepetition,
  addAttempt: (attempt) => {
    const { attempts, spacedRepetition } = get();
    const updatedSr = scheduleReview(attempt.questionId, attempt.isCorrect, spacedRepetition[attempt.questionId]);

    const next = {
      attempts: [attempt, ...attempts].slice(0, 2000),
      spacedRepetition: {
        ...spacedRepetition,
        [attempt.questionId]: updatedSr,
      },
    };

    persist(next);
    set(next);
  },
  clearProgress: () => {
    const empty = {
      attempts: [],
      spacedRepetition: {},
    };

    persist(empty);
    set(empty);
  },
  getStats: () => {
    const { attempts, spacedRepetition } = get();
    return calculateProgressStats(attempts, spacedRepetition);
  },
}));
