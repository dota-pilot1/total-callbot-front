import { HeaderAuthControls } from "@/components/layout/HeaderAuthControls";

interface IntervalListeningHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function IntervalListeningHeader({
  title = "인터벌 영어 듣기",
  showBackButton = false,
  onBack,
}: IntervalListeningHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                aria-label="뒤로 가기"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                단계별 속도 조절로 듣기 실력 향상
              </p>
            </div>
          </div>

          <HeaderAuthControls
            showProfile={false}
            showSettings={false}
            size="sm"
          />
        </div>
      </div>
    </header>
  );
}
