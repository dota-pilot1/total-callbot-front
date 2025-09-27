import { Card, CardContent, CardTitle, Progress } from "../../../components/ui";
import type {
  ExamStatus,
  Participant as ExamParticipant,
} from "../types/exam";

export interface ExamStatusBarProps {
  examStatus: ExamStatus;
  participants: ExamParticipant[];
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

const statusLabel: Record<ExamStatus["status"], string> = {
  WAITING: "대기 중",
  IN_PROGRESS: "진행 중",
  COMPLETED: "종료",
};

export default function ExamStatusBar({
  examStatus,
  participants,
  timeLeft,
  formatTime,
}: ExamStatusBarProps) {
  const questionProgress =
    examStatus.totalQuestions > 0
      ? (examStatus.currentQuestion / examStatus.totalQuestions) * 100
      : 0;
  const answeredCount = participants.filter(
    (participant) => participant.status === "COMPLETED",
  ).length;
  const onlineCount = participants.filter(
    (participant) => participant.isOnline ?? participant.status !== "WAITING",
  ).length;

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Card className="border border-gray-200">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div>
                <CardTitle className="text-sm text-gray-500 mb-2">
                  시험 상태
                </CardTitle>
                <div className="text-lg font-semibold text-gray-900">
                  {statusLabel[examStatus.status]}
                </div>
                <p className="text-sm text-gray-500">
                  시작 시간 {examStatus.startedAt}
                </p>
              </div>

              <div className="md:col-span-2">
                <CardTitle className="text-sm text-gray-500 mb-2">
                  진행 상황
                </CardTitle>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>
                    문제 {examStatus.currentQuestion}/{examStatus.totalQuestions}
                  </span>
                  <span>남은 시간 {formatTime(timeLeft)}</span>
                </div>
                <Progress value={questionProgress} max={100} />
              </div>

              <div>
                <CardTitle className="text-sm text-gray-500 mb-2">
                  참가자 현황
                </CardTitle>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>현재 접속 {onlineCount}명</div>
                  <div>총 참가자 {participants.length}명</div>
                  <div>답안 제출 {answeredCount}명</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
