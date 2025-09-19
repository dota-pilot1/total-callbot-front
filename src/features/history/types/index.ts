export interface HistoricalEvent {
  id: string;
  title: string;
  description: string;
  year: number;
  category: 'ancient' | 'medieval' | 'modern' | 'contemporary';
  country: string;
}

export interface HistoryQuiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
