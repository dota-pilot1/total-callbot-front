import { apiClient } from "../../../shared/api/client";
import type {
  PersonalConversationScenario,
  PersonalRandomScenarioRequest,
  AutoGenerateScenarioRequest,
  AutoGenerateScenarioResponse,
} from "../types";

const BASE_URL = "/personal-daily-english/scenarios";

export const personalConversationScenariosApi = {
  // 내 모든 시나리오 조회
  getMyScenarios: async (): Promise<PersonalConversationScenario[]> => {
    const response =
      await apiClient.get<PersonalConversationScenario[]>(BASE_URL);
    return response.data;
  },

  // ID로 내 시나리오 조회
  getMyScenarioById: async (
    id: number,
  ): Promise<PersonalConversationScenario> => {
    const response = await apiClient.get<PersonalConversationScenario>(
      `${BASE_URL}/${id}`,
    );
    return response.data;
  },

  // 카테고리별 내 시나리오 조회
  getMyScenariosByCategory: async (
    category: string,
  ): Promise<PersonalConversationScenario[]> => {
    const response = await apiClient.get<PersonalConversationScenario[]>(
      `${BASE_URL}/category/${encodeURIComponent(category)}`,
    );
    return response.data;
  },

  // 난이도별 내 시나리오 조회
  getMyScenariosByDifficulty: async (
    difficulty: PersonalConversationScenario["difficulty"],
  ): Promise<PersonalConversationScenario[]> => {
    const response = await apiClient.get<PersonalConversationScenario[]>(
      `${BASE_URL}/difficulty/${difficulty}`,
    );
    return response.data;
  },

  // 내 시나리오 카테고리 목록 조회
  getMyCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>(`${BASE_URL}/categories`);
    return response.data;
  },

  // 내 랜덤 시나리오 조회
  getMyRandomScenarios: async ({
    category,
    count = 3,
  }: PersonalRandomScenarioRequest = {}): Promise<
    PersonalConversationScenario[]
  > => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    params.append("count", count.toString());

    const response = await apiClient.get<PersonalConversationScenario[]>(
      `${BASE_URL}/random?${params.toString()}`,
    );
    return response.data;
  },

  // 키워드로 내 시나리오 검색
  searchMyScenarios: async (
    keyword: string,
  ): Promise<PersonalConversationScenario[]> => {
    const response = await apiClient.get<PersonalConversationScenario[]>(
      `${BASE_URL}/search?keyword=${encodeURIComponent(keyword)}`,
    );
    return response.data;
  },

  // 내 시나리오 생성
  createMyScenario: async (
    scenario: Omit<
      PersonalConversationScenario,
      "id" | "createdBy" | "isActive" | "createdAt" | "updatedAt"
    >,
  ): Promise<PersonalConversationScenario> => {
    const response = await apiClient.post<PersonalConversationScenario>(
      BASE_URL,
      scenario,
    );
    return response.data;
  },

  // 내 시나리오 수정
  updateMyScenario: async (
    id: number,
    scenario: Partial<
      Omit<
        PersonalConversationScenario,
        "id" | "createdBy" | "isActive" | "createdAt" | "updatedAt"
      >
    >,
  ): Promise<PersonalConversationScenario> => {
    const response = await apiClient.put<PersonalConversationScenario>(
      `${BASE_URL}/${id}`,
      scenario,
    );
    return response.data;
  },

  // 내 시나리오 삭제 (soft delete)
  deleteMyScenario: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  // 내 시나리오 공개/비공개 토글
  toggleMyScenarioPrivacy: async (
    id: number,
  ): Promise<PersonalConversationScenario> => {
    const response = await apiClient.patch<PersonalConversationScenario>(
      `${BASE_URL}/${id}/privacy`,
    );
    return response.data;
  },

  // AI 자동 시나리오 생성
  autoGenerateScenario: async (
    request: AutoGenerateScenarioRequest,
  ): Promise<AutoGenerateScenarioResponse> => {
    const response = await apiClient.post<AutoGenerateScenarioResponse>(
      `${BASE_URL}/auto-generate`,
      request,
    );
    return response.data;
  },
};
