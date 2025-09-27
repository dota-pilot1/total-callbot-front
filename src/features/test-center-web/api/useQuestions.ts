import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import type { Question, CreateQuestionRequest, UpdateQuestionRequest, QuestionStats } from '../types';

// API 함수들
const questionsApi = {
  // 특정 방의 문제 목록 조회
  getQuestions: async (roomId: number, includeInactive = false): Promise<Question[]> => {
    const { data } = await apiClient.get(`/test-center/rooms/${roomId}/questions?includeInactive=${includeInactive}`);
    return data;
  },

  // 특정 문제 조회
  getQuestion: async (roomId: number, questionId: number): Promise<Question> => {
    const { data } = await apiClient.get(`/test-center/rooms/${roomId}/questions/${questionId}`);
    return data;
  },

  // 문제 생성
  createQuestion: async (roomId: number, request: CreateQuestionRequest): Promise<Question> => {
    const { data } = await apiClient.post(`/test-center/rooms/${roomId}/questions`, request);
    return data;
  },

  // 문제 수정
  updateQuestion: async (roomId: number, questionId: number, request: UpdateQuestionRequest): Promise<Question> => {
    const { data } = await apiClient.put(`/test-center/rooms/${roomId}/questions/${questionId}`, request);
    return data;
  },

  // 문제 삭제
  deleteQuestion: async (roomId: number, questionId: number): Promise<void> => {
    await apiClient.delete(`/test-center/rooms/${roomId}/questions/${questionId}`);
  },

  // 문제 활성화
  activateQuestion: async (roomId: number, questionId: number): Promise<Question> => {
    const { data } = await apiClient.post(`/test-center/rooms/${roomId}/questions/${questionId}/activate`);
    return data;
  },

  // 문제 비활성화
  deactivateQuestion: async (roomId: number, questionId: number): Promise<Question> => {
    const { data } = await apiClient.post(`/test-center/rooms/${roomId}/questions/${questionId}/deactivate`);
    return data;
  },

  // 문제 통계 조회
  getQuestionStats: async (roomId: number): Promise<QuestionStats> => {
    const { data } = await apiClient.get(`/test-center/rooms/${roomId}/questions/stats`);
    return data;
  },
};

// React Query 훅들
export const useQuestions = (roomId: number, includeInactive = false) => {
  return useQuery({
    queryKey: ['questions', roomId, includeInactive],
    queryFn: () => questionsApi.getQuestions(roomId, includeInactive),
    enabled: !!roomId,
    staleTime: 30000, // 30초
  });
};

export const useQuestion = (roomId: number, questionId: number) => {
  return useQuery({
    queryKey: ['question', roomId, questionId],
    queryFn: () => questionsApi.getQuestion(roomId, questionId),
    enabled: !!roomId && !!questionId,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, request }: { roomId: number; request: CreateQuestionRequest }) =>
      questionsApi.createQuestion(roomId, request),
    onSuccess: (_data, variables) => {
      // 해당 방의 문제 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['questions', variables.roomId] });
      // 문제 통계 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['question-stats', variables.roomId] });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, questionId, request }: { roomId: number; questionId: number; request: UpdateQuestionRequest }) =>
      questionsApi.updateQuestion(roomId, questionId, request),
    onSuccess: (_data, variables) => {
      // 해당 방의 문제 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['questions', variables.roomId] });
      // 특정 문제 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['question', variables.roomId, variables.questionId] });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, questionId }: { roomId: number; questionId: number }) =>
      questionsApi.deleteQuestion(roomId, questionId),
    onSuccess: (_data, variables) => {
      // 해당 방의 문제 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['questions', variables.roomId] });
      // 문제 통계 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['question-stats', variables.roomId] });
    },
  });
};

export const useToggleQuestionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, questionId, activate }: { roomId: number; questionId: number; activate: boolean }) =>
      activate ? questionsApi.activateQuestion(roomId, questionId) : questionsApi.deactivateQuestion(roomId, questionId),
    onSuccess: (_data, variables) => {
      // 해당 방의 문제 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['questions', variables.roomId] });
      // 특정 문제 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['question', variables.roomId, variables.questionId] });
      // 문제 통계 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['question-stats', variables.roomId] });
    },
  });
};

export const useQuestionStats = (roomId: number) => {
  return useQuery({
    queryKey: ['question-stats', roomId],
    queryFn: () => questionsApi.getQuestionStats(roomId),
    enabled: !!roomId,
    staleTime: 60000, // 1분
  });
};
