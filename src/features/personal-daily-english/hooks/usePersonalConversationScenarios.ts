import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personalConversationScenariosApi } from "../api/personalConversationScenariosApi";
import type {
  PersonalConversationScenario,
  PersonalRandomScenarioRequest,
} from "../types";

// Query Keys
export const personalConversationScenariosKeys = {
  all: ["personalConversationScenarios"] as const,
  lists: () => [...personalConversationScenariosKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...personalConversationScenariosKeys.lists(), filters] as const,
  details: () => [...personalConversationScenariosKeys.all, "detail"] as const,
  detail: (id: number) =>
    [...personalConversationScenariosKeys.details(), id] as const,
  categories: () =>
    [...personalConversationScenariosKeys.all, "categories"] as const,
  random: (params: PersonalRandomScenarioRequest) =>
    [...personalConversationScenariosKeys.all, "random", params] as const,
  search: (keyword: string) =>
    [...personalConversationScenariosKeys.all, "search", keyword] as const,
};

// 내 모든 시나리오 조회
export const useMyScenarios = () => {
  return useQuery({
    queryKey: personalConversationScenariosKeys.lists(),
    queryFn: personalConversationScenariosApi.getMyScenarios,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// ID로 내 시나리오 조회
export const useMyScenarioById = (id: number) => {
  return useQuery({
    queryKey: personalConversationScenariosKeys.detail(id),
    queryFn: () => personalConversationScenariosApi.getMyScenarioById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// 카테고리별 내 시나리오 조회
export const useMyScenariosByCategory = (category: string) => {
  return useQuery({
    queryKey: personalConversationScenariosKeys.list({ category }),
    queryFn: () =>
      personalConversationScenariosApi.getMyScenariosByCategory(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
};

// 난이도별 내 시나리오 조회
export const useMyScenariosByDifficulty = (
  difficulty: PersonalConversationScenario["difficulty"],
) => {
  return useQuery({
    queryKey: personalConversationScenariosKeys.list({ difficulty }),
    queryFn: () =>
      personalConversationScenariosApi.getMyScenariosByDifficulty(difficulty),
    enabled: !!difficulty,
    staleTime: 5 * 60 * 1000,
  });
};

// 내 시나리오 카테고리 목록 조회
export const useMyCategories = () => {
  return useQuery({
    queryKey: personalConversationScenariosKeys.categories(),
    queryFn: personalConversationScenariosApi.getMyCategories,
    staleTime: 10 * 60 * 1000, // 10분 (카테고리는 자주 변하지 않음)
  });
};

// 내 랜덤 시나리오 조회
export const useMyRandomScenarios = (
  params: PersonalRandomScenarioRequest = {},
) => {
  return useQuery({
    queryKey: personalConversationScenariosKeys.random(params),
    queryFn: () =>
      personalConversationScenariosApi.getMyRandomScenarios(params),
    enabled: false, // 수동 실행
    staleTime: 0, // 랜덤이므로 캐시하지 않음
  });
};

// 키워드로 내 시나리오 검색
export const useSearchMyScenarios = (keyword: string) => {
  return useQuery({
    queryKey: personalConversationScenariosKeys.search(keyword),
    queryFn: () => personalConversationScenariosApi.searchMyScenarios(keyword),
    enabled: !!keyword && keyword.length > 0,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 내 시나리오 생성
export const useCreateMyScenario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: personalConversationScenariosApi.createMyScenario,
    onSuccess: () => {
      // 모든 개인 시나리오 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: personalConversationScenariosKeys.all,
      });
    },
  });
};

// 내 시나리오 수정
export const useUpdateMyScenario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...scenario
    }: { id: number } & Partial<PersonalConversationScenario>) =>
      personalConversationScenariosApi.updateMyScenario(id, scenario),
    onSuccess: (data) => {
      // 해당 시나리오 캐시 업데이트
      queryClient.setQueryData(
        personalConversationScenariosKeys.detail(data.id),
        data,
      );
      // 목록 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: personalConversationScenariosKeys.lists(),
      });
    },
  });
};

// 내 시나리오 삭제
export const useDeleteMyScenario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: personalConversationScenariosApi.deleteMyScenario,
    onSuccess: () => {
      // 모든 개인 시나리오 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: personalConversationScenariosKeys.all,
      });
    },
  });
};

// 내 시나리오 공개/비공개 토글
export const useToggleMyScenarioPrivacy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: personalConversationScenariosApi.toggleMyScenarioPrivacy,
    onSuccess: (data) => {
      // 해당 시나리오 캐시 업데이트
      queryClient.setQueryData(
        personalConversationScenariosKeys.detail(data.id),
        data,
      );
      // 목록 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: personalConversationScenariosKeys.lists(),
      });
    },
  });
};

// AI 자동 시나리오 생성
export const useAutoGenerateScenario = () => {
  return useMutation({
    mutationFn: personalConversationScenariosApi.autoGenerateScenario,
  });
};
