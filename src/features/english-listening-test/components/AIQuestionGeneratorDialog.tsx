import { useState } from "react";
import { Button, Dialog, DialogActions } from "../../../components/ui";
import { SparklesIcon } from "@heroicons/react/24/outline";

interface QuestionGenerationOptions {
  topic?: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  category: string;
  language?: "korean" | "english";
}

interface GeneratedQuestion {
  audioText: string;
  questionContent: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation?: string;
}

interface QuestionFormData {
  audioText: string;
  questionContent: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  category: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  explanation?: string;
}

interface AIQuestionGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (questionData: QuestionFormData) => void;
  currentCategory?: string;
  currentDifficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
}

// Mock GPT Service (실제로는 별도 서비스 파일로 분리)
class MockGPTService {
  static async generateQuestion(
    options: QuestionGenerationOptions,
  ): Promise<GeneratedQuestion> {
    // 실제 구현에서는 GPT API 호출
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 로딩 시뮬레이션

    const mockData: Record<string, GeneratedQuestion> = {
      BEGINNER_listening: {
        audioText: "Good morning! How are you today?",
        questionContent: "화자가 인사할 때 뭐라고 말했나요?",
        optionA: "Good morning! How are you today?",
        optionB: "Good evening! How are you today?",
        optionC: "Good afternoon! How are you today?",
        optionD: "Good night! How are you today?",
        correctAnswer: "A",
        explanation:
          "화자가 'Good morning! How are you today?'라고 말했습니다.",
      },
      INTERMEDIATE_listening: {
        audioText:
          "I'm planning to visit the museum this weekend. Would you like to join me?",
        questionContent: "화자가 주말에 무엇을 할 계획이라고 했나요?",
        optionA: "영화관에 가기",
        optionB: "박물관에 가기",
        optionC: "공원에 가기",
        optionD: "쇼핑몰에 가기",
        correctAnswer: "B",
        explanation: "화자가 'visit the museum this weekend'라고 말했습니다.",
      },
      ADVANCED_listening: {
        audioText:
          "The economic implications of this policy could significantly impact the global market dynamics.",
        questionContent: "이 정책이 무엇에 영향을 줄 수 있다고 했나요?",
        optionA: "지역 경제에만",
        optionB: "개인 투자에만",
        optionC: "글로벌 시장 역학에",
        optionD: "국내 정치에만",
        correctAnswer: "C",
        explanation: "'global market dynamics'에 영향을 줄 수 있다고 했습니다.",
      },
    };

    // 주제별 커스터마이징
    if (options.topic) {
      const customResponse = this.generateCustomResponse(options);
      if (customResponse) return customResponse;
    }

    const key = `${options.difficulty}_${options.category}`;
    return mockData[key] || mockData["BEGINNER_listening"];
  }

  private static generateCustomResponse(
    options: QuestionGenerationOptions,
  ): GeneratedQuestion | null {
    const topicTemplates: Record<string, Partial<GeneratedQuestion>> = {
      날씨: {
        audioText: "The weather is nice today, isn't it?",
        questionContent: "화자가 날씨에 대해 뭐라고 했나요?",
        optionA: "날씨가 좋다",
        optionB: "날씨가 나쁘다",
        optionC: "날씨가 춥다",
        optionD: "날씨가 덥다",
        correctAnswer: "A",
      },
      음식: {
        audioText: "This pizza tastes really delicious!",
        questionContent: "화자가 피자에 대해 어떻게 말했나요?",
        optionA: "정말 맛있다",
        optionB: "별로 맛없다",
        optionC: "너무 짜다",
        optionD: "너무 달다",
        correctAnswer: "A",
      },
      여행: {
        audioText: "I'm going to travel to Paris next month.",
        questionContent: "화자가 언제 파리에 갈 예정이라고 했나요?",
        optionA: "이번 달",
        optionB: "다음 달",
        optionC: "다음 주",
        optionD: "내년",
        correctAnswer: "B",
      },
    };

    const template = topicTemplates[options.topic || ""];
    if (!template) return null;

    return {
      audioText: template.audioText || "",
      questionContent: template.questionContent || "",
      optionA: template.optionA || "",
      optionB: template.optionB || "",
      optionC: template.optionC || "",
      optionD: template.optionD || "",
      correctAnswer: template.correctAnswer || "A",
      explanation: `${options.topic} 관련 문제입니다.`,
    };
  }
}

type GeneratorOptions = {
  topic: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  language: 'korean' | 'english';
};

export default function AIQuestionGeneratorDialog({
  isOpen,
  onClose,
  onGenerated,
  currentCategory = "listening",
  currentDifficulty = "BEGINNER",
}: AIQuestionGeneratorDialogProps) {
  const [options, setOptions] = useState<GeneratorOptions>({
    topic: "",
    difficulty: currentDifficulty,
    category: currentCategory,
    language: "korean",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const difficulties = [
    { id: "BEGINNER", name: "초급", description: "기초적인 단어와 문장" },
    { id: "INTERMEDIATE", name: "중급", description: "일반적인 대화 수준" },
    { id: "ADVANCED", name: "고급", description: "복잡한 문장과 어휘" },
  ] as const;

  // 카테고리는 현재 사용하지 않음 (UI 단순화)

  const topicSuggestions = [
    "일상 대화",
    "날씨",
    "음식",
    "여행",
    "쇼핑",
    "업무",
    "취미",
    "가족",
    "친구",
    "학교",
    "건강",
    "운동",
    "기술",
    "뉴스",
    "문화",
  ];

  const handleGenerate = async () => {
    if (!options.topic.trim()) {
      alert("주제를 입력해주세요.");
      return;
    }

    setIsGenerating(true);

    try {
      const generatedQuestion = await MockGPTService.generateQuestion(options);

      // 생성된 데이터를 폼 데이터 형식으로 변환
      const formData: QuestionFormData = {
        audioText: generatedQuestion.audioText,
        questionContent: generatedQuestion.questionContent,
        optionA: generatedQuestion.optionA,
        optionB: generatedQuestion.optionB,
        optionC: generatedQuestion.optionC,
        optionD: generatedQuestion.optionD,
        correctAnswer: generatedQuestion.correctAnswer,
        category: options.category,
        difficulty: options.difficulty,
        explanation: generatedQuestion.explanation,
      };

      onGenerated(formData);
      onClose();
    } catch (error) {
      console.error("문제 생성 오류:", error);
      alert("문제 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTopicSuggestionClick = (topic: string) => {
    setOptions({ ...options, topic });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="AI 문제 생성"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* 헤더 설명 */}
        <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-3 rounded-lg border">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              AI로 듣기 문제 자동 생성
            </span>
          </div>
        </div>

        {/* 주제 입력 */}
        <div>
          <label className="block text-sm font-medium mb-2">주제 *</label>
          <input
            type="text"
            value={options.topic}
            onChange={(e) => setOptions({ ...options, topic: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            placeholder="예: 날씨, 음식, 여행, 업무 등"
          />

          {/* 주제 제안 버튼들 */}
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">주제 제안:</p>
            <div className="flex flex-wrap gap-2">
              {topicSuggestions.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleTopicSuggestionClick(topic)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    options.topic === topic
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background hover:bg-accent text-muted-foreground border-border hover:border-primary"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 난이도 선택 */}
        <div>
          <label className="block text-sm font-medium mb-2">난이도</label>
          <div className="grid grid-cols-3 gap-3">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty.id}
                type="button"
                onClick={() =>
                  setOptions({ ...options, difficulty: difficulty.id })
                }
                className={`p-3 rounded-lg border text-left transition-all ${
                  options.difficulty === difficulty.id
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-border hover:border-primary/50 bg-card hover:bg-accent/50"
                }`}
              >
                <div className="font-medium text-sm">{difficulty.name}</div>
                <div
                  className={`text-xs mt-1 ${
                    options.difficulty === difficulty.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {difficulty.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 생성 예상 시간 안내 */}
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">💡 알림:</span> AI 문제 생성에는 2-3초
            정도 소요됩니다.
          </p>
        </div>
      </div>

      <DialogActions>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isGenerating}
        >
          취소
        </Button>
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !options.topic.trim()}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>생성 중...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4" />
              <span>문제 생성</span>
            </>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
