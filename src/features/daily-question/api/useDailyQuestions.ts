import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyQuestionApi } from './dailyQuestionApi';

// Query keys
export const DAILY_QUESTION_KEYS = {
  all: ['daily-questions'] as const,
  todaySet: () => [...DAILY_QUESTION_KEYS.all, 'today'] as const,
  setByDate: (date: string) => [...DAILY_QUESTION_KEYS.all, 'set', date] as const,
  conversation: (date: string) => [...DAILY_QUESTION_KEYS.all, 'conversation', date] as const,
  reading: (date: string) => [...DAILY_QUESTION_KEYS.all, 'reading', date] as const,
  math: (date: string) => [...DAILY_QUESTION_KEYS.all, 'math', date] as const,
  allQuestions: (date: string) => [...DAILY_QUESTION_KEYS.all, 'all', date] as const,
  statistics: () => [...DAILY_QUESTION_KEYS.all, 'statistics'] as const,
} as const;

// 오늘의 문제 세트 조회
export const useTodayQuestionSet = () => {
  return useQuery({
    queryKey: DAILY_QUESTION_KEYS.todaySet(),
    queryFn: dailyQuestionApi.getTodayQuestionSet,
    refetchInterval: (query) => {
      // GENERATING 상태일 때만 자동 새로고침 (10초마다)
      return query.state.data?.status === 'GENERATING' ? 10000 : false;
    },
    staleTime: 30000, // 30초
  });
};

// 특정 날짜의 문제 세트 조회
export const useQuestionSetByDate = (date: string, enabled = true) => {
  return useQuery({
    queryKey: DAILY_QUESTION_KEYS.setByDate(date),
    queryFn: () => dailyQuestionApi.getQuestionSetByDate(date),
    enabled: enabled && !!date,
    staleTime: 60000, // 1분
  });
};

// 영어 회화 문제 조회
export const useConversationQuestions = (date: string, enabled = true) => {
  return useQuery({
    queryKey: DAILY_QUESTION_KEYS.conversation(date),
    queryFn: () => dailyQuestionApi.getConversationQuestions(date),
    enabled: enabled && !!date,
    staleTime: 300000, // 5분
  });
};

// 영어 독해 문제 조회
export const useReadingQuestions = (date: string, enabled = true) => {
  return useQuery({
    queryKey: DAILY_QUESTION_KEYS.reading(date),
    queryFn: () => dailyQuestionApi.getReadingQuestions(date),
    enabled: enabled && !!date,
    staleTime: 300000, // 5분
  });
};

// 수학 문제 조회
export const useMathQuestions = (date: string, enabled = true) => {
  return useQuery({
    queryKey: DAILY_QUESTION_KEYS.math(date),
    queryFn: () => dailyQuestionApi.getMathQuestions(date),
    enabled: enabled && !!date,
    staleTime: 300000, // 5분
  });
};

// 모든 카테고리 문제 조회
export const useAllQuestions = (date: string, enabled = true) => {
  return useQuery({
    queryKey: DAILY_QUESTION_KEYS.allQuestions(date),
    queryFn: () => dailyQuestionApi.getAllQuestions(date),
    enabled: enabled && !!date,
    staleTime: 300000, // 5분
  });
};

// 통계 조회
export const useDailyQuestionStatistics = () => {
  return useQuery({
    queryKey: DAILY_QUESTION_KEYS.statistics(),
    queryFn: dailyQuestionApi.getStatistics,
    staleTime: 60000, // 1분
  });
};

// 문제 생성 트리거 (관리자)
export const useTriggerGeneration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (date?: string) => dailyQuestionApi.triggerGeneration(date),
    onSuccess: () => {
      // 관련 쿼리들 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: DAILY_QUESTION_KEYS.all });
    },
  });
};
