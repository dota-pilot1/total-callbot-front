import { apiClient } from "../../../../shared/api/client";

export interface TTSRequest {
  text: string;
  language?: string; // 'en' | 'ko'
  voice?: string; // OpenAI voice options
  speed?: number;
}

export interface TTSResponse {
  audioUrl: string;
  success: boolean;
}

export const ttsApi = {
  synthesize: async (payload: TTSRequest): Promise<TTSResponse> => {
    const res = await apiClient.post<TTSResponse>("/tts/synthesize", payload);
    return res.data;
  },
};
