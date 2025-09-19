import { FormSubmissionError, FormValidationError } from "../types/form";

// 에러 코드 정의
export const ERROR_CODES = {
  // Validation 에러
  VALIDATION_REQUIRED_FIELD: "VALIDATION_REQUIRED_FIELD",
  VALIDATION_TOO_LONG: "VALIDATION_TOO_LONG",
  VALIDATION_TOO_SHORT: "VALIDATION_TOO_SHORT",
  VALIDATION_INVALID_FORMAT: "VALIDATION_INVALID_FORMAT",

  // Network 에러
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",

  // API 에러
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  SERVER_ERROR: "SERVER_ERROR",

  // 비즈니스 로직 에러
  POST_NOT_FOUND: "POST_NOT_FOUND",
  POST_ALREADY_DELETED: "POST_ALREADY_DELETED",
  INSUFFICIENT_PERMISSION: "INSUFFICIENT_PERMISSION",

  // 알 수 없는 에러
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// 사용자 친화적 에러 메시지 매핑
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Validation 에러
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: "필수 항목을 입력해주세요.",
  [ERROR_CODES.VALIDATION_TOO_LONG]: "입력한 내용이 너무 깁니다.",
  [ERROR_CODES.VALIDATION_TOO_SHORT]: "입력한 내용이 너무 짧습니다.",
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: "올바른 형식으로 입력해주세요.",

  // Network 에러
  [ERROR_CODES.NETWORK_ERROR]: "네트워크 연결을 확인해주세요.",
  [ERROR_CODES.TIMEOUT_ERROR]: "요청 시간이 초과되었습니다. 다시 시도해주세요.",

  // API 에러
  [ERROR_CODES.UNAUTHORIZED]: "로그인이 필요합니다.",
  [ERROR_CODES.FORBIDDEN]: "접근 권한이 없습니다.",
  [ERROR_CODES.NOT_FOUND]: "요청한 내용을 찾을 수 없습니다.",
  [ERROR_CODES.CONFLICT]: "이미 존재하는 내용입니다.",
  [ERROR_CODES.SERVER_ERROR]:
    "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",

  // 비즈니스 로직 에러
  [ERROR_CODES.POST_NOT_FOUND]: "게시글을 찾을 수 없습니다.",
  [ERROR_CODES.POST_ALREADY_DELETED]: "이미 삭제된 게시글입니다.",
  [ERROR_CODES.INSUFFICIENT_PERMISSION]: "이 작업을 수행할 권한이 없습니다.",

  // 알 수 없는 에러
  [ERROR_CODES.UNKNOWN_ERROR]: "알 수 없는 오류가 발생했습니다.",
};

// HTTP 상태 코드에서 에러 코드로 매핑
function mapHttpStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    case 409:
      return ERROR_CODES.CONFLICT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_CODES.SERVER_ERROR;
    default:
      return ERROR_CODES.UNKNOWN_ERROR;
  }
}

// API 에러 처리
export function handleApiError(error: unknown): FormSubmissionError {
  // 네트워크 에러
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return new FormSubmissionError(
      ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      undefined,
      error,
    );
  }

  // HTTP 에러
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as any).status;
    const errorCode = mapHttpStatusToErrorCode(status);

    return new FormSubmissionError(ERROR_MESSAGES[errorCode], status, error);
  }

  // TanStack Query 에러
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as any).message;

    // 특정 비즈니스 로직 에러 처리
    if (message.includes("Post not found")) {
      return new FormSubmissionError(
        ERROR_MESSAGES[ERROR_CODES.POST_NOT_FOUND],
        404,
        error,
      );
    }

    if (message.includes("Permission denied")) {
      return new FormSubmissionError(
        ERROR_MESSAGES[ERROR_CODES.INSUFFICIENT_PERMISSION],
        403,
        error,
      );
    }
  }

  // 기본 에러
  return new FormSubmissionError(
    ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    undefined,
    error,
  );
}

// Validation 에러 생성
export function createValidationError(
  field: keyof import("../types/form").BoardFormState,
  message: string,
  code: ErrorCode = ERROR_CODES.VALIDATION_INVALID_FORMAT,
): FormValidationError {
  return new FormValidationError(message, field, code);
}

// 에러 로깅 (개발 환경에서만)
export function logError(error: Error, context?: string): void {
  if (import.meta.env.DEV) {
    console.group(`🚨 Error${context ? ` in ${context}` : ""}`);
    console.error("Error:", error);
    console.error("Stack:", error.stack);
    if (error instanceof FormSubmissionError && error.originalError) {
      console.error("Original Error:", error.originalError);
    }
    console.groupEnd();
  }
}

// 에러 복구 전략
export interface ErrorRecoveryStrategy {
  canRecover: boolean;
  action?: () => void;
  message?: string;
}

export function getErrorRecoveryStrategy(
  error: FormSubmissionError,
): ErrorRecoveryStrategy {
  switch (error.statusCode) {
    case 401:
      return {
        canRecover: true,
        action: () => {
          // 로그인 페이지로 리다이렉트
          window.location.href = "/login";
        },
        message: "로그인 페이지로 이동합니다.",
      };

    case 403:
      return {
        canRecover: true,
        action: () => {
          // 이전 페이지로 돌아가기
          window.history.back();
        },
        message: "이전 페이지로 돌아갑니다.",
      };

    case 404:
      return {
        canRecover: true,
        action: () => {
          // 게시판 목록으로 이동
          window.location.href = "/board";
        },
        message: "게시판 목록으로 이동합니다.",
      };

    case 500:
    case 502:
    case 503:
    case 504:
      return {
        canRecover: true,
        message: "잠시 후 다시 시도해주세요.",
      };

    default:
      return {
        canRecover: false,
      };
  }
}

// 에러 알림 표시
export function showErrorNotification(error: FormSubmissionError): void {
  const recovery = getErrorRecoveryStrategy(error);

  let message = error.message;
  if (recovery.canRecover && recovery.message) {
    message += `\n${recovery.message}`;
  }

  // 여기서는 간단히 alert을 사용하지만, 실제로는 toast 라이브러리 사용
  alert(message);

  if (recovery.canRecover && recovery.action) {
    setTimeout(recovery.action, 2000); // 2초 후 복구 액션 실행
  }
}
