import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createFeedback,
  fetchMyFeedbacks,
  fetchFeedbacks,
  fetchFeedback,
  updateFeedbackStatus,
  addAdminResponse,
  deleteFeedback,
  fetchFeedbackStats,
} from "../api/feedbackApi";
import type {
  CreateFeedbackRequest,
  FeedbackFilters,
  FeedbackStatus,
} from "../types";

// 내 피드백 목록 조회
export const useMyFeedbacks = (
  email: string,
  page: number = 0,
  size: number = 20,
) => {
  return useQuery({
    queryKey: ["feedback", "my", email, page, size],
    queryFn: () => fetchMyFeedbacks(email, page, size),
    enabled: !!email,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

// 관리자용 피드백 목록 조회
export const useFeedbacks = (
  filters: FeedbackFilters = {},
  page: number = 0,
  size: number = 20,
) => {
  return useQuery({
    queryKey: ["feedback", "admin", filters, page, size],
    queryFn: () => fetchFeedbacks(filters, page, size),
    staleTime: 3 * 60 * 1000, // 3분
  });
};

// 피드백 상세 조회
export const useFeedback = (id: number) => {
  return useQuery({
    queryKey: ["feedback", "detail", id],
    queryFn: () => fetchFeedback(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

// 피드백 통계 조회
export const useFeedbackStats = () => {
  return useQuery({
    queryKey: ["feedback", "stats"],
    queryFn: fetchFeedbackStats,
    staleTime: 10 * 60 * 1000, // 10분
  });
};

// 피드백 생성
export const useCreateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeedbackRequest) => createFeedback(data),
    onSuccess: (newFeedback) => {
      // 내 피드백 목록 무효화
      queryClient.invalidateQueries({
        queryKey: ["feedback", "my", newFeedback.authorEmail],
      });
      // 관리자 피드백 목록 무효화
      queryClient.invalidateQueries({
        queryKey: ["feedback", "admin"],
      });
      // 통계 무효화
      queryClient.invalidateQueries({
        queryKey: ["feedback", "stats"],
      });
    },
  });
};

// 피드백 상태 업데이트 (관리자용)
export const useUpdateFeedbackStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: FeedbackStatus }) =>
      updateFeedbackStatus(id, status),
    onSuccess: (updatedFeedback) => {
      // 특정 피드백 캐시 업데이트
      queryClient.setQueryData(
        ["feedback", "detail", updatedFeedback.id],
        updatedFeedback,
      );
      // 목록들 무효화
      queryClient.invalidateQueries({ queryKey: ["feedback", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["feedback", "my"] });
      queryClient.invalidateQueries({ queryKey: ["feedback", "stats"] });
    },
  });
};

// 관리자 응답 추가
export const useAddAdminResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, response }: { id: number; response: string }) =>
      addAdminResponse(id, response),
    onSuccess: (updatedFeedback) => {
      // 특정 피드백 캐시 업데이트
      queryClient.setQueryData(
        ["feedback", "detail", updatedFeedback.id],
        updatedFeedback,
      );
      // 목록들 무효화
      queryClient.invalidateQueries({ queryKey: ["feedback", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["feedback", "my"] });
      queryClient.invalidateQueries({ queryKey: ["feedback", "stats"] });
    },
  });
};

// 피드백 삭제 (관리자용)
export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteFeedback(id),
    onSuccess: (_, deletedId) => {
      // 특정 피드백 캐시 제거
      queryClient.removeQueries({
        queryKey: ["feedback", "detail", deletedId],
      });
      // 목록들 무효화
      queryClient.invalidateQueries({ queryKey: ["feedback", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["feedback", "my"] });
      queryClient.invalidateQueries({ queryKey: ["feedback", "stats"] });
    },
  });
};
