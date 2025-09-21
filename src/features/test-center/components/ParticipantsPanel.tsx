import { TrophyIcon } from '@heroicons/react/24/outline';
import type { Participant, ExamStatus } from '../types/exam';

interface ParticipantsPanelProps {
  participants: Participant[];
  examStatus: ExamStatus;
  roomInfo?: {
    testTypeDisplayName: string;
    capacity?: number;
    currentParticipants?: number;
  };
}

export default function ParticipantsPanel({
  participants,
  examStatus,
  roomInfo
}: ParticipantsPanelProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'ANSWERING': return 'text-blue-600 bg-blue-100';
      case 'THINKING': return 'text-yellow-600 bg-yellow-100';
      case 'WAITING': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return '완료';
      case 'ANSWERING': return '답안 작성 중';
      case 'THINKING': return '문제 확인 중';
      case 'WAITING': return '대기 중';
      default: return '대기 중';
    }
  };

  const getRankBadgeStyle = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-500 text-white'; // 1등 - 금색
      case 1: return 'bg-gray-400 text-white';   // 2등 - 은색
      case 2: return 'bg-orange-400 text-white'; // 3등 - 동색
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    // 점수 우선, 진행도 보조
    if (b.currentScore !== a.currentScore) {
      return b.currentScore - a.currentScore;
    }
    return b.progress - a.progress;
  });

  return (
    <div className="w-80 lg:w-1/5 min-w-[280px] bg-gray-50 border-l-2 border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <TrophyIcon className="w-5 h-5 text-yellow-600" />
          <h3 className="font-semibold text-gray-900">실시간 순위</h3>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <div>{participants.length}명 참가 중</div>
          <div className="text-xs">
            평균 진행률: {Math.round((participants.reduce((sum, p) => sum + p.progress, 0) / participants.length / examStatus.totalQuestions) * 100)}%
          </div>
        </div>
      </div>

      {/* Participants Ranking */}
      <div className="flex-1 overflow-y-auto">
        {sortedParticipants.map((participant, index) => (
          <div
            key={participant.id}
            className={`p-4 border-b border-gray-200 transition-colors ${
              index === 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white hover:bg-gray-50'
            }`}
          >
            {/* Participant Info */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadgeStyle(index)}`}>
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {participant.name}
                    </span>
                    {participant.isHost && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded flex-shrink-0">
                        방장
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    {participant.progress}/{examStatus.totalQuestions} 문제
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {participant.currentScore}점
                </div>
                {index === 0 && participant.currentScore > 0 && (
                  <div className="text-xs text-yellow-600">👑 1위</div>
                )}
              </div>
            </div>

            {/* Status and Progress */}
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(participant.status)}`}>
                {getStatusText(participant.status)}
              </span>

              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      participant.status === 'COMPLETED' ? 'bg-green-500' :
                      participant.status === 'ANSWERING' ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${(participant.progress / examStatus.totalQuestions) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-center">
                  {Math.round((participant.progress / examStatus.totalQuestions) * 100)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Room Info Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="text-xs text-gray-600 space-y-2">
          <div className="font-medium text-gray-800 mb-2">시험 정보</div>
          <div className="flex justify-between">
            <span>시험 유형:</span>
            <span className="font-medium">{roomInfo?.testTypeDisplayName || '일반'}</span>
          </div>
          <div className="flex justify-between">
            <span>총 문제:</span>
            <span className="font-medium">{examStatus.totalQuestions}문제</span>
          </div>
          <div className="flex justify-between">
            <span>참가자:</span>
            <span className="font-medium">
              {roomInfo?.currentParticipants || participants.length}
              {roomInfo?.capacity && `/${roomInfo.capacity}`}명
            </span>
          </div>
          <div className="flex justify-between">
            <span>시작 시간:</span>
            <span className="font-medium">
              {new Date(examStatus.startedAt).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
