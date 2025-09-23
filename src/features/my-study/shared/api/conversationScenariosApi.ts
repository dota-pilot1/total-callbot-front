import { apiClient } from "../../../../shared/api/client";
import type { ConversationScenario, RandomScenarioRequest } from "../types";

const BASE_URL = "/daily-english/scenarios";

export const conversationScenariosApi = {
  // 모든 시나리오 조회
  getAllScenarios: async (): Promise<ConversationScenario[]> => {
    const response = await apiClient.get<ConversationScenario[]>(BASE_URL);
    return response.data;
  },

  // ID로 시나리오 조회
  getScenarioById: async (id: number): Promise<ConversationScenario> => {
    const response = await apiClient.get<ConversationScenario>(
      `${BASE_URL}/${id}`,
    );
    return response.data;
  },

  // 카테고리별 시나리오 조회
  getScenariosByCategory: async (
    category: string,
  ): Promise<ConversationScenario[]> => {
    const response = await apiClient.get<ConversationScenario[]>(
      `${BASE_URL}/category/${encodeURIComponent(category)}`,
    );
    return response.data;
  },

  // 난이도별 시나리오 조회
  getScenariosByDifficulty: async (
    difficulty: ConversationScenario["difficulty"],
  ): Promise<ConversationScenario[]> => {
    const response = await apiClient.get<ConversationScenario[]>(
      `${BASE_URL}/difficulty/${difficulty}`,
    );
    return response.data;
  },

  // 모든 카테고리 목록 조회
  getAllCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>(`${BASE_URL}/categories`);
    return response.data;
  },

  // 랜덤 시나리오 생성
  getRandomScenarios: async ({
    category,
    count = 3,
  }: RandomScenarioRequest = {}): Promise<ConversationScenario[]> => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    params.append("count", count.toString());

    const response = await apiClient.get<ConversationScenario[]>(
      `${BASE_URL}/random?${params.toString()}`,
    );
    return response.data;
  },

  // 키워드로 시나리오 검색
  searchScenarios: async (keyword: string): Promise<ConversationScenario[]> => {
    const response = await apiClient.get<ConversationScenario[]>(
      `${BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`,
    );
    return response.data;
  },

  // 음성 지원 시나리오 조회
  getAudioEnabledScenarios: async (): Promise<ConversationScenario[]> => {
    const response = await apiClient.get<ConversationScenario[]>(
      `${BASE_URL}/audio-enabled`,
    );
    return response.data;
  },

  // 시나리오 생성 (관리자용)
  createScenario: async (
    scenario: Omit<ConversationScenario, "id" | "createdAt" | "updatedAt">,
  ): Promise<ConversationScenario> => {
    const response = await apiClient.post<ConversationScenario>(
      BASE_URL,
      scenario,
    );
    return response.data;
  },

  // 시나리오 수정 (관리자용)
  updateScenario: async (
    id: number,
    scenario: Partial<
      Omit<ConversationScenario, "id" | "createdAt" | "updatedAt">
    >,
  ): Promise<ConversationScenario> => {
    const response = await apiClient.put<ConversationScenario>(
      `${BASE_URL}/${id}`,
      scenario,
    );
    return response.data;
  },

  // 시나리오 삭제 (관리자용)
  deleteScenario: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};
