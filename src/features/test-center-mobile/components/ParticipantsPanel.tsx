import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "../../../components/ui";
import type {
  ExamStatus,
  Participant as ExamParticipant,
} from "../types/exam";

export interface ParticipantsPanelProps {
  participants: ExamParticipant[];
  examStatus: ExamStatus;
  roomInfo: {
    testTypeDisplayName: string;
    capacity: number;
    currentParticipants: number;
  };
}

const statusBadge: Record<ExamParticipant["status"], string> = {
  WAITING: "bg-gray-100 text-gray-700",
  THINKING: "bg-yellow-100 text-yellow-800",
  ANSWERING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
};

export default function ParticipantsPanel({
  participants,
  examStatus,
  roomInfo,
}: ParticipantsPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">참여자 ({participants.length})</CardTitle>
        <p className="text-xs text-gray-500">
          {roomInfo.testTypeDisplayName} · {examStatus.status === "IN_PROGRESS" ? "진행 중" : "대기 중"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-gray-500">
          현재 {roomInfo.currentParticipants}명 / 정원 {roomInfo.capacity}명
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between gap-3 border border-gray-100 rounded-md px-3 py-2"
            >
              <div>
                <p className="font-medium text-sm text-gray-800">
                  {participant.name}
                </p>
                <p className="text-xs text-gray-500">
                  점수 {participant.currentScore} · 진행률 {participant.progress}%
                </p>
              </div>
              <Badge className={`text-xs ${statusBadge[participant.status]}`}>
                {participant.status === "WAITING"
                  ? "대기중"
                  : participant.status === "THINKING"
                  ? "풀이중"
                  : participant.status === "ANSWERING"
                  ? "답안 작성"
                  : "완료"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
