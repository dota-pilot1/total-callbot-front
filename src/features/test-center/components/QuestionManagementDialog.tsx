import { useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import FullScreenSlideDialog from "../../../components/ui/FullScreenSlideDialog";
import { Button } from "../../../components/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui";
import AddQuestionDialog from "./AddQuestionDialog";
import {
  useQuestions,
  useDeleteQuestion,
  useToggleQuestionStatus,
} from "../api/useQuestions";
import type { Question } from "../types";

interface QuestionManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
  roomName: string;
}

export default function QuestionManagementDialog({
  isOpen,
  onClose,
  roomId,
  roomName,
}: QuestionManagementDialogProps) {
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // API 훅들
  const {
    data: questions = [],
    isLoading: loading,
    error,
  } = useQuestions(roomId, true); // includeInactive = true
  const deleteQuestionMutation = useDeleteQuestion();
  const toggleStatusMutation = useToggleQuestionStatus();

  const handleCreateQuestion = () => {
    setEditingQuestion(null);
    setShowAddQuestionDialog(true);
  };

  const handleEditQuestion = (question: Question) => {
    setShowAddQuestionDialog(false);
    setEditingQuestion(question);
  };

  const handleToggleActive = async (question: Question) => {
    try {
      await toggleStatusMutation.mutateAsync({
        roomId,
        questionId: question.id,
        activate: !question.isActive,
      });
    } catch (error) {
      console.error("문제 상태 변경 실패:", error);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (confirm("문제를 삭제하시겠습니까?")) {
      try {
        await deleteQuestionMutation.mutateAsync({ roomId, questionId });
        setEditingQuestion((prev) => (prev?.id === questionId ? null : prev));
      } catch (error) {
        console.error("문제 삭제 실패:", error);
      }
    }
  };

  const handleCloseAddDialog = () => {
    setShowAddQuestionDialog(false);
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };

  const QuestionCard = ({
    question,
    isEditing,
  }: {
    question: Question;
    isEditing: boolean;
  }) => (
    <Card className="mb-3 sm:mb-4 touch-manipulation">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base sm:text-lg leading-tight flex-1 pr-2">
            {question.questionOrder}. {question.title}
          </CardTitle>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {isEditing && (
              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                편집 중
              </span>
            )}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                question.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {question.isActive ? "활성" : "비활성"}
            </span>
            <span className="text-xs text-muted-foreground">
              {question.points || 0}점
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm mb-4 leading-relaxed">{question.content}</p>

        {/* 모바일 최적화된 선택지 레이아웃 */}
        <div className="space-y-2 mb-4">
          {["A", "B", "C", "D"].map((option) => {
            const text = question[
              `option${option}` as keyof Question
            ] as string;
            const isCorrect = question.correctAnswer === option;
            return (
              <div
                key={option}
                className={`p-3 rounded-lg border text-sm transition-colors ${
                  isCorrect
                    ? "border-green-500 bg-green-50 text-green-800"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-base flex-shrink-0 mt-0.5 w-6">
                    {option}.
                  </span>
                  <span className="flex-1 leading-relaxed">{text}</span>
                  {isCorrect && (
                    <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full flex-shrink-0 font-medium">
                      정답
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 모바일 최적화된 하단 정보 및 액션 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="text-xs text-muted-foreground">
            제한시간: {question.timeLimit || "무제한"}초
          </div>

          {/* 모바일 친화적인 액션 버튼들 */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleActive(question)}
              className="min-h-[44px] px-3 flex items-center gap-2 flex-1 sm:flex-none"
              disabled={toggleStatusMutation.isPending}
            >
              {question.isActive ? (
                <>
                  <EyeIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">비활성화</span>
                </>
              ) : (
                <>
                  <EyeSlashIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">활성화</span>
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditQuestion(question)}
              className="min-h-[44px] px-3 flex items-center gap-2 flex-1 sm:flex-none"
            >
              <PencilIcon className="w-4 h-4" />
              <span className="text-xs font-medium">수정</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteQuestion(question.id)}
              className="min-h-[44px] px-3 flex items-center gap-2 text-red-600 hover:text-red-700 flex-1 sm:flex-none"
              disabled={deleteQuestionMutation.isPending}
            >
              <TrashIcon className="w-4 h-4" />
              <span className="text-xs font-medium">삭제</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <FullScreenSlideDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`${roomName} (ID: ${roomId}) - 문제 관리`}
    >
      <div className="p-4 space-y-4">
        {/* 모바일 우선 헤더 */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-semibold mb-1">문제 목록</h2>
            <p className="text-sm text-muted-foreground mb-1">
              총 {questions.length}개 문제 (활성:{" "}
              {questions.filter((q) => q.isActive).length}개)
            </p>
            <p className="text-xs text-muted-foreground">
              테스트룸 ID: {roomId}
            </p>
          </div>

          {/* 모바일 친화적인 문제 추가 버튼 */}
          <Button
            onClick={handleCreateQuestion}
            className="min-h-[48px] px-6 flex items-center gap-2 w-full sm:w-auto"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="font-medium">문제 추가</span>
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-sm text-red-600">
                문제를 불러오는 중 오류가 발생했습니다:{" "}
                {error instanceof Error ? error.message : "알 수 없는 오류"}
              </p>
            </CardContent>
          </Card>
        )}

        {editingQuestion && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                "{editingQuestion.title}" 문제 편집 준비 중
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                세부 편집 UI가 연결되면 이 영역에서 내용을 수정할 수 있습니다.
              </p>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  편집 취소
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : questions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  아직 문제가 없습니다.
                </p>
                <Button onClick={handleCreateQuestion}>
                  첫 번째 문제 만들기
                </Button>
              </CardContent>
            </Card>
          ) : (
            questions
              .sort((a, b) => a.questionOrder - b.questionOrder)
              .map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  isEditing={editingQuestion?.id === question.id}
                />
              ))
          )}
        </div>

        {/* 모바일 우선 하단 액션 */}
        <div className="pt-4 border-t space-y-3 sm:space-y-0">
          {/* 모바일에서는 세로 배치, 데스크톱에서는 가로 배치 */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              onClick={onClose}
              className="min-h-[48px] w-full sm:w-auto order-last sm:order-first"
            >
              닫기
            </Button>

            {/* 부가 기능 버튼들 */}
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <Button
                variant="outline"
                className="min-h-[48px] w-full sm:w-auto"
              >
                문제 가져오기
              </Button>
              <Button
                variant="outline"
                className="min-h-[48px] w-full sm:w-auto"
              >
                AI 문제 생성
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AddQuestionDialog */}
      <AddQuestionDialog
        isOpen={showAddQuestionDialog}
        onClose={handleCloseAddDialog}
        roomId={roomId}
        roomName={roomName}
      />
    </FullScreenSlideDialog>
  );
}
