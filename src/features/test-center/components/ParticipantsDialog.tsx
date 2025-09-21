import FullScreenSlideDialog from '../../../components/ui/FullScreenSlideDialog';
import { TrophyIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { Participant, ExamStatus } from '../types/exam';

interface ParticipantsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  examStatus: ExamStatus;
  roomInfo?: {
    testTypeDisplayName: string;
    capacity?: number;
    currentParticipants?: number;
  };
}

export default function ParticipantsDialog({
  isOpen,
  onClose,
  participants,
  examStatus,
  roomInfo
}: ParticipantsDialogProps) {

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

  const averageProgress = Math.round(
    (participants.reduce((sum, p) => sum + p.progress, 0) / participants.length / examStatus.totalQuestions) * 100
  );

  return (
    <FullScreenSlideDialog
      isOpen={isOpen}
      onClose={onClose}
      title="참가자 현황"
      showCloseButton={true}
    >
      <div className="h-full flex flex-col">
        {/* Summary Stats */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{participants.length}</div>
              <div className="text-sm text-blue-700">총 참가자</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{averageProgress}%</div>
              <div className="text-sm text-green-600">평균 진행률</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">완료:</span>
              <span className="font-medium text-green-600">
                {participants.filter(p => p.status === 'COMPLETED').length}명
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">진행 중:</span>
              <span className="font-medium text-blue-600">
                {participants.filter(p => ['ANSWERING', 'THINKING'].includes(p.status)).length}명
              </span>
            </div>
          </div>
        </div>

        {/* Ranking Title */}
        <div className="flex items-center gap-2 mb-4">
          <TrophyIcon className="w-6 h-6 text-yellow-600" />
          <h2 className="text-lg font-semibold text-gray-900">실시간 순위</h2>
        </div>

        {/* Participants List */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          {sortedParticipants.map((participant, index) => (
            <div
              key={participant.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Top Row - Rank, Name, Score */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeStyle(index)}`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {participant.name}
                      </span>
                      {participant.isHost && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                          방장
                        </span>
                      )}
                      {index === 0 && participant.currentScore > 0 && (
                        <span className="text-lg">👑</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {participant.progress}/{examStatus.totalQuestions} 문제 완료
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {participant.currentScore}
                  </div>
                  <div className="text-sm text-gray-600">점</div>
                </div>
              </div>

              {/* Bottom Row - Status and Progress Bar */}
              <div className="flex items-center justify-between">
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(participant.status)}`}>
                  {getStatusText(participant.status)}
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        participant.status === 'COMPLETED' ? 'bg-green-500' :
                        participant.status === 'ANSWERING' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${(participant.progress / examStatus.totalQuestions) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-10 text-center">
                    {Math.round((participant.progress / examStatus.totalQuestions) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Room Info Footer */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            시험 정보
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">시험 유형:</span>
                <span className="font-medium">{roomInfo?.testTypeDisplayName || '일반'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">총 문제:</span>
                <span className="font-medium">{examStatus.totalQuestions}문제</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">참가자:</span>
                <span className="font-medium">
                  {roomInfo?.currentParticipants || participants.length}
                  {roomInfo?.capacity && `/${roomInfo.capacity}`}명
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">시작 시간:</span>
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
      </div>
    </FullScreenSlideDialog>
  );
}
