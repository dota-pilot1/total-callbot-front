export interface MathProblem {
  id: string;
  question: string;
  type: 'arithmetic' | 'algebra' | 'geometry' | 'statistics';
  difficulty: 'easy' | 'medium' | 'hard';
  correctAnswer: string;
  explanation: string;
  hints?: string[];
}

export interface MathQuiz {
  id: string;
  title: string;
  problems: MathProblem[];
  timeLimit?: number; // 분 단위
}

export interface DailyMathProgress {
  date: string;
  problemsSolved: number;
  correctAnswers: number;
  totalTime: number; // 초 단위
  difficulty: 'easy' | 'medium' | 'hard';
}
