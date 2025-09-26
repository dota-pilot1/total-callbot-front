import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { intervalReadingApi } from "./intervalReadingApi";
import { apiClient } from "../../../shared/api/client";
import type { ReadingDifficulty, TestFilters } from "../types";

// Query Keys
export const intervalReadingKeys = {
  all: ["interval-reading"] as const,
  tests: () => [...intervalReadingKeys.all, "tests"] as const,
  testsByDifficulty: (difficulty: ReadingDifficulty) =>
    [...intervalReadingKeys.tests(), "difficulty", difficulty] as const,
  testById: (id: number) =>
    [...intervalReadingKeys.tests(), "detail", id] as const,
  searchTests: (filters: TestFilters) =>
    [...intervalReadingKeys.tests(), "search", filters] as const,
  sessions: () => [...intervalReadingKeys.all, "sessions"] as const,
  activeSessions: () => [...intervalReadingKeys.sessions(), "active"] as const,
  session: (uuid: string) =>
    [...intervalReadingKeys.sessions(), "detail", uuid] as const,
  userStats: () => [...intervalReadingKeys.all, "stats"] as const,
};

// Query Hooks
export const useGetAllTests = () => {
  return useQuery({
    queryKey: intervalReadingKeys.tests(),
    queryFn: intervalReadingApi.getAllTests,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useGetTestsByDifficulty = (
  difficulty: ReadingDifficulty,
  enabled = true,
) => {
  return useQuery({
    queryKey: intervalReadingKeys.testsByDifficulty(difficulty),
    queryFn: () => intervalReadingApi.getTestsByDifficulty(difficulty),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetTestById = (testId: number, enabled = true) => {
  return useQuery({
    queryKey: intervalReadingKeys.testById(testId),
    queryFn: () => intervalReadingApi.getTestById(testId),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchTests = (filters: TestFilters) => {
  return useQuery({
    queryKey: intervalReadingKeys.searchTests(filters),
    queryFn: () => intervalReadingApi.searchTests(filters),
    enabled: !!(
      filters.difficulty ||
      filters.minWords ||
      filters.maxWords ||
      filters.maxTime
    ),
    staleTime: 2 * 60 * 1000, // 검색 결과는 2분
  });
};

export const useSearchTestsByKeyword = (
  keyword: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: [...intervalReadingKeys.tests(), "keyword", keyword],
    queryFn: () => intervalReadingApi.searchTestsByKeyword(keyword),
    enabled: (options?.enabled ?? true) && keyword.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};

export const useGetActiveUserSessions = () => {
  return useQuery({
    queryKey: intervalReadingKeys.activeSessions(),
    queryFn: intervalReadingApi.getActiveUserSessions,
    staleTime: 1 * 60 * 1000, // 1분
  });
};

export const useGetUserSessions = () => {
  return useQuery({
    queryKey: intervalReadingKeys.sessions(),
    queryFn: intervalReadingApi.getUserSessions,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetSession = (sessionUuid: string, enabled = true) => {
  return useQuery({
    queryKey: intervalReadingKeys.session(sessionUuid),
    queryFn: () => intervalReadingApi.getSession(sessionUuid),
    enabled: enabled && !!sessionUuid,
    staleTime: 30 * 1000, // 30초 (세션은 자주 업데이트)
  });
};

export const useGetUserStats = () => {
  return useQuery({
    queryKey: intervalReadingKeys.userStats(),
    queryFn: intervalReadingApi.getUserStats,
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation Hooks
export const useCreateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: intervalReadingApi.createTest,
    onSuccess: () => {
      // 테스트 목록 무효화
      queryClient.invalidateQueries({ queryKey: intervalReadingKeys.tests() });
    },
  });
};

export const useStartSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: intervalReadingApi.startSession,
    onSuccess: () => {
      // 활성 세션 목록 무효화
      queryClient.invalidateQueries({
        queryKey: intervalReadingKeys.activeSessions(),
      });
      queryClient.invalidateQueries({
        queryKey: intervalReadingKeys.sessions(),
      });
    },
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionUuid,
      request,
    }: {
      sessionUuid: string;
      request: any;
    }) => intervalReadingApi.updateProgress(sessionUuid, request),
    onSuccess: (_data, variables) => {
      // 특정 세션 데이터 무효화
      queryClient.invalidateQueries({
        queryKey: intervalReadingKeys.session(variables.sessionUuid),
      });
      queryClient.invalidateQueries({
        queryKey: intervalReadingKeys.activeSessions(),
      });
    },
  });
};

export const usePauseSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: intervalReadingApi.pauseSession,
    onSuccess: (_data, sessionUuid) => {
      queryClient.invalidateQueries({
        queryKey: intervalReadingKeys.session(sessionUuid),
      });
      queryClient.invalidateQueries({
        queryKey: intervalReadingKeys.activeSessions(),
      });
    },
  });
};

export const useResumeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: intervalReadingApi.resumeSession,
    onSuccess: (_data, sessionUuid) => {
      queryClient.invalidateQueries({
        queryKey: intervalReadingKeys.session(sessionUuid),
      });
      queryClient.invalidateQueries({
        queryKey: intervalReadingKeys.activeSessions(),
      });
    },
  });
};

export const useCompleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: intervalReadingApi.completeSession,
    onSuccess: (_data, sessionUuid) => {
      queryClient.invalidateQueries({
        queryKey: intervalReadingKeys.session(sessionUuid),
      });
      queryClient.invalidateQueries({
        queryKey: intervalReadingKeys.activeSessions(),
      });
      queryClient.invalidateQueries({
        queryKey: intervalReadingKeys.sessions(),
      });
      queryClient.invalidateQueries({
        queryKey: intervalReadingKeys.userStats(),
      });
    },
  });
};

// 테스트 데이터 생성 mutation
export const useGenerateTestData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/interval-reading/init/test-data");
      return response.data;
    },
    onSuccess: () => {
      // 모든 테스트 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: intervalReadingKeys.tests() });
    },
  });
};
