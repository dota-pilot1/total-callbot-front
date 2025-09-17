// API 응답 타입
export interface ListeningTest {
  id: number;
  title: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  difficultyDisplayName: string;
  totalQuestions: number;
  timeLimitMinutes: number;
}

export interface ListeningQuestion {
  id: number;
  questionNumber: number;
  audioText: string;
  questionContent: string;
  options: string[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation?: string;
  category: string;
  difficultyLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  speechRate: number;
}

// 기존 Question 인터페이스 (호환성 유지)
export interface Question {
  audioText: string;
  question: string;
  options: string[];
  correct: number;
}

export interface ListeningSettings {
  speechRate: number;
  autoRepeat: boolean;
  showSubtitles: boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
}

// API 응답을 UI용 Question으로 변환하는 헬퍼 함수
export const convertToQuestion = (apiQuestion: ListeningQuestion): Question => {
  const correctIndex = apiQuestion.correctAnswer
    ? ["A", "B", "C", "D"].indexOf(apiQuestion.correctAnswer)
    : 0;

  console.log("Converting question:", {
    id: apiQuestion.id,
    correctAnswer: apiQuestion.correctAnswer,
    correctIndex,
    options: apiQuestion.options,
  });

  return {
    audioText: apiQuestion.audioText,
    question: apiQuestion.questionContent,
    options: apiQuestion.options,
    correct: correctIndex,
  };
};
