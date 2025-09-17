import { useState } from "react";
import { CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Button } from "./ui";
import { EXAM_CHARACTERS } from "../features/chatbot/exam/examCharacters";
import FullScreenSlideDialog from "./ui/FullScreenSlideDialog";

interface ExamCharacterDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCharacterId: string;
  onConfirm: (characterId: string) => void;
}

export default function ExamCharacterDialog({
  open,
  onClose,
  selectedCharacterId,
  onConfirm,
}: ExamCharacterDialogProps) {
  const [tempSelectedId, setTempSelectedId] = useState(selectedCharacterId);

  const handleConfirm = () => {
    onConfirm(tempSelectedId);
    onClose();
  };

  const handleRandomSelect = () => {
    const randomIndex = Math.floor(Math.random() * EXAM_CHARACTERS.length);
    setTempSelectedId(EXAM_CHARACTERS[randomIndex].id);
  };

  const selectedCharacter = EXAM_CHARACTERS.find(
    (c) => c.id === tempSelectedId,
  );

  return (
    <FullScreenSlideDialog
      isOpen={open}
      onClose={onClose}
      title="시험 출제자 선택"
      className="h-[100vh]"
    >
      <div className="space-y-4 h-full flex flex-col">
        {/* 랜덤 선택 버튼 */}
        <div className="flex justify-center">
          <Button
            onClick={handleRandomSelect}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>랜덤 선택</span>
          </Button>
        </div>

        {/* 스크롤 가능한 캐릭터 선택 영역 */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* 선택된 캐릭터 미리보기 */}
          {selectedCharacter && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{selectedCharacter.emoji}</span>
                <div>
                  <h3 className="font-medium text-blue-900">
                    {selectedCharacter.name}
                  </h3>
                  <p className="text-sm text-blue-700">
                    {selectedCharacter.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 캐릭터 목록 - 2열 그리드 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              출제자를 선택하세요
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {EXAM_CHARACTERS.map((character) => (
                <button
                  key={character.id}
                  onClick={() => setTempSelectedId(character.id)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-left relative ${
                    tempSelectedId === character.id
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{character.emoji}</div>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {character.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      {character.description}
                    </div>
                  </div>
                  {tempSelectedId === character.id && (
                    <CheckCircleIcon className="absolute top-2 right-2 h-4 w-4 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 고정된 하단 버튼 */}
        <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
          <Button onClick={handleConfirm} className="w-full" size="lg">
            선택 완료
          </Button>
        </div>
      </div>
    </FullScreenSlideDialog>
  );
}
