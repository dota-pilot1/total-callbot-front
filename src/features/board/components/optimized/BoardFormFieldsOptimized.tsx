import React, { memo, useCallback } from "react";
import type { BoardFormState, ValidationResult } from "../../types/form";
import type { PostCategory } from "../../types";
import { LexicalEditor } from "../editor/LexicalEditor";
import ImageUploader, { type UploadedImage } from "../ImageUploader";

interface BoardFormFieldsOptimizedProps {
  formState: BoardFormState;
  validationResult: ValidationResult;
  isLoading: boolean;
  onFieldChange: <K extends keyof BoardFormState>(
    field: K,
    value: BoardFormState[K],
  ) => void;
  imageResetTrigger?: number;
}

// 카테고리 옵션들 - 메모이제이션을 위해 컴포넌트 외부에 정의
const CATEGORY_OPTIONS: {
  value: PostCategory;
  label: string;
  description: string;
}[] = [
  { value: "NOTICE", label: "공지사항", description: "중요한 공지사항" },
  { value: "QNA", label: "질문과 답변", description: "궁금한 점을 물어보세요" },
  { value: "FREE", label: "자유게시판", description: "자유롭게 이야기해요" },
  { value: "REVIEW", label: "학습 후기", description: "학습 경험을 공유해요" },
  {
    value: "FEEDBACK",
    label: "건의사항",
    description: "개선 사항을 제안해주세요",
  },
];

// 개별 필드 컴포넌트들을 메모이제이션
const TitleField = memo(
  ({
    value,
    error,
    isLoading,
    onChange,
  }: {
    value: string;
    error?: string;
    isLoading: boolean;
    onChange: (value: string) => void;
  }) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
      },
      [onChange],
    );

    return (
      <div className="space-y-1">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={value}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="제목을 입력해주세요"
          className={`
          w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? "border-red-300" : "border-gray-300"}
        `}
          maxLength={200}
          autoComplete="off"
        />
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <p className="text-xs text-gray-500">{value.length}/200자</p>
      </div>
    );
  },
);

const CategoryField = memo(
  ({
    value,
    error,
    isLoading,
    onChange,
  }: {
    value: PostCategory;
    error?: string;
    isLoading: boolean;
    onChange: (value: PostCategory) => void;
  }) => {
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value as PostCategory);
      },
      [onChange],
    );

    return (
      <div className="space-y-1">
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          카테고리 <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          value={value}
          onChange={handleChange}
          disabled={isLoading}
          className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? "border-red-300" : "border-gray-300"}
        `}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

const ContentField = memo(
  ({
    value,
    error,
    isLoading,
    onChange,
  }: {
    value: string;
    error?: string;
    isLoading: boolean;
    onChange: (value: string) => void;
  }) => {
    const handleChange = useCallback(
      (newValue: string) => {
        onChange(newValue);
      },
      [onChange],
    );

    // HTML을 텍스트로 변환하여 글자 수 계산
    const getTextLength = useCallback((htmlContent: string) => {
      if (!htmlContent) return 0;
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, "text/html");
      return doc.body.textContent?.length || 0;
    }, []);

    const textLength = getTextLength(value);

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          내용 <span className="text-red-500">*</span>
        </label>

        <LexicalEditor
          value={value}
          onChange={handleChange}
          placeholder="내용을 입력해주세요. 굵기, 기울임, 리스트 등을 사용할 수 있습니다."
          error={error}
          disabled={isLoading}
        />

        <div className="flex justify-between text-xs text-gray-500">
          <span>서식 기능: 굵기(Ctrl+B), 기울임(Ctrl+I), 밑줄(Ctrl+U)</span>
          <span>{textLength}/2000자</span>
        </div>
      </div>
    );
  },
);

const ImageField = memo(
  ({ isLoading, onChange, resetTrigger }: {
    images: UploadedImage[];
    error?: string;
    isLoading: boolean;
    onChange: (images: UploadedImage[]) => void;
    resetTrigger?: number;
  }) => {
    return (
      <ImageUploader
        onImagesChange={onChange}
        disabled={isLoading}
        maxImages={3}
        maxSizePerImage={5 * 1024 * 1024} // 5MB
        resetTrigger={resetTrigger}
      />
    );
  },
);

// 메인 컴포넌트
export const BoardFormFieldsOptimized = memo<BoardFormFieldsOptimizedProps>(
  ({
    formState,
    validationResult,
    isLoading,
    onFieldChange,
    imageResetTrigger,
  }) => {
    // 각 필드별 onChange 핸들러를 메모이제이션
    const handleTitleChange = useCallback(
      (value: string) => {
        onFieldChange("title", value);
      },
      [onFieldChange],
    );

    const handleCategoryChange = useCallback(
      (value: PostCategory) => {
        onFieldChange("category", value);
      },
      [onFieldChange],
    );

    const handleContentChange = useCallback(
      (value: string) => {
        onFieldChange("content", value);
      },
      [onFieldChange],
    );

    const handleImagesChange = useCallback(
      (images: UploadedImage[]) => {
        onFieldChange("images", images);
      },
      [onFieldChange],
    );

    return (
      <div className="space-y-6">
        <TitleField
          value={formState.title}
          error={validationResult.errors.title}
          isLoading={isLoading}
          onChange={handleTitleChange}
        />

        <CategoryField
          value={formState.category}
          error={validationResult.errors.category}
          isLoading={isLoading}
          onChange={handleCategoryChange}
        />

        <ContentField
          value={formState.content}
          error={validationResult.errors.content}
          isLoading={isLoading}
          onChange={handleContentChange}
        />

        <ImageField
          images={formState.images}
          error={validationResult.errors.images}
          isLoading={isLoading}
          onChange={handleImagesChange}
          resetTrigger={imageResetTrigger}
        />
      </div>
    );
  },
);

BoardFormFieldsOptimized.displayName = "BoardFormFieldsOptimized";
TitleField.displayName = "TitleField";
CategoryField.displayName = "CategoryField";
ContentField.displayName = "ContentField";
ImageField.displayName = "ImageField";
