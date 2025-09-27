import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogActions,
  Button,
} from "../../../components/ui";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/Label";
import { useCreateTestRoom } from "../api/useTestRooms";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const testTypeOptions = [
  { value: "ENGLISH_CONVERSATION", label: "영어 회화" },
  { value: "ENGLISH_LISTENING", label: "영어 듣기" },
  { value: "ENGLISH_VOCABULARY", label: "영어 단어" },
  { value: "MATHEMATICS", label: "수학" },
];

export default function CreateRoomModal({ isOpen, onClose }: CreateRoomModalProps) {
  const createRoomMutation = useCreateTestRoom();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(10);
  const [testType, setTestType] = useState("ENGLISH_CONVERSATION");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCapacity(10);
    setTestType("ENGLISH_CONVERSATION");
    setError(null);
  };

  const handleClose = () => {
    if (createRoomMutation.isPending) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("룸 이름을 입력해주세요.");
      return;
    }

    try {
      await createRoomMutation.mutateAsync({
        name,
        description,
        capacity,
        testType,
      });
      handleClose();
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        setError(submissionError.message);
      } else {
        setError("시험방 생성에 실패했습니다.");
      }
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="새 시험방 만들기"
      maxWidth="lg"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="room-name">시험방 이름</Label>
          <Input
            id="room-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예: 3반 영어 듣기 퀴즈"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="room-description">설명</Label>
          <Input
            id="room-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="시험에 대한 간단한 설명을 입력하세요"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="room-capacity">정원</Label>
            <Input
              id="room-capacity"
              type="number"
              min={1}
              value={capacity}
              onChange={(event) => setCapacity(Number(event.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-type">시험 유형</Label>
            <select
              id="room-type"
              value={testType}
              onChange={(event) => setTestType(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {testTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <DialogActions>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={createRoomMutation.isPending}
          >
            취소
          </Button>
          <Button type="submit" disabled={createRoomMutation.isPending}>
            {createRoomMutation.isPending ? "생성 중..." : "생성"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
