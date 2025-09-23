import type { StudySession } from "../../shared/types";
import { Button, Badge } from "../../../../components/ui";

interface StudyCardProps {
  session: StudySession;
  onStart: () => void;
  onResume: () => void;
}

function formatMinutes(minutes: number) {
  if (!minutes) return "0분";
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes
    ? `${hours}시간 ${remainingMinutes}분`
    : `${hours}시간`;
}

function formatDate(date?: Date | string) {
  if (!date) return "";

  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "";

  return value.toLocaleDateString();
}

export function StudyCard({ session, onStart, onResume }: StudyCardProps) {
  const isCompleted = session.progress >= 100 || Boolean(session.completedAt);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">
            {session.title}
          </h3>
          {isCompleted ? (
            <Badge variant="secondary" className="text-xs">
              완료
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              진행중
            </Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-600 leading-relaxed">
          {session.description}
        </p>
      </div>

      {session.tags && session.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {session.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>학습 시간</span>
          <span>{formatMinutes(session.totalTime)}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500"
            style={{
              width: `${Math.min(Math.max(session.progress, 0), 100)}%`,
            }}
          />
        </div>
        <div className="mt-1 text-right text-[11px] text-gray-500">
          진행률 {Math.min(Math.max(session.progress, 0), 100)}%
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
        <span>
          최근 학습: {formatDate(session.updatedAt || session.createdAt)}
        </span>
        {session.completedAt && (
          <span>완료: {formatDate(session.completedAt)}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          className="flex-1"
          size="sm"
          onClick={isCompleted ? onResume : onStart}
        >
          {isCompleted ? "다시 학습" : "학습 시작"}
        </Button>
        {!isCompleted && (
          <Button variant="outline" size="sm" onClick={onResume}>
            이어서
          </Button>
        )}
      </div>
    </div>
  );
}

export default StudyCard;
