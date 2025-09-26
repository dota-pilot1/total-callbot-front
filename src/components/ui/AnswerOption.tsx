import React from "react";
import { cn } from "../../lib/utils";

interface AnswerOptionProps {
  optionKey: string;
  children: React.ReactNode;
  selected?: boolean;
  correct?: boolean;
  incorrect?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * 표준화된 답변 옵션 컴포넌트 - 일관된 스타일과 상태 관리
 */
export function AnswerOption({
  optionKey,
  children,
  selected = false,
  correct = false,
  incorrect = false,
  disabled = false,
  onClick,
  className,
}: AnswerOptionProps) {
  const getStateStyles = () => {
    if (disabled) {
      if (correct) {
        return "bg-green-50 border-green-200 text-green-700";
      }
      if (incorrect) {
        return "bg-red-50 border-red-200 text-red-700";
      }
      return "opacity-60";
    }

    if (selected) {
      return "border-primary bg-primary/5";
    }

    return "border-border";
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full p-4 text-left rounded-lg border-2 transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed",
        getStateStyles(),
        className
      )}
    >
      <div className="flex items-start gap-4">
        <span className="flex-shrink-0 w-7 h-7 rounded-full border border-current flex items-center justify-center text-sm font-medium mt-0.5">
          {optionKey}
        </span>
        <span className="flex-1 leading-relaxed text-base">
          {children}
        </span>
      </div>
    </button>
  );
}
