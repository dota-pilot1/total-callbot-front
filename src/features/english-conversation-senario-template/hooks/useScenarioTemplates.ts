import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getScenarioTemplates,
  getScenarioTemplateById,
  getScenarioTemplateCategories,
  searchScenarioTemplates,
  copyScenarioTemplateToMy,
  getFilteredScenarioTemplates
} from '../api/scenarioTemplateApi';
import type {
  CopyScenarioRequest,
  ScenarioTemplateFilters,
  Difficulty
} from '../types';

// Query Keys
export const scenarioTemplateKeys = {
  all: ['scenarioTemplates'] as const,
  lists: () => [...scenarioTemplateKeys.all, 'list'] as const,
  list: (filters: ScenarioTemplateFilters & { page?: number; size?: number }) =>
    [...scenarioTemplateKeys.lists(), filters] as const,
  details: () => [...scenarioTemplateKeys.all, 'detail'] as const,
  detail: (id: number) => [...scenarioTemplateKeys.details(), id] as const,
  categories: () => [...scenarioTemplateKeys.all, 'categories'] as const,
  search: (keyword: string, page?: number, size?: number) =>
    [...scenarioTemplateKeys.all, 'search', keyword, page, size] as const,
};

/**
 * 공개 시나리오 템플릿 목록 조회 훅
 */
export const useScenarioTemplates = (params: {
  page?: number;
  size?: number;
  category?: string;
  difficulty?: Difficulty;
} = {}) => {
  return useQuery({
    queryKey: scenarioTemplateKeys.list(params),
    queryFn: () => getScenarioTemplates(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 필터링된 시나리오 템플릿 목록 조회 훅 (검색 포함)
 */
export const useFilteredScenarioTemplates = (
  filters: ScenarioTemplateFilters & { page?: number; size?: number }
) => {
  return useQuery({
    queryKey: scenarioTemplateKeys.list(filters),
    queryFn: () => getFilteredScenarioTemplates(filters),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 공개 시나리오 템플릿 상세 조회 훅
 */
export const useScenarioTemplateById = (id: number) => {
  return useQuery({
    queryKey: scenarioTemplateKeys.detail(id),
    queryFn: () => getScenarioTemplateById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10분
  });
};

/**
 * 공개 시나리오 템플릿 카테고리 목록 조회 훅
 */
export const useScenarioTemplateCategories = () => {
  return useQuery({
    queryKey: scenarioTemplateKeys.categories(),
    queryFn: getScenarioTemplateCategories,
    staleTime: 30 * 60 * 1000, // 30분
  });
};

/**
 * 공개 시나리오 템플릿 검색 훅
 */
export const useSearchScenarioTemplates = (params: {
  keyword: string;
  page?: number;
  size?: number;
}) => {
  return useQuery({
    queryKey: scenarioTemplateKeys.search(params.keyword, params.page, params.size),
    queryFn: () => searchScenarioTemplates(params),
    enabled: !!params.keyword.trim(),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 시나리오 템플릿 복사 훅
 */
export const useCopyScenarioTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: CopyScenarioRequest }) =>
      copyScenarioTemplateToMy(id, request),
    onSuccess: () => {
      // 개인 시나리오 목록 무효화 (복사 후 개인 목록이 업데이트되어야 함)
      queryClient.invalidateQueries({ queryKey: ['personalScenarios'] });
    },
  });
};

/**
 * 시나리오 템플릿 목록 새로고침 훅
 */
export const useRefreshScenarioTemplates = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: scenarioTemplateKeys.lists() });
  };
};
