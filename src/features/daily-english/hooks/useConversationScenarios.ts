import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationScenariosApi } from "../api/conversationScenariosApi";
import type { ConversationScenario, RandomScenarioRequest } from "../types";

// Query Keys
export const conversationScenariosKeys = {
  all: ["conversationScenarios"] as const,
  lists: () => [...conversationScenariosKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...conversationScenariosKeys.lists(), filters] as const,
  details: () => [...conversationScenariosKeys.all, "detail"] as const,
  detail: (id: number) => [...conversationScenariosKeys.details(), id] as const,
  categories: () => [...conversationScenariosKeys.all, "categories"] as const,
  random: (params: RandomScenarioRequest) =>
    [...conversationScenariosKeys.all, "random", params] as const,
  search: (keyword: string) =>
    [...conversationScenariosKeys.all, "search", keyword] as const,
  audioEnabled: () =>
    [...conversationScenariosKeys.all, "audioEnabled"] as const,
};

// 모든 시나리오 조회
export const useAllScenarios = () => {
  return useQuery({
    queryKey: conversationScenariosKeys.lists(),
    queryFn: conversationScenariosApi.getAllScenarios,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// ID로 시나리오 조회
export const useScenarioById = (id: number) => {
  return useQuery({
    queryKey: conversationScenariosKeys.detail(id),
    queryFn: () => conversationScenariosApi.getScenarioById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// 카테고리별 시나리오 조회
export const useScenariosByCategory = (category: string) => {
  return useQuery({
    queryKey: conversationScenariosKeys.list({ category }),
    queryFn: () => conversationScenariosApi.getScenariosByCategory(category),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
  });
};

// 난이도별 시나리오 조회
export const useScenariosByDifficulty = (
  difficulty: ConversationScenario["difficulty"],
) => {
  return useQuery({
    queryKey: conversationScenariosKeys.list({ difficulty }),
    queryFn: () =>
      conversationScenariosApi.getScenariosByDifficulty(difficulty),
    enabled: !!difficulty,
    staleTime: 5 * 60 * 1000,
  });
};

// 모든 카테고리 목록 조회
export const useAllCategories = () => {
  return useQuery({
    queryKey: conversationScenariosKeys.categories(),
    queryFn: conversationScenariosApi.getAllCategories,
    staleTime: 10 * 60 * 1000, // 10분 (카테고리는 자주 변하지 않음)
  });
};

// 랜덤 시나리오 생성
export const useRandomScenarios = (params: RandomScenarioRequest = {}) => {
  return useQuery({
    queryKey: conversationScenariosKeys.random(params),
    queryFn: () => conversationScenariosApi.getRandomScenarios(params),
    enabled: false, // 수동 실행
    staleTime: 0, // 랜덤이므로 캐시하지 않음
  });
};

// 키워드 검색
export const useSearchScenarios = (keyword: string) => {
  return useQuery({
    queryKey: conversationScenariosKeys.search(keyword),
    queryFn: () => conversationScenariosApi.searchScenarios(keyword),
    enabled: !!keyword && keyword.length > 0,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 음성 지원 시나리오 조회
export const useAudioEnabledScenarios = () => {
  return useQuery({
    queryKey: conversationScenariosKeys.audioEnabled(),
    queryFn: conversationScenariosApi.getAudioEnabledScenarios,
    staleTime: 5 * 60 * 1000,
  });
};

// 시나리오 생성 (관리자용)
export const useCreateScenario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: conversationScenariosApi.createScenario,
    onSuccess: () => {
      // 모든 시나리오 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: conversationScenariosKeys.all,
      });
    },
  });
};

// 시나리오 수정 (관리자용)
export const useUpdateScenario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...scenario
    }: { id: number } & Partial<ConversationScenario>) =>
      conversationScenariosApi.updateScenario(id, scenario),
    onSuccess: (data) => {
      // 해당 시나리오 캐시 업데이트
      queryClient.setQueryData(conversationScenariosKeys.detail(data.id), data);
      // 목록 쿼리들 무효화
      queryClient.invalidateQueries({
        queryKey: conversationScenariosKeys.lists(),
      });
    },
  });
};

// 시나리오 삭제 (관리자용)
export const useDeleteScenario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: conversationScenariosApi.deleteScenario,
    onSuccess: () => {
      // 모든 시나리오 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: conversationScenariosKeys.all,
      });
    },
  });
};

// 기본 시나리오 생성 (데이터가 없을 때 사용)
export const useCreateDefaultScenarios = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      // 백엔드의 초기화 API 호출
      return fetch("/api/scenario-init/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => {
        if (!response.ok) {
          throw new Error("기본 시나리오 생성 실패");
        }
        return response.json();
      });
    },
    onSuccess: () => {
      // 모든 시나리오 관련 쿼리 무효화하여 새로 불러오기
      queryClient.invalidateQueries({
        queryKey: conversationScenariosKeys.all,
      });
    },
  });
};
