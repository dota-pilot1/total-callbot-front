import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useTranslationStore } from "../stores/useTranslationStore";

export default function TranslationSlidePanel() {
  const { isVisible, isLoading, originalText, translatedText, toggleVisible } =
    useTranslationStore();

  // 표시할 내용이 없으면 렌더링하지 않음
  if (!originalText && !isLoading) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 bg-blue-50 border-b border-blue-200 shadow-sm transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm text-blue-700">번역 중...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    영어
                  </span>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {originalText}
                  </p>
                </div>
                {translatedText && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                      한글
                    </span>
                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                      {translatedText}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 토글 버튼 */}
          <button
            onClick={toggleVisible}
            className="ml-3 p-1 text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
            title={isVisible ? "번역 숨기기" : "번역 보기"}
          >
            {isVisible ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
