import type { PostCategory } from "./index";

// 폼 모드 정의
export type FormMode = "create" | "edit";

// 폼 상태 인터페이스
export interface BoardFormState {
  title: string;
  content: string;
  category: PostCategory;
}

// 폼 검증 결과
export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof BoardFormState, string>>;
}

// 폼 제출 상태
export interface SubmissionState {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

// 폼 설정
export interface FormConfig {
  maxTitleLength: number;
  maxContentLength: number;
  requiredFields: (keyof BoardFormState)[];
}

// 폼 액션 타입
export type FormAction =
  | {
      type: "SET_FIELD";
      field: keyof BoardFormState;
      value: string | PostCategory;
    }
  | { type: "SET_FORM"; data: BoardFormState }
  | { type: "RESET_FORM" }
  | { type: "SET_SUBMISSION_STATE"; state: Partial<SubmissionState> };

// 폼 이벤트 핸들러 타입
export interface FormEventHandlers {
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  onFieldChange: <K extends keyof BoardFormState>(
    field: K,
    value: BoardFormState[K],
  ) => void;
  onReset: () => void;
}

// 폼 훅 옵션
export interface UseBoardFormOptions {
  mode: FormMode;
  postId?: number;
  onSuccess?: (postId: number) => void;
  onError?: (error: Error) => void;
  config?: Partial<FormConfig>;
}

// 폼 훅 반환값
export interface UseBoardFormReturn {
  // 상태
  formState: BoardFormState;
  submissionState: SubmissionState;
  validationResult: ValidationResult;
  isLoading: boolean;

  // 액션
  handlers: FormEventHandlers;

  // 유틸리티
  canSubmit: boolean;
  isDirty: boolean;
  hasUnsavedChanges: boolean;
}

// 에러 타입 정의
export class FormValidationError extends Error {
  field: keyof BoardFormState;
  code: string;

  constructor(message: string, field: keyof BoardFormState, code: string) {
    super(message);
    this.name = "FormValidationError";
    this.field = field;
    this.code = code;
  }
}

export class FormSubmissionError extends Error {
  statusCode?: number;
  originalError?: unknown;

  constructor(message: string, statusCode?: number, originalError?: unknown) {
    super(message);
    this.name = "FormSubmissionError";
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}
