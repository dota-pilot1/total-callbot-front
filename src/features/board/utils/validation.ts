import type {
  BoardFormState,
  ValidationResult,
  FormConfig,
  FormValidationError,
} from "../types/form";
import type { UploadedImage } from "../components/ImageUploader";

// 기본 폼 설정
export const DEFAULT_FORM_CONFIG: FormConfig = {
  maxTitleLength: 200,
  maxContentLength: 2000,
  requiredFields: ["title", "content", "category"],
};

// 개별 필드 validation 함수들
export const validators = {
  title: (value: string, config: FormConfig): string | null => {
    if (!value.trim()) {
      return "제목을 입력해주세요.";
    }
    if (value.length > config.maxTitleLength) {
      return `제목은 ${config.maxTitleLength}자 이내로 입력해주세요.`;
    }
    if (value.trim().length < 2) {
      return "제목은 최소 2자 이상 입력해주세요.";
    }
    return null;
  },

  content: (value: string, config: FormConfig): string | null => {
    if (!value.trim()) {
      return "내용을 입력해주세요.";
    }
    if (value.length > config.maxContentLength) {
      return `내용은 ${config.maxContentLength}자 이내로 입력해주세요.`;
    }
    if (value.trim().length < 10) {
      return "내용은 최소 10자 이상 입력해주세요.";
    }
    return null;
  },

  category: (value: string, _config: FormConfig): string | null => {
    if (!value) {
      return "카테고리를 선택해주세요.";
    }
    return null;
  },

  images: (value: UploadedImage[], _config: FormConfig): string | null => {
    // images는 선택사항이므로 빈 배열도 유효함
    if (!Array.isArray(value)) {
      return null; // 배열이 아닌 경우 무시 (선택사항)
    }

    // 최대 이미지 개수 체크 (일반적으로 5개 제한)
    if (value.length > 5) {
      return "이미지는 최대 5개까지 첨부할 수 있습니다.";
    }

    // UploadedImage는 이미 업로드 완료된 이미지만 포함하므로 추가 검증 불필요
    return null;
  },
} as const;

// 단일 필드 검증 함수
export function validateField(
  field: keyof BoardFormState,
  value: BoardFormState[keyof BoardFormState],
  config: FormConfig = DEFAULT_FORM_CONFIG,
): string | null {
  const validator = validators[field];
  if (!validator) {
    console.warn(`No validator found for field: ${field}`);
    return null;
  }

  return (validator as any)(value, config);
}

// 전체 폼 검증 함수
export function validateForm(
  formState: BoardFormState,
  config: FormConfig = DEFAULT_FORM_CONFIG,
): ValidationResult {
  const errors: Partial<Record<keyof BoardFormState, string>> = {};

  // 각 필드 검증
  (Object.keys(formState) as (keyof BoardFormState)[]).forEach((field) => {
    const error = validateField(field, formState[field], config);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// 실시간 검증용 - 덜 엄격한 검증
export function validateFieldRealtime(
  field: keyof BoardFormState,
  value: BoardFormState[keyof BoardFormState],
  config: FormConfig = DEFAULT_FORM_CONFIG,
): string | null {
  // 문자열 필드의 경우 빈 값에 대해서는 실시간으로 에러 표시하지 않음
  if (typeof value === "string" && !value.trim() && field !== "category") {
    return null;
  }

  // images 필드의 경우 항상 검증
  if (field === "images") {
    return validateField(field, value, config);
  }

  return validateField(field, value, config);
}

// 폼 더티 상태 체크
export function isFormDirty(
  currentState: BoardFormState,
  initialState: BoardFormState,
): boolean {
  return (Object.keys(currentState) as (keyof BoardFormState)[]).some(
    (key) => currentState[key] !== initialState[key],
  );
}

// 폼 변경사항 있는지 체크 (저장되지 않은 변경사항)
export function hasUnsavedChanges(
  currentState: BoardFormState,
  initialState: BoardFormState,
): boolean {
  return (
    isFormDirty(currentState, initialState) &&
    (currentState.title.trim() !== "" || currentState.content.trim() !== "")
  );
}

// 제출 가능 여부 체크
export function canSubmitForm(
  formState: BoardFormState,
  validationResult: ValidationResult,
  isSubmitting: boolean,
): boolean {
  return (
    validationResult.isValid &&
    !isSubmitting &&
    formState.title.trim() !== "" &&
    formState.content.trim() !== ""
  );
}

// 에러 메시지 포맷팅
export function formatValidationError(error: FormValidationError): string {
  return `${error.field}: ${error.message}`;
}

// 여러 에러를 하나의 메시지로 결합
export function combineErrorMessages(
  errors: Partial<Record<keyof BoardFormState, string>>,
): string {
  const messages = Object.values(errors).filter(Boolean);
  return messages.join("\n");
}
