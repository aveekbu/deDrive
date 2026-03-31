import enQuestionsRaw from "@/data/driving_theory_questions.json";
import deQuestionsRaw from "@/data/driving_theory_questions_de.json";
import type { Language, Question, QuestionFilter, RawOption, RawQuestion } from "@/lib/types";

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

const QUESTIONS_BY_LANGUAGE: Record<Language, Question[]> = {
  en: EN_QUESTIONS,
  de: DE_QUESTIONS,
};

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

export function getThemeNumbers(language: Language): string[] {
  return [...new Set(QUESTIONS_BY_LANGUAGE[language].map((question) => question.themeNumber))].sort();
}

export function getQuestionCounts(language: Language): { total: number; themes: number } {
  const questions = QUESTIONS_BY_LANGUAGE[language];
  return {
    total: questions.length,
    themes: getThemeNumbers(language).length,
  };
}
