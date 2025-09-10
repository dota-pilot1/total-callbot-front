import { apiClient } from '../../../shared/api/client';

export type SampleAnswer = { title: string; text: string };
export type SampleAnswerResponse = { samples: SampleAnswer[]; model?: string };

export const examApi = {
  getSampleAnswers: async (payload: { topic?: string; level?: string; question: string; count?: number }): Promise<SampleAnswerResponse> => {
    const res = await apiClient.post<SampleAnswerResponse>('/exam/sample-answers', payload);
    return res.data;
  }
};

