import { apiClient } from "../../../../shared/api/client";

export type SampleAnswer = { title: string; text: string };
export type SampleAnswerResponse = { samples: SampleAnswer[]; model?: string };
export type TranslateResponse = { translation: string };

export const examApi = {
  getSampleAnswers: async (payload: {
    topic?: string;
    level?: string;
    question: string;
    count?: number;
    englishOnly?: boolean;
    context?: string;
  }): Promise<SampleAnswerResponse> => {
    const res = await apiClient.post<SampleAnswerResponse>(
      "/exam/sample-answers",
      payload,
    );
    return res.data;
  },

  autoComplete: async (payload: {
    conversationContext: string;
    characterType: string;
    userRole: string;
    aiRole: string;
  }) => {
    const res = await apiClient.post<{ response: string }>(
      "/exam/auto-complete",
      payload,
    );
    return res.data;
  },

  translate: async (text: string): Promise<TranslateResponse> => {
    const res = await apiClient.post<TranslateResponse>("/exam/translate", {
      text,
    });
    return res.data;
  },
};
