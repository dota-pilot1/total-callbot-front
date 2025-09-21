import type { TestRoom } from '../types';
import { Button } from '../../../components/ui';
import {
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface RoomCardProps {
  room: TestRoom;
  onEnter?: (roomId: number) => void;
  onManage?: (roomId: number) => void;
}

const getTestTypeColor = (testType: string) => {
  switch (testType) {
    case 'ENGLISH_CONVERSATION':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ENGLISH_LISTENING':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'ENGLISH_VOCABULARY':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'MATHEMATICS':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function RoomCard({ room, onEnter, onManage }: RoomCardProps) {
  const progressPercentage = Math.round((room.currentParticipants / room.capacity) * 100);

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-foreground truncate">
            {room.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {room.description}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 ml-4">
          {room.isAvailable ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircleIcon className="w-4 h-4" />
              <span className="text-sm font-medium">사용 가능</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600">
              <XCircleIcon className="w-4 h-4" />
              <span className="text-sm font-medium">사용 중</span>
            </div>
          )}
        </div>
      </div>

      {/* Test Type Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${getTestTypeColor(room.testType)}`}>
          {room.testTypeDisplayName}
        </span>
      </div>

      {/* Participants Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <UsersIcon className="w-4 h-4" />
            <span>참가자</span>
          </div>
          <span className="font-medium">
            {room.currentParticipants} / {room.capacity}명
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              progressPercentage >= 90
                ? 'bg-red-500'
                : progressPercentage >= 70
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {progressPercentage}% 사용 중
        </div>
      </div>

      {/* Updated Time */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
        <ClockIcon className="w-3 h-3" />
        <span>
          업데이트: {new Date(room.updatedAt).toLocaleString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {room.isAvailable && onEnter && (
          <Button
            onClick={() => onEnter(room.id)}
            className="flex-1"
          >
            입장하기
          </Button>
        )}

        {onManage && (
          <Button
            variant="outline"
            onClick={() => onManage(room.id)}
            className={room.isAvailable ? 'flex-none' : 'flex-1'}
          >
            관리
          </Button>
        )}

        {!room.isAvailable && !onManage && (
          <Button
            variant="outline"
            disabled
            className="flex-1"
          >
            사용 중
          </Button>
        )}
      </div>
    </div>
  );
}
