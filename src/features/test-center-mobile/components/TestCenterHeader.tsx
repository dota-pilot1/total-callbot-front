import { HeaderAuthControls } from "@/components/layout/HeaderAuthControls";
import { Button } from "../../../components/ui";

interface TestCenterHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  showQuestionManagementButton?: boolean;
  showParticipantsButton?: boolean;
  participantCount?: number;
  onlineCount?: number;
  onQuestionManagement?: () => void;
  onParticipantsClick?: () => void;
}

export function TestCenterHeader({
  title = "테스트 센터",
  showBackButton = false,
  onBack,
  showQuestionManagementButton = false,
  showParticipantsButton = false,
  participantCount,
  onlineCount,
  onQuestionManagement,
  onParticipantsClick,
}: TestCenterHeaderProps) {
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
                실시간 문제 풀이 및 토론
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {typeof participantCount === "number" && (
              <div className="text-xs text-gray-500 hidden sm:block">
                참여 {onlineCount ?? 0}/{participantCount}
              </div>
            )}

            {showQuestionManagementButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={onQuestionManagement}
              >
                문제 관리
              </Button>
            )}

            {showParticipantsButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={onParticipantsClick}
              >
                참여자
              </Button>
            )}

            <HeaderAuthControls
              showProfile={false}
              showSettings={false}
              size="sm"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default TestCenterHeader;
