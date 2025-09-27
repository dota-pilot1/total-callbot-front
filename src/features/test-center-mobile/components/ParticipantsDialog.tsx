import {
  Dialog,
  DialogActions,
  Button,
  Badge,
} from "../../../components/ui";
import type {
  ExamStatus,
  Participant as ExamParticipant,
} from "../types/exam";

export interface ParticipantsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  participants: ExamParticipant[];
  examStatus: ExamStatus;
  roomInfo: {
    testTypeDisplayName: string;
    capacity: number;
    currentParticipants: number;
  };
}

const statusLabel: Record<ExamParticipant["status"], string> = {
  WAITING: "대기중",
  THINKING: "풀이중",
  ANSWERING: "답안 작성",
  COMPLETED: "완료",
};

export default function ParticipantsDialog({
  isOpen,
  onClose,
  participants,
  examStatus,
  roomInfo,
}: ParticipantsDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`참여자 (${participants.length})`}
      maxWidth="md"
      headerAction={
        <span className="text-sm text-gray-500">
          {roomInfo.testTypeDisplayName} · {examStatus.status === "IN_PROGRESS" ? "진행 중" : "대기 중"}
        </span>
      }
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-500">
          현재 {roomInfo.currentParticipants}명 / 정원 {roomInfo.capacity}명
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between gap-3 border border-gray-100 rounded-lg px-4 py-3"
            >
              <div>
                <p className="font-medium text-sm text-gray-900">
                  {participant.name}
                  {participant.isHost && (
                    <span className="ml-2 text-xs text-blue-600">방장</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  점수 {participant.currentScore} · 진행률 {participant.progress}%
                </p>
              </div>
              <Badge className="text-xs">
                {statusLabel[participant.status]}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <DialogActions>
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
