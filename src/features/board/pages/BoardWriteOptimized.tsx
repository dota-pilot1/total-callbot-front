import React, { memo, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useBoardFormImproved } from "../hooks/useBoardFormImproved";
import { BoardFormFieldsOptimized } from "../components/optimized/BoardFormFieldsOptimized";
import { WRITING_GUIDE } from "../constants/boardWrite";
import type { FormMode } from "../types/form";

// 로딩 컴포넌트를 분리하여 메모이제이션
const LoadingSpinner = memo(() => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
));

// 에러 컴포넌트를 분리하여 메모이제이션
const ErrorAlert = memo(
  ({ error, onRetry }: { error: string; onRetry?: () => void }) => (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-800">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    </div>
  ),
);

// 성공 알림 컴포넌트
const SuccessAlert = memo(({ message }: { message: string }) => (
  <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg
          className="h-5 w-5 text-green-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-green-800">{message}</p>
      </div>
    </div>
  </div>
));

// 액션 버튼들을 분리하여 메모이제이션
const ActionButtons = memo(
  ({
    canSubmit,
    isLoading,
    isDirty,
    mode,
    onSubmit,
    onCancel,
    onReset,
  }: {
    canSubmit: boolean;
    isLoading: boolean;
    isDirty: boolean;
    mode: FormMode;
    onSubmit: () => void;
    onCancel: () => void;
    onReset: () => void;
  }) => {
    const submitText = mode === "edit" ? "수정하기" : "작성하기";
    const submitLoadingText = mode === "edit" ? "수정 중..." : "작성 중...";

    return (
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        <button
          type="submit"
          onClick={onSubmit}
          disabled={!canSubmit || isLoading}
          className={`
          flex-1 px-6 py-3 rounded-md font-medium transition-colors
          ${
            canSubmit && !isLoading
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }
        `}
        >
          {isLoading ? submitLoadingText : submitText}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          취소
        </button>

        {isDirty && (
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="px-4 py-3 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            초기화
          </button>
        )}
      </div>
    );
  },
);

// 작성 가이드 컴포넌트
const WritingGuide = memo(() => (
  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
    <h3 className="text-sm font-medium text-blue-800 mb-2">
      {WRITING_GUIDE.title}
    </h3>
    <ul className="text-sm text-blue-700 space-y-1">
      {WRITING_GUIDE.tips.map((tip, index) => (
        <li key={index} className="flex items-start">
          <span className="text-blue-500 mr-2">•</span>
          <span>{tip}</span>
        </li>
      ))}
    </ul>
  </div>
));

// 페이지 헤더 컴포넌트
const PageHeader = memo(({ mode }: { mode: FormMode }) => {
  const title = mode === "edit" ? "게시글 수정" : "게시글 작성";
  const description =
    mode === "edit"
      ? "게시글을 수정하고 변경사항을 저장하세요."
      : "새로운 게시글을 작성해보세요.";

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
});

// 메인 컴포넌트
export const BoardWriteOptimized = memo(() => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  // 모드 결정 로직을 메모이제이션
  const mode: FormMode = useMemo(() => {
    return editId ? "edit" : "create";
  }, [editId]);

  // 성공/에러 핸들러들을 메모이제이션
  const handleSuccess = useCallback(
    (postId: number) => {
      navigate(`/board/${postId}`, {
        replace: true,
        state: {
          message:
            mode === "edit"
              ? "게시글이 수정되었습니다."
              : "게시글이 작성되었습니다.",
        },
      });
    },
    [navigate, mode],
  );

  const handleError = useCallback((error: Error) => {
    console.error("Form submission error:", error);
    // 여기서 toast 알림을 표시할 수 있음
  }, []);

  // 폼 훅 사용
  const {
    formState,
    submissionState,
    validationResult,
    isLoading,
    handlers,
    canSubmit,
    isDirty,
  } = useBoardFormImproved({
    mode,
    postId: editId ? Number(editId) : undefined,
    onSuccess: handleSuccess,
    onError: handleError,
  });

  // 키보드 단축키 처리
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ctrl+S로 저장
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        if (canSubmit) {
          handlers.onSubmit();
        }
      }

      // Esc로 취소
      if (e.key === "Escape") {
        handlers.onCancel();
      }
    },
    [canSubmit, handlers],
  );

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      handlers.onSubmit();
    },
    [handlers],
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader mode={mode} />

        <div className="bg-white shadow-sm rounded-lg">
          <div className="p-6">
            <WritingGuide />

            {submissionState.error && (
              <ErrorAlert
                error={submissionState.error}
                onRetry={() => handlers.onSubmit()}
              />
            )}

            {submissionState.success && (
              <SuccessAlert
                message={
                  mode === "edit"
                    ? "수정이 완료되었습니다!"
                    : "작성이 완료되었습니다!"
                }
              />
            )}

            <Suspense fallback={<LoadingSpinner />}>
              <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
                <BoardFormFieldsOptimized
                  formState={formState}
                  validationResult={validationResult}
                  isLoading={isLoading}
                  onFieldChange={handlers.onFieldChange}
                />

                <ActionButtons
                  canSubmit={canSubmit}
                  isLoading={isLoading}
                  isDirty={isDirty}
                  mode={mode}
                  onSubmit={handlers.onSubmit}
                  onCancel={handlers.onCancel}
                  onReset={handlers.onReset}
                />
              </form>
            </Suspense>
          </div>
        </div>

        {/* 키보드 단축키 안내 */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">
              Ctrl + S
            </kbd>{" "}
            저장 ·
            <kbd className="px-2 py-1 bg-gray-100 rounded text-xs ml-2">
              Esc
            </kbd>{" "}
            취소
          </p>
        </div>
      </div>
    </div>
  );
});

BoardWriteOptimized.displayName = "BoardWriteOptimized";
LoadingSpinner.displayName = "LoadingSpinner";
ErrorAlert.displayName = "ErrorAlert";
SuccessAlert.displayName = "SuccessAlert";
ActionButtons.displayName = "ActionButtons";
WritingGuide.displayName = "WritingGuide";
PageHeader.displayName = "PageHeader";
