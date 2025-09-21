import { useState, type ChangeEvent } from "react";
import { useCreateQuestion } from "../api/useQuestions";
import FullScreenSlideDialog from "../../../components/ui/FullScreenSlideDialog";
import { Button } from "../../../components/ui";
import { PlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import type { CreateQuestionRequest } from "../types";

interface AddQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
  roomName: string;
}

const CORRECT_ANSWER_OPTIONS = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
];

const baseFieldClassName =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary";
const errorFieldClassName =
  "border-red-500 focus:border-red-500 focus:ring-red-500";

const getFieldClassName = (hasError: boolean) =>
  `${baseFieldClassName}${hasError ? ` ${errorFieldClassName}` : ""}`;

export default function AddQuestionDialog({
  isOpen,
  onClose,
  roomId,
  roomName,
}: AddQuestionDialogProps) {
  const [formData, setFormData] = useState<CreateQuestionRequest>({
    title: "",
    content: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createQuestionMutation = useCreateQuestion();

  const handleInputChange = (
    field: keyof CreateQuestionRequest,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFieldChange = (
    field: keyof CreateQuestionRequest
  ) =>
    (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      handleInputChange(field, event.target.value);
    };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "문제 제목을 입력해주세요";
    }

    if (!formData.content.trim()) {
      newErrors.content = "문제 내용을 입력해주세요";
    }

    if (!formData.optionA.trim()) {
      newErrors.optionA = "선택지 A를 입력해주세요";
    }

    if (!formData.optionB.trim()) {
      newErrors.optionB = "선택지 B를 입력해주세요";
    }

    if (!formData.optionC.trim()) {
      newErrors.optionC = "선택지 C를 입력해주세요";
    }

    if (!formData.optionD.trim()) {
      newErrors.optionD = "선택지 D를 입력해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await createQuestionMutation.mutateAsync({ roomId, request: formData });

      // 성공 시 폼 초기화 및 다이얼로그 닫기
      setFormData({
        title: "",
        content: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("문제 생성 실패:", error);
    }
  };

  const handleClose = () => {
    // 입력 중인 데이터가 있으면 확인
    const hasData = Object.values(formData).some((value) => value.trim() !== "" && value !== "A");

    if (hasData) {
      if (confirm("입력 중인 내용이 있습니다. 정말 닫으시겠습니까?")) {
        setFormData({
          title: "",
          content: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "A",
        });
        setErrors({});
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <FullScreenSlideDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={`${roomName} - 문제 추가`}
      className="bg-white"
    >
      <div className="flex flex-col h-full">
        {/* 메인 콘텐츠 */}
        <div className="flex-1 px-4 py-6 sm:px-6 space-y-6 overflow-y-auto">
          {/* 문제 제목 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              문제 제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleFieldChange("title")}
              placeholder="예: 영어 회화 기초 문제"
              className={getFieldClassName(Boolean(errors.title))}
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* 문제 내용 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              문제 내용 *
            </label>
            <textarea
              value={formData.content}
              onChange={handleFieldChange("content")}
              placeholder="What is the correct way to greet someone in the morning?"
              rows={4}
              className={getFieldClassName(Boolean(errors.content))}
              aria-invalid={Boolean(errors.content)}
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          {/* 선택지들 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">선택지 *</h3>

            {/* 선택지 A */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground">
                A번
              </label>
              <input
                type="text"
                value={formData.optionA}
                onChange={handleFieldChange("optionA")}
                placeholder="Good night"
                className={getFieldClassName(Boolean(errors.optionA))}
                aria-invalid={Boolean(errors.optionA)}
              />
              {errors.optionA && (
                <p className="text-sm text-red-600">{errors.optionA}</p>
              )}
            </div>

            {/* 선택지 B */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground">
                B번
              </label>
              <input
                type="text"
                value={formData.optionB}
                onChange={handleFieldChange("optionB")}
                placeholder="Good morning"
                className={getFieldClassName(Boolean(errors.optionB))}
                aria-invalid={Boolean(errors.optionB)}
              />
              {errors.optionB && (
                <p className="text-sm text-red-600">{errors.optionB}</p>
              )}
            </div>

            {/* 선택지 C */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground">
                C번
              </label>
              <input
                type="text"
                value={formData.optionC}
                onChange={handleFieldChange("optionC")}
                placeholder="Good evening"
                className={getFieldClassName(Boolean(errors.optionC))}
                aria-invalid={Boolean(errors.optionC)}
              />
              {errors.optionC && (
                <p className="text-sm text-red-600">{errors.optionC}</p>
              )}
            </div>

            {/* 선택지 D */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground">
                D번
              </label>
              <input
                type="text"
                value={formData.optionD}
                onChange={handleFieldChange("optionD")}
                placeholder="Good afternoon"
                className={getFieldClassName(Boolean(errors.optionD))}
                aria-invalid={Boolean(errors.optionD)}
              />
              {errors.optionD && (
                <p className="text-sm text-red-600">{errors.optionD}</p>
              )}
            </div>
          </div>

          {/* 정답 선택 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              정답 *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CORRECT_ANSWER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange("correctAnswer", option.value)}
                  className={`
                    min-h-[44px] px-4 py-2 border rounded-md text-sm font-medium transition-colors
                    ${
                      formData.correctAnswer === option.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }
                  `}
                >
                  <div className="flex items-center justify-center gap-2">
                    {formData.correctAnswer === option.value && (
                      <CheckIcon className="w-4 h-4" />
                    )}
                    {option.label}번
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex-shrink-0 border-t border-border bg-background px-4 py-4 sm:px-6">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={createQuestionMutation.isPending}
              className="min-h-[44px]"
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createQuestionMutation.isPending}
              className="min-h-[44px]"
            >
              {createQuestionMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  추가 중...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  문제 추가
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </FullScreenSlideDialog>
  );
}
