import { apiClient } from '../../../shared/api/client';

export interface DailyQuestionSet {
  setId: string;
  questionDate: string;
  status: 'GENERATING' | 'READY' | 'EXPIRED' | 'FAILED' | 'NOT_GENERATED';
  totalQuestionCount: number;
  generationStartTime?: string;
  generationEndTime?: string;
  errorMessage?: string;
  hasQuestions: boolean;
}

export interface QuestionCategory {
  category: string;
  questionCount: number;
  questions: ConversationQuestion[] | ReadingQuestion[] | MathQuestion[];
}

export interface ConversationQuestion {
  id: number;
  setId: string;
  questionOrder: number;
  questionTitle: string;
  questionContent: string;
  conversationText: string;
  speakerCount: number;
  conversationType: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  estimatedSolvingTime: number;
}

export interface ReadingQuestion {
  id: number;
  setId: string;
  questionOrder: number;
  questionTitle: string;
  questionContent: string;
  readingPassage: string;
  wordCount: number;
  readingType: string;
  passageSource: string;
  keyVocabulary: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  estimatedSolvingTime: number;
}

export interface MathQuestion {
  id: number;
  setId: string;
  questionOrder: number;
  questionTitle: string;
  questionContent: string;
  formula?: string;
  solutionSteps: string;
  mathCategory: string;
  gradeLevel: string;
  calculatorRequired: boolean;
  stepCount: number;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  estimatedSolvingTime: number;
}

export interface DailyQuestionStatistics {
  totalSets: number;
  readySets: number;
  failedSets: number;
  generatingSets: number;
  totalQuestions: number;
}

export const dailyQuestionApi = {
  // 오늘의 문제 세트 조회
  getTodayQuestionSet: async (): Promise<DailyQuestionSet> => {
    const response = await apiClient.get('/daily-questions/today');
    return response.data;
  },

  // 특정 날짜의 문제 세트 조회
  getQuestionSetByDate: async (date: string): Promise<DailyQuestionSet> => {
    const response = await apiClient.get(`/daily-questions/date/${date}`);
    return response.data;
  },

  // 영어 회화 문제 조회
  getConversationQuestions: async (date: string): Promise<QuestionCategory> => {
    const response = await apiClient.get(`/daily-questions/date/${date}/conversation`);
    return response.data;
  },

  // 영어 독해 문제 조회
  getReadingQuestions: async (date: string): Promise<QuestionCategory> => {
    const response = await apiClient.get(`/daily-questions/date/${date}/reading`);
    return response.data;
  },

  // 수학 문제 조회
  getMathQuestions: async (date: string): Promise<QuestionCategory> => {
    const response = await apiClient.get(`/daily-questions/date/${date}/math`);
    return response.data;
  },

  // 모든 카테고리 문제 조회
  getAllQuestions: async (date: string): Promise<{
    conversation: QuestionCategory;
    reading: QuestionCategory;
    math: QuestionCategory;
  }> => {
    const response = await apiClient.get(`/daily-questions/date/${date}/all`);
    return response.data;
  },

  // 문제 생성 트리거 (관리자)
  triggerGeneration: async (date?: string): Promise<{ message: string; status: string }> => {
    const params = date ? { date } : {};
    const response = await apiClient.post('/daily-questions/generate', null, { params });
    return response.data;
  },

  // 통계 조회
  getStatistics: async (): Promise<DailyQuestionStatistics> => {
    const response = await apiClient.get('/daily-questions/statistics');
    return response.data;
  },
};
