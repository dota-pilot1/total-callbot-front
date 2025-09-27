import { useState } from "react";
import {
  Dialog,
  DialogActions,
  Button,
  Card,
  CardContent,
  CardTitle,
} from "../../../components/ui";
import type { Question } from "../types";

export interface QuestionManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
  roomName: string;
}

const placeholderQuestions: Question[] = [
  {
    id: 1,
    title: "질문 1",
    content: "샘플 질문 내용",
    optionA: "보기 1",
    optionB: "보기 2",
    optionC: "보기 3",
    optionD: "보기 4",
    correctAnswer: "A",
    questionOrder: 1,
    isActive: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

export default function QuestionManagementDialog({
  isOpen,
  onClose,
  roomId,
  roomName,
}: QuestionManagementDialogProps) {
  const [questions] = useState(placeholderQuestions);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="문제 관리"
      maxWidth="lg"
      headerAction={<span className="text-sm text-gray-500">{roomName}</span>}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          시험방 ID {roomId}에 등록된 문제 목록입니다. 실제 데이터 연동 전까지는
          샘플 정보가 표시됩니다.
        </p>

        <div className="grid gap-3">
          {questions.map((question) => (
            <Card key={question.id} className="border border-gray-200">
              <CardContent className="py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">
                      {question.questionOrder}. {question.title}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      정답: {question.correctAnswer}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {question.isActive ? "활성" : "비활성"}
                  </span>
                </div>
              </CardContent>
            </Card>
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
