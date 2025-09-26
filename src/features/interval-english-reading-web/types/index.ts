export interface IntervalReadingTest {
  id: number;
  title: string;
  description: string;
  difficulty: ReadingDifficulty;
  content: string;
  wordCount: number;
  estimatedReadingTimeMinutes: number;
  totalQuestions?: number;
  timeLimitMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IntervalReadingSession {
  sessionUuid: string;
  testTitle: string;
  testId: number;
  status: SessionStatus;
  currentPosition: number;
  totalReadingTimeSeconds: number;
  wordsPerMinute?: number;
  completionPercentage: number;
  settings: IntervalSettings;
}

export interface IntervalSettings {
  intervalType: IntervalType;
  displaySpeedWpm: number;
  autoScrollEnabled: boolean;
  highlightEnabled: boolean;
}

export const ReadingDifficulty = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
} as const;

export type ReadingDifficulty =
  (typeof ReadingDifficulty)[keyof typeof ReadingDifficulty];

export const SessionStatus = {
  STARTED: "STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
  ABANDONED: "ABANDONED",
} as const;

export type SessionStatus =
  (typeof SessionStatus)[keyof typeof SessionStatus];

export const IntervalType = {
  WORD_BY_WORD: "WORD_BY_WORD",
  PHRASE_BY_PHRASE: "PHRASE_BY_PHRASE",
  SENTENCE_BY_SENTENCE: "SENTENCE_BY_SENTENCE",
} as const;

export type IntervalType = (typeof IntervalType)[keyof typeof IntervalType];

export interface CreateTestRequest {
  title: string;
  description: string;
  difficulty: ReadingDifficulty;
  content: string;
}

export interface StartSessionRequest {
  testId: number;
  settings: IntervalSettings;
}

export interface UpdateProgressRequest {
  currentPosition: number;
  readingTimeSeconds: number;
}

export interface UserStats {
  averageReadingSpeed: number;
}

export interface TestFilters {
  difficulty?: ReadingDifficulty;
  minWords?: number;
  maxWords?: number;
  maxTime?: number;
  page?: number;
  size?: number;
}
