import { apiClient } from '../../../shared/api/client';
import type {
  ListeningQuestion,
  ListeningSession,
  SubmitAnswerRequest,
  SubmitAnswerResponse
} from '../types';

export const listeningTestApi = {
  // 현재 문제 조회
  getCurrentQuestion: async (sessionUuid: string): Promise<ListeningQuestion> => {
    const response = await apiClient.get(`/listening-test/sessions/${sessionUuid}/current-question`);
    return response.data;
  },

  // 세션 정보 조회
  getSession: async (sessionUuid: string): Promise<ListeningSession> => {
    const response = await apiClient.get(`/listening-test/sessions/${sessionUuid}`);
    return response.data;
  },

  // 답안 제출
  submitAnswer: async (
    sessionUuid: string,
    request: SubmitAnswerRequest
  ): Promise<SubmitAnswerResponse> => {
    const response = await apiClient.post(
      `/listening-test/sessions/${sessionUuid}/answers`,
      request
    );
    return response.data;
  },

  // 시험 완료
  completeTest: async (sessionUuid: string): Promise<ListeningSession> => {
    const response = await apiClient.post(`/listening-test/sessions/${sessionUuid}/complete`);
    return response.data;
  }
};
