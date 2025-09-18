// Exam Management types (백엔드와 동기화)
export interface ExamTest {
  id: number;
  title: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  questionCount: number;
  timeLimit: number;
  isActive: boolean;
  createdAt: string;
}

export interface ExamFormData {
  title: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  timeLimit: number;
  isActive: boolean;
}

// Question Bank types (백엔드와 동기화)
export interface Question {
  id: number;
  audioText: string; // 백엔드: audioText
  questionContent: string; // 백엔드: questionContent
  optionA: string; // 백엔드: optionA
  optionB: string; // 백엔드: optionB
  optionC: string; // 백엔드: optionC
  optionD: string; // 백엔드: optionD
  correctAnswer: "A" | "B" | "C" | "D"; // 백엔드: A, B, C, D
  questionNumber: number; // 백엔드: questionNumber
  category: string; // 백엔드: String (자유 텍스트)
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"; // 백엔드: DifficultyLevel
  explanation?: string; // 백엔드: explanation
  createdAt: string;
}

export interface QuestionFormData {
  audioText: string;
  questionContent: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  category: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  explanation?: string;
}

export interface QuestionCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

export interface QuestionDifficulty {
  id: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  name: string;
  color: string;
}

export interface QuestionFilters {
  category: string;
  difficulty: string;
  searchQuery: string;
}

export interface QuestionStats {
  totalQuestions: number;
  vocabularyCount: number;
  grammarCount: number;
  listeningCount: number;
  readingCount: number;
  beginnerCount: number;
  intermediateCount: number;
  advancedCount: number;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export type FormErrors<T> = {
  [K in keyof T]?: string;
};
