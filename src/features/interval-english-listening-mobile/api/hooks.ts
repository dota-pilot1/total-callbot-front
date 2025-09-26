import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { intervalListeningApi } from "./intervalListeningApi";
import type { ListeningDifficulty, TestFilters } from "../types";

// Query Keys
export const intervalListeningKeys = {
  all: ["interval-listening"] as const,
  tests: () => [...intervalListeningKeys.all, "tests"] as const,
  testsByDifficulty: (difficulty: ListeningDifficulty) =>
    [...intervalListeningKeys.tests(), "difficulty", difficulty] as const,
  testById: (id: number) =>
    [...intervalListeningKeys.tests(), "detail", id] as const,
  searchTests: (filters: TestFilters) =>
    [...intervalListeningKeys.tests(), "search", filters] as const,
  sessions: () => [...intervalListeningKeys.all, "sessions"] as const,
  activeSessions: () =>
    [...intervalListeningKeys.sessions(), "active"] as const,
  session: (uuid: string) =>
    [...intervalListeningKeys.sessions(), "detail", uuid] as const,
  userStats: () => [...intervalListeningKeys.all, "stats"] as const,
};

// Query Hooks
export const useGetAllTests = () => {
  return useQuery({
    queryKey: intervalListeningKeys.tests(),
    queryFn: intervalListeningApi.getAllTests,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useGetTestsByDifficulty = (
  difficulty: ListeningDifficulty,
  enabled = true,
) => {
  return useQuery({
    queryKey: intervalListeningKeys.testsByDifficulty(difficulty),
    queryFn: () => intervalListeningApi.getTestsByDifficulty(difficulty),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetTestById = (testId: number, enabled = true) => {
  return useQuery({
    queryKey: intervalListeningKeys.testById(testId),
    queryFn: () => intervalListeningApi.getTestById(testId),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSearchTests = (filters: TestFilters) => {
  return useQuery({
    queryKey: intervalListeningKeys.searchTests(filters),
    queryFn: () => intervalListeningApi.searchTests(filters),
    enabled: !!(
      filters.difficulty ||
      filters.page !== undefined ||
      filters.size !== undefined
    ),
    staleTime: 2 * 60 * 1000, // 검색 결과는 2분
  });
};

export const useSearchTestsByKeyword = (
  keyword: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: [...intervalListeningKeys.tests(), "keyword", keyword],
    queryFn: () => intervalListeningApi.searchTestsByKeyword(keyword),
    enabled: (options?.enabled ?? true) && keyword.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};

export const useGetActiveUserSessions = () => {
  return useQuery({
    queryKey: intervalListeningKeys.activeSessions(),
    queryFn: intervalListeningApi.getActiveUserSessions,
    staleTime: 1 * 60 * 1000, // 1분
  });
};

export const useGetUserSessions = () => {
  return useQuery({
    queryKey: intervalListeningKeys.sessions(),
    queryFn: intervalListeningApi.getUserSessions,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetSession = (sessionUuid: string, enabled = true) => {
  return useQuery({
    queryKey: intervalListeningKeys.session(sessionUuid),
    queryFn: () => intervalListeningApi.getSession(sessionUuid),
    enabled: enabled && !!sessionUuid,
    staleTime: 30 * 1000, // 30초 (세션은 자주 업데이트)
  });
};

// Mutation Hooks
export const useGenerateTestData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: intervalListeningApi.generateTestData,
    onSuccess: () => {
      // 테스트 데이터 생성 후 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: intervalListeningKeys.tests(),
      });
    },
    onError: (error) => {
      console.error("Failed to generate test data:", error);
    },
  });
};

export const useCreateTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: intervalListeningApi.createTest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: intervalListeningKeys.tests(),
      });
    },
    onError: (error) => {
      console.error("Failed to create test:", error);
    },
  });
};

export const useStartSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ testId }: { testId: number }) =>
      intervalListeningApi.startSession({ testSetId: testId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: intervalListeningKeys.sessions(),
      });
    },
    onError: (error) => {
      console.error("Failed to start session:", error);
    },
  });
};

export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionUuid,
      questionId,
      selectedAnswer,
      responseTimeSeconds,
    }: {
      sessionUuid: string;
      questionId: number;
      selectedAnswer: string;
      responseTimeSeconds: number;
    }) =>
      intervalListeningApi.submitAnswer(sessionUuid, {
        questionId,
        selectedAnswer,
        responseTimeSeconds,
      }),
    onSuccess: (_, variables) => {
      // 세션 관련 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: intervalListeningKeys.session(variables.sessionUuid),
      });
      queryClient.invalidateQueries({
        queryKey: intervalListeningKeys.sessions(),
      });
    },
    onError: (error) => {
      console.error("Failed to submit answer:", error);
    },
  });
};
