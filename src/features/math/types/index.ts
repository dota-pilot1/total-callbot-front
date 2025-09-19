export interface MathProblem {
  id: string;
  question: string;
  answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'arithmetic' | 'algebra' | 'geometry' | 'calculus';
}
