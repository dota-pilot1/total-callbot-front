import {
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import type { StudyStats } from "../../shared/types";

interface StudyProgressProps {
  stats: StudyStats;
}

function formatTotalTime(totalMinutes: number) {
  if (!totalMinutes) {
    return "0분";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) {
    return `${minutes}분`;
  }

  return minutes ? `${hours}시간 ${minutes}분` : `${hours}시간`;
}

export function StudyProgress({ stats }: StudyProgressProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">학습 현황</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <ClockIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-gray-900">
            {formatTotalTime(stats.totalTime)}
          </div>
          <div className="text-xs text-gray-500">총 학습 시간</div>
        </div>

        <div className="text-center">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <FireIcon className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-lg font-bold text-gray-900">
            {stats.streakDays}일
          </div>
          <div className="text-xs text-gray-500">연속 학습일</div>
        </div>

        <div className="text-center">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <TrophyIcon className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-lg font-bold text-gray-900">
            {stats.averageScore.toFixed(1)}점
          </div>
          <div className="text-xs text-gray-500">평균 점수</div>
        </div>

        <div className="text-center">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <ChartBarIcon className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-lg font-bold text-gray-900">
            {stats.completedToday}개
          </div>
          <div className="text-xs text-gray-500">오늘 완료</div>
        </div>
      </div>
    </div>
  );
}

export default StudyProgress;
