import type {
  Feedback,
  CreateFeedbackRequest,
  FeedbackFilters,
  FeedbackStats,
  FeedbackStatus,
} from "../types";

const API_BASE_URL = "http://localhost:8080/api/feedback";

interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  number: number;
}

// 피드백 생성
export const createFeedback = async (
  data: CreateFeedbackRequest,
): Promise<Feedback> => {
  const response = await fetch(`${API_BASE_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("피드백 생성에 실패했습니다");
  }

  return response.json();
};

// 내 피드백 목록 조회
export const fetchMyFeedbacks = async (
  email: string,
  page: number = 0,
  size: number = 20,
): Promise<PageResponse<Feedback>> => {
  const params = new URLSearchParams({
    email,
    page: page.toString(),
    size: size.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/my?${params}`);

  if (!response.ok) {
    throw new Error("피드백 목록 조회에 실패했습니다");
  }

  return response.json();
};

// 관리자용 피드백 목록 조회
export const fetchFeedbacks = async (
  filters: FeedbackFilters = {},
  page: number = 0,
  size: number = 20,
): Promise<PageResponse<Feedback>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (filters.type) params.append("type", filters.type);
  if (filters.status) params.append("status", filters.status);
  if (filters.keyword) params.append("keyword", filters.keyword);

  const response = await fetch(`${API_BASE_URL}/admin?${params}`);

  if (!response.ok) {
    throw new Error("피드백 목록 조회에 실패했습니다");
  }

  return response.json();
};

// 피드백 상세 조회
export const fetchFeedback = async (id: number): Promise<Feedback> => {
  const response = await fetch(`${API_BASE_URL}/${id}`);

  if (!response.ok) {
    throw new Error("피드백 조회에 실패했습니다");
  }

  return response.json();
};

// 피드백 상태 업데이트 (관리자용)
export const updateFeedbackStatus = async (
  id: number,
  status: FeedbackStatus,
): Promise<Feedback> => {
  const response = await fetch(`${API_BASE_URL}/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("상태 업데이트에 실패했습니다");
  }

  return response.json();
};

// 관리자 응답 추가
export const addAdminResponse = async (
  id: number,
  response: string,
): Promise<Feedback> => {
  const responseData = await fetch(`${API_BASE_URL}/${id}/response`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ response }),
  });

  if (!responseData.ok) {
    throw new Error("응답 추가에 실패했습니다");
  }

  return responseData.json();
};

// 피드백 삭제 (관리자용)
export const deleteFeedback = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("피드백 삭제에 실패했습니다");
  }
};

// 통계 조회 (관리자용)
export const fetchFeedbackStats = async (): Promise<FeedbackStats> => {
  const response = await fetch(`${API_BASE_URL}/admin/stats`);

  if (!response.ok) {
    throw new Error("통계 조회에 실패했습니다");
  }

  return response.json();
};
