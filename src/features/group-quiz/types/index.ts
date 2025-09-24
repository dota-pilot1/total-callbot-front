export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  category: 'math' | 'english' | 'science' | 'history' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[]; // multiple-choice용
  correctAnswer: string;
  timeLimit: number; // 초 단위
  points: number;
}

export interface QuizRoom {
  id: string;
  name: string;
  hostId: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'in-progress' | 'finished';
  category: 'math' | 'english' | 'science' | 'history' | 'general' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionsCount: number;
  timePerQuestion: number; // 초 단위
  createdAt: Date;
  participants: QuizPlayer[];
}

export interface QuizPlayer {
  id: string;
  name: string;
  score: number;
  rank: number;
  isHost: boolean;
  isReady: boolean;
  correctAnswers: number;
  totalAnswers: number;
}

export interface QuizSession {
  roomId: string;
  currentQuestion: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  leaderboard: QuizPlayer[];
  status: 'waiting' | 'countdown' | 'question' | 'results' | 'finished';
  timeRemaining: number;
  currentAnswer?: string;
}

export interface QuizAnswer {
  playerId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  responseTime: number; // 초 단위
  points: number;
}
