export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: "learning" | "health" | "skill";
  points: number;
}

export interface MissionQuiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
