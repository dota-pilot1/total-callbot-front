import type { PostCategory } from '../types';
import { CATEGORY_OPTIONS, FORM_LIMITS, UI_TEXT } from '../constants/boardWrite';

interface BoardFormFieldsProps {
  title: string;
  content: string;
  category: PostCategory;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onCategoryChange: (value: PostCategory) => void;
  disabled?: boolean;
}

export default function BoardFormFields({
  title,
  content,
  category,
  onTitleChange,
  onContentChange,
  onCategoryChange,
  disabled = false,
}: BoardFormFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {UI_TEXT.COMMON.CATEGORY_LABEL} <span className="text-red-500">{UI_TEXT.COMMON.REQUIRED_MARK}</span>
        </label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as PostCategory)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {UI_TEXT.COMMON.TITLE_LABEL} <span className="text-red-500">{UI_TEXT.COMMON.REQUIRED_MARK}</span>
        </label>
        <input
          type="text"
          placeholder={UI_TEXT.COMMON.TITLE_PLACEHOLDER}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={FORM_LIMITS.TITLE_MAX_LENGTH}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        />
        <div className="text-xs text-gray-500 text-right">
          {title.length}/{FORM_LIMITS.TITLE_MAX_LENGTH}
        </div>
      </div>

      {/* Content Textarea */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {UI_TEXT.COMMON.CONTENT_LABEL} <span className="text-red-500">{UI_TEXT.COMMON.REQUIRED_MARK}</span>
        </label>
        <textarea
          placeholder={UI_TEXT.COMMON.CONTENT_PLACEHOLDER}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          rows={15}
          maxLength={FORM_LIMITS.CONTENT_MAX_LENGTH}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
        />
        <div className="text-xs text-gray-500 text-right">
          {content.length}/{FORM_LIMITS.CONTENT_MAX_LENGTH}
        </div>
      </div>
    </div>
  );
}
