import { apiClient } from "../../../shared/api/client";
import type {
  ScenarioTemplate,
  CopyScenarioRequest,
  PaginatedScenarios,
  ScenarioTemplateFilters,
  Difficulty
} from "../types";

// API 응답 타입
interface GetScenariosResponse {
  scenarios: ScenarioTemplate[];
  totalCount: number;
  page: number;
  size: number;
  hasNext: boolean;
}

interface SearchScenariosResponse {
  scenarios: ScenarioTemplate[];
  keyword: string;
  page: number;
  size: number;
}

/**
 * 공개 시나리오 템플릿 목록 조회 (페이징 지원)
 */
export const getScenarioTemplates = async (params: {
  page?: number;
  size?: number;
  category?: string;
  difficulty?: Difficulty;
} = {}): Promise<PaginatedScenarios> => {
  const { page = 0, size = 20, category, difficulty } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (category) queryParams.append('category', category);
  if (difficulty) queryParams.append('difficulty', difficulty);

  const response = await apiClient.get<GetScenariosResponse>(
    `/conversation-scenario-templates?${queryParams.toString()}`
  );

  return {
    scenarios: response.data.scenarios,
    totalCount: response.data.totalCount,
    page: response.data.page,
    size: response.data.size,
    hasNext: response.data.hasNext,
  };
};

/**
 * 공개 시나리오 템플릿 상세 조회
 */
export const getScenarioTemplateById = async (id: number): Promise<ScenarioTemplate> => {
  const response = await apiClient.get<ScenarioTemplate>(`/conversation-scenario-templates/${id}`);
  return response.data;
};

/**
 * 공개 시나리오 템플릿 카테고리 목록 조회
 */
export const getScenarioTemplateCategories = async (): Promise<string[]> => {
  const response = await apiClient.get<string[]>('/conversation-scenario-templates/categories');
  return response.data;
};

/**
 * 공개 시나리오 템플릿 검색
 */
export const searchScenarioTemplates = async (params: {
  keyword: string;
  page?: number;
  size?: number;
}): Promise<{
  scenarios: ScenarioTemplate[];
  keyword: string;
  page: number;
  size: number;
}> => {
  const { keyword, page = 0, size = 20 } = params;

  const queryParams = new URLSearchParams({
    keyword,
    page: page.toString(),
    size: size.toString(),
  });

  const response = await apiClient.get<SearchScenariosResponse>(
    `/conversation-scenario-templates/search?${queryParams.toString()}`
  );

  return response.data;
};

/**
 * 공개 시나리오 템플릿을 내 시나리오로 복사
 */
export const copyScenarioTemplateToMy = async (
  id: number,
  request: CopyScenarioRequest
): Promise<ScenarioTemplate> => {
  const response = await apiClient.post<ScenarioTemplate>(
    `/conversation-scenario-templates/${id}/copy`,
    request
  );
  return response.data;
};

// 필터링된 시나리오 목록 조회 (복합 조건)
export const getFilteredScenarioTemplates = async (
  filters: ScenarioTemplateFilters & { page?: number; size?: number }
): Promise<PaginatedScenarios> => {
  const { page = 0, size = 20, search, ...otherFilters } = filters;

  // 검색어가 있으면 검색 API 사용
  if (search && search.trim()) {
    const searchResult = await searchScenarioTemplates({
      keyword: search.trim(),
      page,
      size,
    });

    return {
      scenarios: searchResult.scenarios,
      totalCount: searchResult.scenarios.length, // 검색은 전체 카운트를 별도로 제공하지 않음
      page: searchResult.page,
      size: searchResult.size,
      hasNext: searchResult.scenarios.length === size, // 추정값
    };
  }

  // 일반 목록 조회
  return getScenarioTemplates({
    page,
    size,
    category: otherFilters.category,
    difficulty: otherFilters.difficulty,
  });
};
