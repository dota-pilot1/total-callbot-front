import { useState } from "react";
import { Button } from "../../../components/ui";
import {
  XMarkIcon,
  SparklesIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import FullScreenSlideDialog from "../../../components/ui/FullScreenSlideDialog";
import EnglishExamTopicGenerator from "./EnglishExamTopicGenerator";

interface TestCenterQuestionFormData {
  title: string;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation?: string;
}

interface AIQuestionGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (questionData: TestCenterQuestionFormData) => void;
}

export default function AIQuestionGeneratorDialog({
  isOpen,
  onClose,
  onGenerated,
}: AIQuestionGeneratorDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [subject, setSubject] = useState("");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showTopicGenerator, setShowTopicGenerator] = useState(false);

  const handleGenerate = async () => {
    if (!subject.trim()) {
      setError("주제를 입력해주세요.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // TODO: 실제 AI API 호출로 교체
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 시뮬레이션

      // Mock 데이터 - 실제로는 AI API 응답을 사용
      const generatedQuestion: TestCenterQuestionFormData = {
        title: `${subject} 관련 문제`,
        content: `다음 중 ${subject}에 대한 설명으로 가장 적절한 것은?`,
        optionA: "첫 번째 선택지입니다.",
        optionB: "두 번째 선택지입니다.",
        optionC: "세 번째 선택지입니다.",
        optionD: "네 번째 선택지입니다.",
        correctAnswer: "A",
        explanation: `${subject}에 대한 설명입니다.`,
      };

      onGenerated(generatedQuestion);
    } catch (err) {
      console.error("문제 생성 실패:", err);
      setError("문제 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTopicSelect = (topic: string) => {
    setSubject(topic);
    setShowTopicGenerator(false);
  };

  const handleClose = () => {
    if (!isGenerating) {
      setSubject("");
      setInstructions("");
      setError(null);
      setShowTopicGenerator(false);
      onClose();
    }
  };

  return (
    <FullScreenSlideDialog
      isOpen={isOpen}
      onClose={handleClose}
      title="AI 문제 자동 생성"
    >
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">AI 문제 생성 기능</p>
                <p>
                  주제와 지침을 입력하면 AI가 자동으로 객관식 문제를 생성합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 주제 입력 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                문제 주제 *
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTopicGenerator(true)}
                disabled={isGenerating}
                className="flex items-center gap-1 px-3 py-1"
                title="영어 시험 주제 자동 완성"
              >
                📚
              </Button>
            </div>
            <textarea
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="예: 한국사, 영어 문법, 수학 기하학 등"
              className="w-full min-h-[72px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isGenerating}
              rows={3}
            />
            <p className="text-xs text-gray-500">
              생성할 문제의 주제나 영역을 입력하거나 우측 상단 📚 버튼을 클릭해
              영어 시험 주제를 선택하세요.
            </p>
          </div>

          {/* 지침 입력 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              상세 지침 (선택사항)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="예: 초급 수준으로, 실생활 예시를 포함해서, 계산 문제로 등"
              className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500">
              문제의 난이도, 스타일, 특별한 요구사항 등을 자세히 설명해주세요.
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <XMarkIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* 생성 예시 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              생성 예시
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                <strong>주제:</strong> "영어 과거시제"
              </p>
              <p>
                <strong>지침:</strong> "중학생 수준으로, 일상생활 상황을 활용한
                문제"
              </p>
              <p>
                <strong>결과:</strong> 일상생활 상황에서 과거시제 사용법을 묻는
                4지선다 문제가 생성됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="border-t border-gray-200 px-4 py-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isGenerating}
            className="w-full sm:w-auto"
          >
            취소
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !subject.trim()}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                생성 중...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4 mr-2" />
                문제 생성하기
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 영어 시험 주제 생성기 */}
      <EnglishExamTopicGenerator
        isOpen={showTopicGenerator}
        onClose={() => setShowTopicGenerator(false)}
        onTopicSelect={handleTopicSelect}
      />
    </FullScreenSlideDialog>
  );
}
