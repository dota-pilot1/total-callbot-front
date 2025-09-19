import { Card, CardContent } from "../../../components/ui";
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import type { Feedback } from "../types";
import {
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_STATUS_COLORS,
} from "../types";

interface FeedbackListProps {
  feedbacks: Feedback[];
  isLoading?: boolean;
  onFeedbackClick?: (feedback: Feedback) => void;
  showAuthor?: boolean; // 관리자 모드에서만 작성자 정보 표시
}

export default function FeedbackList({
  feedbacks,
  isLoading = false,
  onFeedbackClick,
  showAuthor = false,
}: FeedbackListProps) {
  const getStatusIcon = (status: Feedback["status"]) => {
    switch (status) {
      case "PENDING":
        return <ClockIcon className="h-4 w-4" />;
      case "IN_REVIEW":
      case "IN_PROGRESS":
        return <ExclamationCircleIcon className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "REJECTED":
        return <ExclamationCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            건의사항이 없습니다
          </h3>
          <p className="text-gray-500">첫 번째 건의사항을 작성해보세요!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback) => (
        <Card
          key={feedback.id}
          className={`hover:shadow-md transition-shadow ${
            onFeedbackClick ? "cursor-pointer" : ""
          }`}
          onClick={() => onFeedbackClick?.(feedback)}
        >
          <CardContent className="p-6">
            {/* 헤더 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-800">
                  {FEEDBACK_TYPE_LABELS[feedback.type]}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${
                    FEEDBACK_STATUS_COLORS[feedback.status]
                  }`}
                >
                  {getStatusIcon(feedback.status)}
                  {FEEDBACK_STATUS_LABELS[feedback.status]}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(feedback.createdAt)}
              </span>
            </div>

            {/* 제목 */}
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
              {feedback.title}
            </h3>

            {/* 내용 미리보기 */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {feedback.content}
            </p>

            {/* 하단 정보 */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                {showAuthor && (
                  <span>
                    작성자: {feedback.authorName || feedback.authorEmail}
                  </span>
                )}
                <span>ID: #{feedback.id}</span>
              </div>

              {feedback.adminResponse && (
                <div className="flex items-center gap-1 text-green-600">
                  <ChatBubbleLeftRightIcon className="h-3 w-3" />
                  <span>답변 완료</span>
                </div>
              )}
            </div>

            {/* 관리자 응답 미리보기 */}
            {feedback.adminResponse && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="text-sm text-green-800 font-medium mb-1">
                  관리자 응답
                </p>
                <p className="text-sm text-green-700 line-clamp-2">
                  {feedback.adminResponse}
                </p>
                {feedback.respondedAt && (
                  <p className="text-xs text-green-600 mt-2">
                    {formatDate(feedback.respondedAt)}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
