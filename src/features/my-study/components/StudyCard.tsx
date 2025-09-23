import type { StudySession } from '../types';
import { Button } from '../../../components/ui';
import {
  ClockIcon,
  TagIcon,
  PlayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface StudyCardProps {
  session: StudySession;
  onStart?: () => void;
  onResume?: () => void;
}

export function StudyCard({ session, onStart, onResume }: StudyCardProps) {
  const isCompleted = session.progress === 100;
  const isInProgress = session.progress > 0 && session.progress < 100;

  const getCategoryColor = (category: string) => {
    const colors = {
      english: 'bg-blue-100 text-blue-700',
      math: 'bg-green-100 text-green-700',
      conversation: 'bg-purple-100 text-purple-700',
      listening: 'bg-orange-100 text-orange-700',
      grammar: 'bg-red-100 text-red-700',
      vocabulary: 'bg-yellow-100 text-yellow-700',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      english: '🇺🇸',
      math: '🔢',
      conversation: '💬',
      listening: '🎧',
      grammar: '📚',
      vocabulary: '📖',
    };
    return icons[category as keyof typeof icons] || '📝';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getCategoryIcon(session.category)}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(session.category)}`}>
              {session.category}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">{session.title}</h3>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{session.description}</p>
        </div>

        {isCompleted && (
          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
        )}
      </div>

      {/* 진행률 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">진행률</span>
          <span className="text-xs font-medium text-gray-700">{session.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${session.progress}%` }}
          />
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <ClockIcon className="w-3 h-3" />
          <span>{session.totalTime}분</span>
        </div>
        {session.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <TagIcon className="w-3 h-3" />
            <span>{session.tags[0]}</span>
            {session.tags.length > 1 && (
              <span className="text-gray-400">+{session.tags.length - 1}</span>
            )}
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        {isCompleted ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={onStart}
          >
            다시 학습
          </Button>
        ) : isInProgress ? (
          <Button
            variant="default"
            size="sm"
            className="flex-1 text-xs"
            onClick={onResume}
          >
            <PlayIcon className="w-3 h-3 mr-1" />
            이어서 학습
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="flex-1 text-xs"
            onClick={onStart}
          >
            <PlayIcon className="w-3 h-3 mr-1" />
            학습 시작
          </Button>
        )}
      </div>
    </div>
  );
}
