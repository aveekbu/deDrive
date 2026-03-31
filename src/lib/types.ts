export type Language = "en" | "de";

export type RawOption = {
  letter: string;
  text: string;
};

export type RawQuestion = {
  theme_number: string;
  theme_name: string;
  chapter_number: string;
  chapter_name: string;
  question_id: string;
  question_number: string;
  points: string;
  question_text: string;
  options: RawOption[];
  correct_answers: RawOption[];
  comment: string;
  image_urls: string[];
  local_image_paths: string[];
  video_urls: string[];
  local_video_paths: string[];
  url: string;
};

export type QuestionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  themeNumber: string;
  themeName: string;
  chapterNumber: string;
  chapterName: string;
  points: number;
  text: string;
  options: QuestionOption[];
  explanation: string;
  imageUrls: string[];
  videoUrls: string[];
  sourceUrl: string;
  language: Language;
};

export type QuestionFilter = {
  language: Language;
  themeNumber?: string;
  minPoints?: number;
  maxPoints?: number;
};

export type UserAttempt = {
  id: string;
  questionId: string;
  questionText: string;
  themeNumber: string;
  language: Language;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  isCorrect: boolean;
  attemptedAt: number;
  timeTakenSeconds: number;
};

export type SpacedRepetitionData = {
  questionId: string;
  repetitionCount: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: number;
  lastReviewedAt: number;
};

export type ProgressSnapshot = {
  attempts: UserAttempt[];
  spacedRepetition: Record<string, SpacedRepetitionData>;
};
