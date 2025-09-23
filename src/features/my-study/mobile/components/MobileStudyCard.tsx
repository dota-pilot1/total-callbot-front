import { PlayIcon, ClockIcon } from "@heroicons/react/24/solid";
import { Button } from "../../../../components/ui";
import type { StudySession } from "../../shared/types";

interface MobileStudyCardProps {
  session: StudySession;
  onStart: () => void;
  onResume?: () => void;
}

export function MobileStudyCard({
  session,
  onStart,
  onResume,
}: MobileStudyCardProps) {
  const isCompleted = session.progress === 100;
  const isInProgress = session.progress > 0 && session.progress < 100;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "conversation":
        return "💬";
      case "listening":
        return "🎧";
      case "grammar":
        return "📖";
      case "vocabulary":
        return "📝";
      default:
        return "📚";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "conversation":
        return "회화";
      case "listening":
        return "듣기";
      case "grammar":
        return "문법";
      case "vocabulary":
        return "어휘";
      default:
        return "학습";
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-3">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-lg">{getCategoryIcon(session.category)}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground text-sm line-clamp-1">
              {session.title}
            </h3>
            <span className="text-xs text-muted-foreground">
              {getCategoryLabel(session.category)}
            </span>
          </div>
        </div>

        {/* 진행률 */}
        <div className="text-right flex-shrink-0 ml-2">
          <div className="text-xs font-medium text-foreground">
            {session.progress}%
          </div>
          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden mt-1">
            <div
              className={`h-full transition-all duration-300 ${
                isCompleted
                  ? "bg-green-500"
                  : isInProgress
                    ? "bg-blue-500"
                    : "bg-gray-300"
              }`}
              style={{ width: `${session.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 설명 */}
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {session.description}
      </p>

      {/* 하단 정보 및 버튼 */}
      <div className="flex items-center justify-between pt-2">
        {/* 시간 정보 */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ClockIcon className="h-3 w-3" />
          <span>{session.totalTime}분</span>
        </div>

        {/* 액션 버튼 */}
        <Button
          size="sm"
          onClick={isInProgress && onResume ? onResume : onStart}
          className="h-7 px-3 text-xs"
          variant={isCompleted ? "outline" : "default"}
        >
          <PlayIcon className="h-3 w-3 mr-1" />
          {isCompleted ? "다시하기" : isInProgress ? "계속하기" : "시작하기"}
        </Button>
      </div>

      {/* 태그들 */}
      {session.tags && session.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {session.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {session.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{session.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
