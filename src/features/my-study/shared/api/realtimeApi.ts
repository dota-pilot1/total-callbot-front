import { apiClient } from "../../../../shared/api/client";

export interface CreateSessionRequest {
  scenario: string;
  instructions?: string;
}

export interface SessionResponse {
  sessionId: string;
  status: string;
}

export interface TokenResponse {
  token: string;
  status: string;
}

export const realtimeApi = {
  // 세션 생성
  createSession: async (
    request: CreateSessionRequest,
  ): Promise<SessionResponse> => {
    const response = await apiClient.post<SessionResponse>(
      "/realtime/sessions",
      request,
    );
    return response.data;
  },

  // 세션 토큰 가져오기
  getSessionToken: async (sessionId: string): Promise<TokenResponse> => {
    const response = await apiClient.get<TokenResponse>(
      `/realtime/sessions/${sessionId}/token`,
    );
    return response.data;
  },

  // 세션 종료
  endSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/realtime/sessions/${sessionId}`);
  },
};
