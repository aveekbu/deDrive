"use client";

import { create } from "zustand";
import { getQuestions } from "@/lib/question-loader";
import type { Language, Question } from "@/lib/types";

type QuizFilters = {
  themeNumber?: string;
  minPoints?: number;
  maxPoints?: number;
};

type QuizState = {
  questions: Question[];
  index: number;
  startedAt: number | null;
  filters: QuizFilters;
  startQuiz: (language: Language, filters?: QuizFilters) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
  setFilters: (filters: QuizFilters) => void;
};

function shuffle<T>(items: T[]): T[] {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  index: 0,
  startedAt: null,
  filters: {},
  startQuiz: (language, filters = {}) => {
    const questions = getQuestions({
      language,
      themeNumber: filters.themeNumber,
      minPoints: filters.minPoints,
      maxPoints: filters.maxPoints,
    });

    set({
      questions: shuffle(questions),
      index: 0,
      startedAt: Date.now(),
      filters,
    });
  },
  nextQuestion: () => {
    const { index, questions } = get();

    if (index < questions.length - 1) {
      set({ index: index + 1 });
    }
  },
  resetQuiz: () => {
    set({ questions: [], index: 0, startedAt: null, filters: {} });
  },
  setFilters: (filters) => set({ filters }),
}));
