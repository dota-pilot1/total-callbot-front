import { useReducer, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreatePost, useUpdatePost, useBoardPost } from './index';
import {
  validateForm,
  validateFieldRealtime,
  isFormDirty,
  hasUnsavedChanges,
  canSubmitForm,
  DEFAULT_FORM_CONFIG
} from '../utils/validation';
import { handleApiError, logError, showErrorNotification } from '../utils/errorHandler';
import type {
  BoardFormState,
  FormAction,
  SubmissionState,
  UseBoardFormOptions,
  UseBoardFormReturn,
  FormConfig
} from '../types/form';
import type { CreatePostRequest } from '../types';

// 초기 폼 상태
const INITIAL_FORM_STATE: BoardFormState = {
  title: '',
  content: '',
  category: 'FREE',
};

// 초기 제출 상태
const INITIAL_SUBMISSION_STATE: SubmissionState = {
  isSubmitting: false,
  error: null,
  success: false,
};

// 폼 상태 관리 리듀서
function formReducer(state: BoardFormState, action: FormAction): BoardFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };

    case 'SET_FORM':
      return {
        ...action.data,
      };

    case 'RESET_FORM':
      return INITIAL_FORM_STATE;

    default:
      return state;
  }
}

// 제출 상태 관리 리듀서
function submissionReducer(state: SubmissionState, action: Partial<SubmissionState>): SubmissionState {
  return {
    ...state,
    ...action,
  };
}

export function useBoardFormImproved(options: UseBoardFormOptions): UseBoardFormReturn {
  const { mode, postId, onSuccess, onError, config: userConfig } = options;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = mode === 'edit' || !!editId;
  const actualPostId = postId || (editId ? Number(editId) : undefined);

  // 설정 병합
  const config: FormConfig = useMemo(() => ({
    ...DEFAULT_FORM_CONFIG,
    ...userConfig,
  }), [userConfig]);

  // 상태 관리
  const [formState, formDispatch] = useReducer(formReducer, INITIAL_FORM_STATE);
  const [submissionState, setSubmissionState] = useReducer(submissionReducer, INITIAL_SUBMISSION_STATE);
  const [initialFormState, setInitialFormState] = useReducer(formReducer, INITIAL_FORM_STATE);

  // API 훅들
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();

  // 기존 게시글 조회 (수정 모드일 때만)
  const {
    data: existingPost,
    isLoading: loadingPost,
    error: loadError
  } = useBoardPost(actualPostId || 0);

  // 기존 게시글 데이터로 폼 초기화
  useEffect(() => {
    if (existingPost && isEditMode) {
      const postData: BoardFormState = {
        title: existingPost.title,
        content: existingPost.content,
        category: existingPost.category,
      };

      formDispatch({ type: 'SET_FORM', data: postData });
      setInitialFormState({ type: 'SET_FORM', data: postData });
    }
  }, [existingPost, isEditMode]);

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
    return canSubmitForm(formState, validationResult, submissionState.isSubmitting);
  }, [formState, validationResult, submissionState.isSubmitting]);

  const isLoading = loadingPost || submissionState.isSubmitting;

  // 이벤트 핸들러들
  const handleFieldChange = useCallback(<K extends keyof BoardFormState>(
    field: K,
    value: BoardFormState[K]
  ) => {
    formDispatch({ type: 'SET_FIELD', field, value });

    // 실시간 검증 (옵션)
    if (submissionState.error) {
      const fieldError = validateFieldRealtime(field, value as string, config);
      if (!fieldError) {
        setSubmissionState({ error: null });
      }
    }
  }, [submissionState.error, config]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    try {
      // 최종 검증
      const validation = validateForm(formState, config);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        throw new Error(firstError || '입력값을 확인해주세요.');
      }

      setSubmissionState({
        isSubmitting: true,
        error: null,
        success: false
      });

      const submitData: CreatePostRequest = {
        title: formState.title.trim(),
        content: formState.content.trim(),
        category: formState.category,
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
        success: true
      });

      // 성공 콜백 호출
      onSuccess?.(resultPostId);

    } catch (error) {
      const handledError = handleApiError(error);

      setSubmissionState({
        isSubmitting: false,
        error: handledError.message,
        success: false
      });

      // 에러 로깅
      logError(handledError, 'useBoardFormImproved.handleSubmit');

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
    onError
  ]);

  const handleCancel = useCallback(() => {
    if (hasUnsaved) {
      const message = isEditMode
        ? '수정 중인 내용이 사라집니다. 정말 취소하시겠습니까?'
        : '작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?';

      if (!confirm(message)) {
        return;
      }
    }

    if (isEditMode && actualPostId) {
      navigate(`/board/${actualPostId}`);
    } else {
      navigate('/board');
    }
  }, [hasUnsaved, isEditMode, actualPostId, navigate]);

  const handleReset = useCallback(() => {
    if (isEditMode && existingPost) {
      const postData: BoardFormState = {
        title: existingPost.title,
        content: existingPost.content,
        category: existingPost.category,
      };
      formDispatch({ type: 'SET_FORM', data: postData });
    } else {
      formDispatch({ type: 'RESET_FORM' });
    }

    setSubmissionState(INITIAL_SUBMISSION_STATE);
  }, [isEditMode, existingPost]);

  // 페이지 이탈 방지
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsaved]);

  // 로드 에러 처리
  useEffect(() => {
    if (loadError) {
      const handledError = handleApiError(loadError);
      setSubmissionState({ error: handledError.message });
      logError(handledError, 'useBoardFormImproved.loadError');
    }
  }, [loadError]);

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
