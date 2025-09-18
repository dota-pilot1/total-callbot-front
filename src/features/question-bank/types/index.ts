// Question Bank types
export interface Question {
  id: number;
  ttsText: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswer: number;
  orderIndex: number;
  category: 'vocabulary' | 'grammar' | 'listening' | 'reading';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
  updatedAt?: string;
}

export interface QuestionFormData {
  ttsText: string;
  questionText: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswer: number;
  category: 'vocabulary' | 'grammar' | 'listening' | 'reading';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface QuestionCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

export interface QuestionDifficulty {
  id: string;
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

export interface FormErrors<T> {
  [K in keyof T]?: string;
}
