import type { SpacedRepetitionData } from "@/lib/types";

const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 3;
const EASE_INCREMENT = 0.1;
const EASE_DECREMENT = 0.2;
const DAY_MS = 24 * 60 * 60 * 1000;

function getInitial(questionId: string): SpacedRepetitionData {
  const now = Date.now();

  return {
    questionId,
    repetitionCount: 0,
    easeFactor: 2.5,
    intervalDays: 1,
    nextReviewAt: now,
    lastReviewedAt: now,
  };
}

export function scheduleReview(
  questionId: string,
  isCorrect: boolean,
  current?: SpacedRepetitionData,
): SpacedRepetitionData {
  const now = Date.now();
  const base = current ?? getInitial(questionId);

  if (isCorrect) {
    const easeFactor = Math.min(base.easeFactor + EASE_INCREMENT, MAX_EASE_FACTOR);
    const repetitionCount = base.repetitionCount + 1;

    const intervalDays =
      base.repetitionCount === 0 ? 1 : base.repetitionCount === 1 ? 3 : Math.max(1, Math.floor(base.intervalDays * easeFactor));

    return {
      questionId,
      repetitionCount,
      easeFactor,
      intervalDays,
      nextReviewAt: now + intervalDays * DAY_MS,
      lastReviewedAt: now,
    };
  }

  const easeFactor = Math.max(base.easeFactor - EASE_DECREMENT, MIN_EASE_FACTOR);

  return {
    questionId,
    repetitionCount: 0,
    easeFactor,
    intervalDays: 1,
    nextReviewAt: now + DAY_MS,
    lastReviewedAt: now,
  };
}

export function isDueForReview(nextReviewAt: number): boolean {
  return Date.now() >= nextReviewAt;
}
