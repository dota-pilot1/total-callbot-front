export type FeedbackType = 'BUG_REPORT' | 'FEATURE_REQUEST' | 'IMPROVEMENT' | 'UI_UX' | 'OTHER';

export type FeedbackStatus = 'PENDING' | 'IN_REVIEW' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

export interface Feedback {
  id: number;
  title: string;
  content: string;
  type: FeedbackType;
  status: FeedbackStatus;
  authorEmail: string;
  authorName: string;
  adminResponse?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackRequest {
  title: string;
  content: string;
  type: FeedbackType;
  authorEmail: string;
  authorName?: string;
}

export interface FeedbackFilters {
  type?: FeedbackType;
  status?: FeedbackStatus;
  keyword?: string;
}

export interface FeedbackStats {
  typeStats: Array<[FeedbackType, number]>;
  statusStats: Array<[FeedbackStatus, number]>;
}

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  BUG_REPORT: '버그 신고',
  FEATURE_REQUEST: '기능 요청',
  IMPROVEMENT: '개선 제안',
  UI_UX: 'UI/UX 피드백',
  OTHER: '기타'
};

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  PENDING: '접수됨',
  IN_REVIEW: '검토중',
  IN_PROGRESS: '처리중',
  COMPLETED: '완료',
  REJECTED: '반려'
};

export const FEEDBACK_STATUS_COLORS: Record<FeedbackStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  IN_REVIEW: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800'
};
