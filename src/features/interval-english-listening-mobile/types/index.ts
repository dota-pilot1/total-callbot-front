export interface IntervalListeningTest {
  id: number;
  title: string;
  description: string;
  difficulty: ListeningDifficulty;
  totalQuestions: number;
  estimatedTimeMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface IntervalListeningQuestion {
  questionId: number;
  questionNumber: number;
  audioText: string;
  questionContent: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  audioSpeed: number;
}

export interface IntervalListeningSession {
  sessionUuid: string;
  testSetId: number;
  currentQuestionNumber: number;
  totalQuestions: number;
  correctAnswers: number;
  totalScore: number;
  sessionStatus: SessionStatus;
  startedAt: string;
  completedAt?: string;
  audioSpeed: number;
  autoPlay: boolean;
  showTranscript: boolean;
}

export interface IntervalListeningSettings {
  audioSpeed: number;
  autoPlay: boolean;
  showTranscript: boolean;
  autoRepeat: boolean;
  playbackDelay: number;
}

export const ListeningDifficulty = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
} as const;

export type ListeningDifficulty =
  (typeof ListeningDifficulty)[keyof typeof ListeningDifficulty];

export const SessionStatus = {
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ABANDONED: "ABANDONED",
} as const;

export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

export interface StartSessionRequest {
  testSetId: number;
}

export interface SubmitAnswerRequest {
  questionId: number;
  selectedAnswer: string;
  responseTimeSeconds: number;
}

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  correctAnswer: string;
  isSessionCompleted: boolean;
  currentScore: number;
  message: string;
}

export interface SessionResult {
  sessionUuid: string;
  testSetId: number;
  totalQuestions: number;
  correctAnswers: number;
  totalScore: number;
  sessionStatus: string;
  completedAt: string;
  accuracy: number;
  answers: AnswerResult[];
}

export interface AnswerResult {
  questionId: number;
  questionNumber: number;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  points: number;
  responseTimeSeconds: number;
}

export interface UserListeningStats {
  averageScore: number;
  completedSessions: number;
  averageAccuracy: number;
}

export interface TestFilters {
  difficulty?: ListeningDifficulty;
  page?: number;
  size?: number;
}

export interface CreateTestSetRequest {
  title: string;
  description: string;
  difficulty: ListeningDifficulty;
  estimatedTimeMinutes: number;
}

export interface AddQuestionRequest {
  audioText: string;
  questionContent: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
}
