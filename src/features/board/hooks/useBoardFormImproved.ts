import { useReducer, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreatePost, useUpdatePost, useBoardPost } from "./index";
import {
  validateForm,
  validateFieldRealtime,
  isFormDirty,
  hasUnsavedChanges,
  canSubmitForm,
  DEFAULT_FORM_CONFIG,
} from "../utils/validation";
import {
  handleApiError,
  logError,
  showErrorNotification,
} from "../utils/errorHandler";
import type {
  BoardFormState,
  FormAction,
  SubmissionState,
  UseBoardFormOptions,
  UseBoardFormReturn,
  FormConfig,
} from "../types/form";
import type { CreatePostRequest } from "../types";

// 초기 폼 상태
const INITIAL_FORM_STATE: BoardFormState = {
  title: "",
  content: "",
  category: "FREE",
  images: [],
};

// 초기 제출 상태
const INITIAL_SUBMISSION_STATE: SubmissionState = {
  isSubmitting: false,
  error: null,
  success: false,
};

// 폼 상태 관리 리듀서
function formReducer(
  state: BoardFormState,
  action: FormAction,
): BoardFormState {
  switch (action.type) {
    case "SET_FIELD":
      console.log("📝 formReducer SET_FIELD:", {
        field: action.field,
        value: action.value,
        valueType: typeof action.value,
        isArray: Array.isArray(action.value),
        currentState: state,
        timestamp: new Date().toISOString(),
      });

      // 🔍 images 필드 변화 특별 추적
      if (action.field === "images") {
        console.log("🔍 [formReducer] images 필드 변화 상세:", {
          기존: state.images,
          새로운값: action.value,
          변화원인: new Error().stack?.split("\n").slice(0, 8).join("\n"),
        });
      }

      const newState = {
        ...state,
        [action.field]: action.value,
      };

      console.log("📝 formReducer 새로운 상태:", newState);
      return newState;

    case "SET_FORM":
      return {
        ...action.data,
      };

    case "RESET_FORM":
      return INITIAL_FORM_STATE;

    default:
      return state;
  }
}

// 제출 상태 관리 리듀서
function submissionReducer(
  state: SubmissionState,
  action: Partial<SubmissionState>,
): SubmissionState {
  return {
    ...state,
    ...action,
  };
}

export function useBoardFormImproved(
  options: UseBoardFormOptions,
): UseBoardFormReturn {
  const { mode, postId, onSuccess, onError, config: userConfig } = options;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = mode === "edit" || !!editId;
  const actualPostId = postId || (editId ? Number(editId) : undefined);

  // 설정 병합
  const config: FormConfig = useMemo(
    () => ({
      ...DEFAULT_FORM_CONFIG,
      ...userConfig,
    }),
    [userConfig],
  );

  // 상태 관리
  const [formState, formDispatch] = useReducer(formReducer, INITIAL_FORM_STATE);
  const [submissionState, setSubmissionState] = useReducer(
    submissionReducer,
    INITIAL_SUBMISSION_STATE,
  );
  const [initialFormState, setInitialFormState] = useReducer(
    formReducer,
    INITIAL_FORM_STATE,
  );

  // API 훅들
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();

  // 기존 게시글 조회 (수정 모드일 때만)
  const {
    data: existingPost,
    isLoading: loadingPost,
    error: loadError,
  } = useBoardPost(actualPostId || 0);

  // 기존 게시글 데이터로 폼 초기화 (한번만 실행)
  useEffect(() => {
    if (existingPost && isEditMode && formState.title === "") {
      console.log(
        "🔧 [useBoardFormImproved] 기존 게시글 데이터로 폼 초기화 (images 보존)",
      );

      const postData: BoardFormState = {
        title: existingPost.title,
        content: existingPost.content,
        category: existingPost.category,
        images: formState.images, // 🔧 기존 images 보존 (사용자가 업로드한 이미지 유지)
      };

      formDispatch({ type: "SET_FORM", data: postData });
      setInitialFormState({ type: "SET_FORM", data: postData });
    }
  }, [existingPost, isEditMode]); // formState.title 의존성 제거 (무한 루프 방지)

  // Validation 계산
  const validationResult = useMemo(() => {
    return validateForm(formState, config);
  }, [formState, config]);

  // 계산된 값들
  const isDirty = useMemo(() => {
    return isFormDirty(formState, initialFormState);
  }, [formState, initialFormState]);

  const hasUnsaved = useMemo(() => {
    return hasUnsavedChanges(formState, initialFormState);
  }, [formState, initialFormState]);

  const canSubmit = useMemo(() => {
    return canSubmitForm(
      formState,
      validationResult,
      submissionState.isSubmitting,
    );
  }, [formState, validationResult, submissionState.isSubmitting]);

  const isLoading = loadingPost || submissionState.isSubmitting;

  // 이벤트 핸들러들
  const handleFieldChange = useCallback(
    <K extends keyof BoardFormState>(field: K, value: BoardFormState[K]) => {
      formDispatch({ type: "SET_FIELD", field, value });

      // 실시간 검증 (옵션)
      if (submissionState.error) {
        const fieldError = validateFieldRealtime(
          field,
          value as string,
          config,
        );
        if (!fieldError) {
          setSubmissionState({ error: null });
        }
      }
    },
    [submissionState.error, config],
  );

  const handleSubmit = useCallback(async (): Promise<void> => {
    try {
      // 최종 검증
      const validation = validateForm(formState, config);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        throw new Error(firstError || "입력값을 확인해주세요.");
      }

      setSubmissionState({
        isSubmitting: true,
        error: null,
        success: false,
      });

      // UploadedImage는 이미 업로드 완료된 이미지만 포함
      const uploadedImages = formState.images.map((img, index) => ({
        originalName: img.name,
        webPath: img.webPath,
        fileSize: img.size,
        mimeType: img.mimeType,
        displayOrder: index,
      }));

      const submitData: CreatePostRequest = {
        title: formState.title.trim(),
        content: formState.content.trim(),
        category: formState.category,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      };

      let resultPostId: number;

      if (isEditMode && actualPostId) {
        // 수정
        await updatePostMutation.mutateAsync({
          postId: actualPostId,
          data: submitData,
        });
        resultPostId = actualPostId;
      } else {
        // 생성
        const newPost = await createPostMutation.mutateAsync(submitData);
        resultPostId = newPost.id;
      }

      setSubmissionState({
        isSubmitting: false,
        success: true,
      });

      // 🔧 게시글 저장 후 이미지 정보 비우기 (UploadedImage는 서버 URL이므로 메모리 정리 불필요)
      formDispatch({
        type: "SET_FIELD",
        field: "images",
        value: [],
      });

      // 성공 콜백 호출
      onSuccess?.(resultPostId);
    } catch (error) {
      const handledError = handleApiError(error);

      setSubmissionState({
        isSubmitting: false,
        error: handledError.message,
        success: false,
      });

      // 에러 로깅
      logError(handledError, "useBoardFormImproved.handleSubmit");

      // 에러 콜백 호출
      onError?.(handledError);

      // 사용자에게 에러 표시
      showErrorNotification(handledError);
    }
  }, [
    formState,
    config,
    isEditMode,
    actualPostId,
    updatePostMutation,
    createPostMutation,
    onSuccess,
    onError,
  ]);

  const handleCancel = useCallback(() => {
    if (hasUnsaved) {
      const message = isEditMode
        ? "수정 중인 내용이 사라집니다. 정말 취소하시겠습니까?"
        : "작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?";

      if (!confirm(message)) {
        return;
      }
    }

    if (isEditMode && actualPostId) {
      navigate(`/board/${actualPostId}`);
    } else {
      navigate("/board");
    }
  }, [hasUnsaved, isEditMode, actualPostId, navigate]);

  const handleReset = useCallback(() => {
    console.log("🔧 [useBoardFormImproved] handleReset 호출");

    if (isEditMode && existingPost) {
      // 수정 모드일 때는 원본 게시글로 복원 (images는 현재 상태 유지)
      const postData: BoardFormState = {
        title: existingPost.title,
        content: existingPost.content,
        category: existingPost.category,
        images: formState.images, // 🔧 현재 업로드된 images 유지
      };
      formDispatch({ type: "SET_FORM", data: postData });
    } else {
      // 새 글 작성 모드일 때만 완전 초기화
      formDispatch({ type: "RESET_FORM" });
    }

    setSubmissionState(INITIAL_SUBMISSION_STATE);
  }, [isEditMode, existingPost]);

  // 페이지 이탈 방지
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsaved]);

  // 로드 에러 처리
  useEffect(() => {
    if (loadError) {
      const handledError = handleApiError(loadError);
      setSubmissionState({ error: handledError.message });
      logError(handledError, "useBoardFormImproved.loadError");
    }
  }, [loadError]);

  // UploadedImage는 서버 URL을 사용하므로 메모리 정리 불필요

  return {
    // 상태
    formState,
    submissionState,
    validationResult,
    isLoading,

    // 액션
    handlers: {
      onSubmit: handleSubmit,
      onCancel: handleCancel,
      onFieldChange: handleFieldChange,
      onReset: handleReset,
    },

    // 유틸리티
    canSubmit,
    isDirty,
    hasUnsavedChanges: hasUnsaved,
  };
}
