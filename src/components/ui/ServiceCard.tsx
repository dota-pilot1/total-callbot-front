import React from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface ServiceCardProps {
  id: string;
  title: string;
  iconElement: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

export function ServiceCard({
  id,
  title,
  iconElement,
  isSelected,
  onSelect,
  className = "",
}: ServiceCardProps) {
  return (
    <button
      id={id}
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
          : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
      } ${className}`}
    >
      {isSelected && (
        <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
      )}

      {/* 아이콘 컨테이너 - 고정 크기 */}
      <div className="h-12 w-12 rounded-lg flex items-center justify-center mb-2">
        {iconElement}
      </div>

      {/* 텍스트 - 고정 높이와 정렬 */}
      <div className="h-8 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-700 text-center leading-tight">
          {title}
        </span>
      </div>
    </button>
  );
}
