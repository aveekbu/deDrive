import enQuestionsRaw from "@/data/driving_theory_questions.json";
import deQuestionsRaw from "@/data/driving_theory_questions_de.json";
import bnQuestionsRaw from "@/data/driving_theory_questions_bn.json";
import type { Language, Question, QuestionFilter, RawOption, RawQuestion } from "@/lib/types";

export type ThemeSummary = {
  themeNumber: string;
  themeName: string;
  questionCount: number;
  mediaCount: number;
  coverImageUrl?: string;
};

function toOptionId(option: RawOption): string {
  return option.letter.replace(".", "").trim().toUpperCase();
}

function toPoints(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function normalizeQuestion(item: RawQuestion, language: Language): Question {
  const correctSet = new Set(item.correct_answers.map(toOptionId));

  return {
    id: item.question_id,
    themeNumber: item.theme_number,
    themeName: item.theme_name,
    chapterNumber: item.chapter_number,
    chapterName: item.chapter_name,
    points: toPoints(item.points),
    text: item.question_text,
    options: item.options.map((option) => {
      const id = toOptionId(option);
      return {
        id,
        text: option.text,
        isCorrect: correctSet.has(id),
      };
    }),
    explanation: item.comment,
    imageUrls: item.image_urls,
    videoUrls: item.video_urls,
    sourceUrl: item.url,
    language,
  };
}

const EN_QUESTIONS = (enQuestionsRaw as RawQuestion[]).map((item) => normalizeQuestion(item, "en"));
const DE_QUESTIONS = (deQuestionsRaw as RawQuestion[]).map((item) => normalizeQuestion(item, "de"));
const BN_QUESTIONS = (bnQuestionsRaw as RawQuestion[]).map((item) => normalizeQuestion(item, "bn"));

const QUESTIONS_BY_LANGUAGE: Record<Language, Question[]> = {
  en: EN_QUESTIONS,
  de: DE_QUESTIONS,
  bn: BN_QUESTIONS,
};

function getThemeSortTokens(themeNumber: string): number[] {
  const matches = themeNumber.match(/\d+/g);
  if (!matches) {
    return [Number.MAX_SAFE_INTEGER];
  }

  return matches.map((item) => Number.parseInt(item, 10));
}

function compareThemeNumbers(left: string, right: string): number {
  const leftTokens = getThemeSortTokens(left);
  const rightTokens = getThemeSortTokens(right);
  const maxLength = Math.max(leftTokens.length, rightTokens.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = leftTokens[index] ?? 0;
    const rightValue = rightTokens[index] ?? 0;

    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }
  }

  return left.localeCompare(right);
}

export function getQuestions(filter: QuestionFilter): Question[] {
  const questions = QUESTIONS_BY_LANGUAGE[filter.language];

  return questions.filter((question) => {
    if (filter.themeNumber && question.themeNumber !== filter.themeNumber) {
      return false;
    }

    if (typeof filter.minPoints === "number" && question.points < filter.minPoints) {
      return false;
    }

    if (typeof filter.maxPoints === "number" && question.points > filter.maxPoints) {
      return false;
    }

    return true;
  });
}

export function getQuestionById(id: string, language: Language): Question | undefined {
  return QUESTIONS_BY_LANGUAGE[language].find((question) => question.id === id);
}

export function getThemeSummaries(language: Language): ThemeSummary[] {
  const byTheme = new Map<string, ThemeSummary>();

  for (const question of QUESTIONS_BY_LANGUAGE[language]) {
    const existing = byTheme.get(question.themeNumber);
    const hasMedia = question.imageUrls.length > 0 || question.videoUrls.length > 0;

    if (existing) {
      existing.questionCount += 1;
      if (hasMedia) {
        existing.mediaCount += 1;
      }
      if (!existing.coverImageUrl && question.imageUrls.length > 0) {
        existing.coverImageUrl = question.imageUrls[0];
      }
      continue;
    }

    byTheme.set(question.themeNumber, {
      themeNumber: question.themeNumber,
      themeName: question.themeName,
      questionCount: 1,
      mediaCount: hasMedia ? 1 : 0,
      coverImageUrl: question.imageUrls[0],
    });
  }

  return [...byTheme.values()].sort((left, right) => compareThemeNumbers(left.themeNumber, right.themeNumber));
}

export function getThemeNumbers(language: Language): string[] {
  return getThemeSummaries(language).map((theme) => theme.themeNumber);
}

export function getQuestionCounts(language: Language): { total: number; themes: number } {
  const questions = QUESTIONS_BY_LANGUAGE[language];
  return {
    total: questions.length,
    themes: getThemeNumbers(language).length,
  };
}
