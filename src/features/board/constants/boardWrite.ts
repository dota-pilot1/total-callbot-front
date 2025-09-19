import type { PostCategory } from "../types";

// Category options for post creation/editing
export const CATEGORY_OPTIONS: Array<{ value: PostCategory; label: string }> = [
  { value: "QNA", label: "질문/답변" },
  { value: "FREE", label: "자유게시판" },
  { value: "REVIEW", label: "학습후기" },
  { value: "FEEDBACK", label: "건의사항" },
];

// Form validation limits
export const FORM_LIMITS = {
  TITLE_MAX_LENGTH: 200,
  CONTENT_MAX_LENGTH: 2000,
} as const;

// UI text constants
export const UI_TEXT = {
  CREATE_MODE: {
    PAGE_TITLE: "게시판 - 글쓰기",
    FORM_TITLE: "게시글 작성",
    CARD_TITLE: "새 게시글",
    SUBMIT_BUTTON: "게시글 작성",
    SUBMIT_LOADING: "작성 중...",
    BACK_BUTTON: "목록으로",
    SUCCESS_MESSAGE: "게시글이 성공적으로 작성되었습니다.",
    ERROR_MESSAGE: "게시글 작성에 실패했습니다.",
    CANCEL_CONFIRM: "작성 중인 내용이 사라집니다. 정말 취소하시겠습니까?",
  },
  EDIT_MODE: {
    PAGE_TITLE: "게시판 - 수정",
    FORM_TITLE: "게시글 수정",
    CARD_TITLE: "게시글 수정",
    SUBMIT_BUTTON: "수정 완료",
    SUBMIT_LOADING: "수정 중...",
    BACK_BUTTON: "게시글로",
    SUCCESS_MESSAGE: "게시글이 성공적으로 수정되었습니다.",
    ERROR_MESSAGE: "게시글 수정에 실패했습니다.",
    CANCEL_CONFIRM: "수정 중인 내용이 사라집니다. 정말 취소하시겠습니까?",
  },
  COMMON: {
    TITLE_PLACEHOLDER: "게시글 제목을 입력하세요",
    CONTENT_PLACEHOLDER: "게시글 내용을 입력하세요",
    CATEGORY_LABEL: "카테고리",
    TITLE_LABEL: "제목",
    CONTENT_LABEL: "내용",
    CANCEL_BUTTON: "취소",
    REQUIRED_MARK: "*",
  },
} as const;

// Writing guide content
export const WRITING_GUIDE = {
  title: "📝 작성 가이드",
  tips: [
    "다른 사용자를 존중하는 언어를 사용해주세요",
    "학습과 관련된 유익한 정보를 공유해주세요",
    "개인정보나 부적절한 내용은 피해주세요",
    "질문글인 경우 구체적으로 작성하면 더 좋은 답변을 받을 수 있어요",
    "제목은 내용을 잘 표현할 수 있도록 작성해주세요",
  ],
} as const;
