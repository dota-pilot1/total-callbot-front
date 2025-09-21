export interface DailyEnglishWord {
  id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface DailyEnglishQuiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  type: 'vocabulary' | 'grammar' | 'reading';
}

export interface DailyProgress {
  date: string;
  wordsLearned: number;
  quizzesCompleted: number;
  score: number;
}
