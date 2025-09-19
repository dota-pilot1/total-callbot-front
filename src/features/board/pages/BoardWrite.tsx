import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui";
import { Button } from "../../../components/ui";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import type { PostCategory } from "../types";

const CATEGORY_OPTIONS: { value: PostCategory; label: string }[] = [
  { value: "qna", label: "질문/답변" },
  { value: "free", label: "자유게시판" },
  { value: "review", label: "학습후기" },
];

export default function BoardWrite() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("free");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: API 연동
      console.log("게시글 작성:", { title, content, category });

      // 임시: 작성 완료 후 게시판 목록으로 이동
      setTimeout(() => {
        navigate("/board");
      }, 1000);
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      alert("게시글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      if (confirm("작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?")) {
        navigate("/board");
      }
    } else {
      navigate("/board");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          목록으로
        </Button>
        <h1 className="text-2xl font-bold">게시글 작성</h1>
      </div>

      {/* 작성 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>새 게시글</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 카테고리 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">카테고리</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 제목 입력 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">제목</label>
              <input
                type="text"
                placeholder="게시글 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="text-xs text-muted-foreground text-right">
                {title.length}/100
              </div>
            </div>

            {/* 내용 입력 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">내용</label>
              <textarea
                placeholder="게시글 내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={2000}
              />
              <div className="text-xs text-muted-foreground text-right">
                {content.length}/2000
              </div>
            </div>

            {/* 작성 가이드 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">작성 가이드</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 다른 사용자를 존중하는 언어를 사용해주세요</li>
                <li>• 학습과 관련된 유익한 정보를 공유해주세요</li>
                <li>• 개인정보나 부적절한 내용은 피해주세요</li>
                <li>
                  • 질문글인 경우 구체적으로 작성하면 더 좋은 답변을 받을 수
                  있어요
                </li>
              </ul>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || !content.trim() || isSubmitting}
              >
                {isSubmitting ? "작성 중..." : "게시글 작성"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
