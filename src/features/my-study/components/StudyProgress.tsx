import type { StudyStats } from '../types';
import {
  ClockIcon,
  FireIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface StudyProgressProps {
  stats: StudyStats;
}

export function StudyProgress({ stats }: StudyProgressProps) {
  const statItems = [
    {
      label: '총 학습 시간',
      value: `${Math.floor(stats.totalTime / 60)}시간 ${stats.totalTime % 60}분`,
      icon: ClockIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: '연속 학습일',
      value: `${stats.streakDays}일`,
      icon: FireIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: '평균 점수',
      value: `${stats.averageScore.toFixed(1)}점`,
      icon: TrophyIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: '오늘 완료',
      value: `${stats.completedToday}개`,
      icon: ChartBarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">학습 현황</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={index} className="text-center">
              <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="text-lg font-bold text-gray-900">{item.value}</div>
              <div className="text-xs text-gray-500">{item.label}</div>
            </div>
          );
        })}
      </div>

      {/* 주간 목표 진행률 */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">이번 주 목표</span>
          <span className="text-sm text-gray-500">10시간 중 {Math.floor(stats.totalTime / 60)}시간</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min((stats.totalTime / 600) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
