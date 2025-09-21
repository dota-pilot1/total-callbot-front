// 시험 상태 관련 타입
export interface ExamStatus {
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  startedAt: string;
}

// 문제 관련 타입
export interface Question {
  id: number;
  questionNumber: number;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  category: 'ENGLISH_LISTENING' | 'ENGLISH_CONVERSATION' | 'ENGLISH_VOCABULARY' | 'MATHEMATICS';
  content: string;
  audioText?: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

// 참가자 관련 타입
export interface Participant {
  id: number;
  name: string;
  currentScore: number;
  progress: number;
  status: 'WAITING' | 'THINKING' | 'ANSWERING' | 'COMPLETED';
  isHost: boolean;
  isOnline?: boolean;
}

// 채팅 메시지 타입
export interface ChatMessage {
  id: number;
  userName: string;
  message: string;
  timestamp: string;
  type: 'chat' | 'system';
}

// 답안 제출 데이터
export interface AnswerSubmission {
  questionId: number;
  selectedAnswer: string;
  responseTime?: number;
}
