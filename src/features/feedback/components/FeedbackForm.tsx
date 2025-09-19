import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui";
import { Button } from "../../../components/ui";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { FeedbackType, CreateFeedbackRequest } from "../types";
import { FEEDBACK_TYPE_LABELS } from "../types";

interface FeedbackFormProps {
  onSubmit: (data: CreateFeedbackRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function FeedbackForm({ onSubmit, onCancel, isLoading = false }: FeedbackFormProps) {
  const [formData, setFormData] = useState<CreateFeedbackRequest>({
    title: "",
    content: "",
    type: "IMPROVEMENT",
    authorEmail: "",
    authorName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim() || !formData.authorEmail.trim()) {
      alert("제목, 내용, 이메일은 필수 입력 항목입니다.");
      return;
    }

    try {
      await onSubmit(formData);
      // 성공 시 폼 초기화
      setFormData({
        title: "",
        content: "",
        type: "IMPROVEMENT",
        authorEmail: "",
        authorName: "",
      });
    } catch (error) {
      console.error("피드백 제출 실패:", error);
    }
  };

  const handleChange = (field: keyof CreateFeedbackRequest, value: string | FeedbackType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">건의사항 작성</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="h-8 w-8 p-0"
        >
          <XMarkIcon className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 피드백 타입 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              피드백 유형 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value as FeedbackType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {Object.entries(FEEDBACK_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="건의사항 제목을 입력해주세요"
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.title.length}/200
            </div>
          </div>

          {/* 내용 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleChange("content", e.target.value)}
              placeholder="구체적인 내용을 작성해주세요. 버그 신고의 경우 재현 방법을 포함해주세요."
              rows={8}
              maxLength={2000}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
            <div className="text-xs text-gray-500 text-right">
              {formData.content.length}/2000
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.authorEmail}
                onChange={(e) => handleChange("authorEmail", e.target.value)}
                placeholder="답변 받을 이메일 주소"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                이름 (선택)
              </label>
              <input
                type="text"
                value={formData.authorName}
                onChange={(e) => handleChange("authorName", e.target.value)}
                placeholder="이름 (선택사항)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">작성 가이드</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 명확하고 구체적으로 작성해주세요</li>
              <li>• 버그 신고 시 재현 방법과 환경 정보를 포함해주세요</li>
              <li>• 기능 요청 시 필요한 이유와 사용 사례를 설명해주세요</li>
              <li>• 개인정보나 민감한 정보는 포함하지 마세요</li>
            </ul>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.content.trim() || !formData.authorEmail.trim()}
            >
              {isLoading ? "제출 중..." : "건의사항 제출"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
