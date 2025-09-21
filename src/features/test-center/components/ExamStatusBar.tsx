import { ClockIcon } from '@heroicons/react/24/outline';
import type { ExamStatus, Participant } from '../types/exam';

interface ExamStatusBarProps {
  examStatus: ExamStatus;
  participants: Participant[];
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

export default function ExamStatusBar({
  examStatus,
  participants,
  timeLeft,
  formatTime
}: ExamStatusBarProps) {
  const completedCount = participants.filter(p => p.status === 'COMPLETED').length;

  return (
    <div className="bg-blue-50 border-b border-blue-200 p-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-900">시험 진행 중</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-blue-800">
            <span>문제 {examStatus.currentQuestion}/{examStatus.totalQuestions}</span>
          </div>

          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-red-600" />
            <span className="text-sm font-bold text-red-600">
              {formatTime(timeLeft)} 남음
            </span>
          </div>
        </div>

        <div className="text-sm text-blue-700">
          {completedCount}/{participants.length}명 완료
        </div>
      </div>
    </div>
  );
}
