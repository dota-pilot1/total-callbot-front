import { useState } from "react";
import { useCreateTestRoom } from "../api/useTestRooms";
import { Button } from "../../../components/ui";
import FullScreenSlideDialog from "../../../components/ui/FullScreenSlideDialog";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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

interface FormData {
  name: string;
  description: string;
  capacity: number;
  testType: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  capacity?: string;
  testType?: string;
}

export default function CreateRoomModal({
  isOpen,
  onClose,
}: CreateRoomModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    capacity: 30,
    testType: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const createRoomMutation = useCreateTestRoom();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "시험방 이름을 입력해주세요";
    } else if (formData.name.length > 200) {
      newErrors.name = "시험방 이름은 200자 이하로 입력해주세요";
    }

    if (!formData.description.trim()) {
      newErrors.description = "시험방 설명을 입력해주세요";
    }

    if (!formData.testType) {
      newErrors.testType = "시험 유형을 선택해주세요";
    }

    if (formData.capacity < 1) {
      newErrors.capacity = "수용인원은 1명 이상이어야 합니다";
    } else if (formData.capacity > 100) {
      newErrors.capacity = "수용인원은 100명 이하로 설정해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createRoomMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim(),
        capacity: formData.capacity,
        testType: formData.testType,
      });

      // 성공 시 폼 초기화 및 모달 닫기
      setFormData({
        name: "",
        description: "",
        capacity: 30,
        testType: "",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("시험방 생성 실패:", error);
    }
  };

  const handleClose = () => {
    if (!createRoomMutation.isPending) {
      setFormData({
        name: "",
        description: "",
        capacity: 30,
        testType: "",
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <FullScreenSlideDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="새 시험방 만들기"
      showCloseButton={!createRoomMutation.isPending}
    >
      <div className="h-full flex flex-col">
        {/* Form Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            {/* 시험방 이름 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                시험방 이름 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="예: 영어 회화 연습실 1"
                className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base ${
                  errors.name ? "border-red-500" : "border-border"
                }`}
                disabled={createRoomMutation.isPending}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* 시험방 설명 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                시험방 설명 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="시험방에 대한 간단한 설명을 입력해주세요"
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-base ${
                  errors.description ? "border-red-500" : "border-border"
                }`}
                disabled={createRoomMutation.isPending}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* 시험 유형 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                시험 유형 *
              </label>
              <select
                value={formData.testType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, testType: e.target.value }))
                }
                className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base ${
                  errors.testType ? "border-red-500" : "border-border"
                }`}
                disabled={createRoomMutation.isPending}
              >
                <option value="">시험 유형을 선택해주세요</option>
                {testTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.testType && (
                <p className="text-sm text-red-600">{errors.testType}</p>
              )}
            </div>

            {/* 수용인원 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                수용인원 *
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    capacity: parseInt(e.target.value) || 0,
                  }))
                }
                min="1"
                max="100"
                className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-base ${
                  errors.capacity ? "border-red-500" : "border-border"
                }`}
                disabled={createRoomMutation.isPending}
              />
              {errors.capacity && (
                <p className="text-sm text-red-600">{errors.capacity}</p>
              )}
              <p className="text-sm text-muted-foreground">
                동시에 입장할 수 있는 최대 인원수입니다 (1-100명)
              </p>
            </div>

            {/* Error Message */}
            {createRoomMutation.isError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 mb-1">
                    시험방 생성에 실패했습니다
                  </p>
                  <p className="text-sm text-red-700">
                    {createRoomMutation.error instanceof Error
                      ? createRoomMutation.error.message
                      : "다시 시도해주세요."}
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 border-t border-border bg-white p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row max-w-2xl mx-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createRoomMutation.isPending}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              form="create-room-form"
              onClick={handleSubmit}
              disabled={createRoomMutation.isPending}
              className="flex-1"
            >
              {createRoomMutation.isPending ? "생성 중..." : "시험방 만들기"}
            </Button>
          </div>
        </div>
      </div>
    </FullScreenSlideDialog>
  );
}
