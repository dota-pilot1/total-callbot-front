import { apiClient } from '../../../shared/api/client';
import type { ListeningTest, ListeningQuestion } from '../types';

export const listeningTestApi = {
  // 시험 목록 조회
  getTests: async (): Promise<ListeningTest[]> => {
    const response = await apiClient.get<ListeningTest[]>('/listening-test/tests');
    return response.data;
  },

  // 특정 시험의 문제들 조회
  getTestQuestions: async (testId: number): Promise<ListeningQuestion[]> => {
    const response = await apiClient.get<ListeningQuestion[]>(`/listening-test/tests/${testId}/questions`);
    return response.data;
  },

  // 시험 세션 시작
  startTestSession: async (testId: number): Promise<{ sessionId: string; sessionUuid: string }> => {
    const response = await apiClient.post(`/listening-test/tests/${testId}/start`);
    return response.data;
  },

  // 답안 제출
  submitAnswer: async (sessionId: string, questionId: number, selectedAnswer: 'A' | 'B' | 'C' | 'D'): Promise<void> => {
    await apiClient.post(`/listening-test/sessions/${sessionId}/answers`, {
      questionId,
      selectedAnswer,
    });
  },

  // 시험 완료
  completeTest: async (sessionId: string): Promise<{ totalScore: number; correctAnswers: number; totalQuestions: number }> => {
    const response = await apiClient.post(`/listening-test/sessions/${sessionId}/complete`);
    return response.data;
  },
};
