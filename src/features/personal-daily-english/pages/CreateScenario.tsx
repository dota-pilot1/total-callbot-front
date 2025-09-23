import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "../../../components/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { HeaderAuthControls } from "../../../components/layout/HeaderAuthControls";
import {
  useCreateMyScenario,
  useAutoGenerateScenario,
} from "../hooks/usePersonalConversationScenarios";
import AutoGenerateButton from "../components/AutoGenerateButton";
import type { PersonalConversationScenario } from "../types";

interface ScenarioFormData {
  topic: string; // AI 자동 생성을 위한 주제 필드
  category: string;
  title: string;
  description: string;
  systemInstructions: string;
  userRole: string;
  aiRole: string;
  scenarioBackground: string;
  learningGoals: string;
  aiKnowledge: string;
  aiStarts: boolean;
  openingMessage: string;
  difficulty: PersonalConversationScenario["difficulty"];
  expectedTurns: number;
  conversationStyle: PersonalConversationScenario["conversationStyle"];
  modalities: PersonalConversationScenario["modalities"];
  voice: string;
  isPrivate: boolean;
}

const defaultFormData: ScenarioFormData = {
  topic: "",
  category: "",
  title: "",
  description: "",
  systemInstructions: "",
  userRole: "",
  aiRole: "",
  scenarioBackground: "",
  learningGoals: "",
  aiKnowledge: "",
  aiStarts: true,
  openingMessage: "",
  difficulty: "BEGINNER",
  expectedTurns: 10,
  conversationStyle: "INFORMAL",
  modalities: ["TEXT"],
  voice: "",
  isPrivate: true,
};

export default function CreateScenario() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ScenarioFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createScenarioMutation = useCreateMyScenario();
  const autoGenerateMutation = useAutoGenerateScenario();

  const handleInputChange = (
    field: keyof ScenarioFormData,
    value: string | boolean | number | string[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAutoGenerate = async (topic: string) => {
    try {
      const generatedData = await autoGenerateMutation.mutateAsync({
        topic,
        difficulty: formData.difficulty,
        conversationStyle: formData.conversationStyle,
        targetLanguage: "Korean", // 한국어 대상
      });

      // 생성된 데이터로 폼 필드 자동 완성
      setFormData((prev) => ({
        ...prev,
        category: generatedData.category,
        title: generatedData.title,
        description: generatedData.description,
        systemInstructions: generatedData.systemInstructions,
        userRole: generatedData.userRole,
        aiRole: generatedData.aiRole,
        scenarioBackground: generatedData.scenarioBackground,
        learningGoals: generatedData.learningGoals,
        aiKnowledge: generatedData.aiKnowledge,
        openingMessage: generatedData.openingMessage,
      }));
    } catch (error) {
      console.error("자동 생성 실패:", error);
      alert("AI 자동 완성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // topic 필드를 제외하고 시나리오 생성
      const { topic, ...scenarioData } = formData;
      await createScenarioMutation.mutateAsync(scenarioData);
      navigate("/personal-daily-english");
    } catch (error) {
      console.error("시나리오 생성 실패:", error);
      alert("시나리오 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/personal-daily-english")}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">뒤로</span>
              </Button>
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <span className="text-sm">✨</span>
              </div>
              <h1 className="text-lg font-semibold text-foreground">
                새 시나리오 만들기
              </h1>
            </div>
            <HeaderAuthControls />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI 자동 생성을 위한 주제 입력 */}
              <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-md border border-orange-200/50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600 text-sm">✨</span>
                    <label className="text-sm font-medium text-orange-800">
                      AI 자동 완성으로 시작하기
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) =>
                        handleInputChange("topic", e.target.value)
                      }
                      placeholder="예: 카페에서 주문하기, 병원 진료받기"
                      className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <AutoGenerateButton
                      topic={formData.topic}
                      onGenerate={handleAutoGenerate}
                      loading={autoGenerateMutation.isPending}
                      disabled={isSubmitting}
                      compact={true}
                    />
                  </div>
                  <p className="text-xs text-orange-600/80">
                    주제를 입력하고 AI 완성 버튼을 누르면 아래 필드들이 자동으로
                    채워집니다
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    카테고리 *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    placeholder="예: 일상생활, 비즈니스, 여행"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    난이도 *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      handleInputChange(
                        "difficulty",
                        e.target
                          .value as PersonalConversationScenario["difficulty"],
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="BEGINNER">초급</option>
                    <option value="INTERMEDIATE">중급</option>
                    <option value="ADVANCED">고급</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="시나리오 제목을 입력하세요"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  설명 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="시나리오에 대한 간단한 설명을 입력하세요"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 역할 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>역할 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    사용자 역할
                  </label>
                  <input
                    type="text"
                    value={formData.userRole}
                    onChange={(e) =>
                      handleInputChange("userRole", e.target.value)
                    }
                    placeholder="예: 고객, 학생, 관광객"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    AI 역할
                  </label>
                  <input
                    type="text"
                    value={formData.aiRole}
                    onChange={(e) =>
                      handleInputChange("aiRole", e.target.value)
                    }
                    placeholder="예: 카페 직원, 선생님, 가이드"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  시나리오 배경
                </label>
                <textarea
                  value={formData.scenarioBackground}
                  onChange={(e) =>
                    handleInputChange("scenarioBackground", e.target.value)
                  }
                  placeholder="대화가 이루어지는 상황과 배경을 설명하세요"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* AI 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>AI 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  시스템 지시사항 *
                </label>
                <textarea
                  value={formData.systemInstructions}
                  onChange={(e) =>
                    handleInputChange("systemInstructions", e.target.value)
                  }
                  placeholder="AI가 어떻게 행동해야 하는지 구체적으로 설명하세요"
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  학습 목표
                </label>
                <textarea
                  value={formData.learningGoals}
                  onChange={(e) =>
                    handleInputChange("learningGoals", e.target.value)
                  }
                  placeholder="이 시나리오를 통해 달성하고자 하는 학습 목표를 설명하세요"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="aiStarts"
                  checked={formData.aiStarts}
                  onChange={(e) =>
                    handleInputChange("aiStarts", e.target.checked)
                  }
                  className="rounded"
                />
                <label htmlFor="aiStarts" className="text-sm text-foreground">
                  AI가 대화를 먼저 시작
                </label>
              </div>

              {formData.aiStarts && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    시작 메시지
                  </label>
                  <input
                    type="text"
                    value={formData.openingMessage}
                    onChange={(e) =>
                      handleInputChange("openingMessage", e.target.value)
                    }
                    placeholder="AI가 먼저 할 인사말이나 질문을 입력하세요"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* 기타 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>기타 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    예상 대화 턴 수
                  </label>
                  <input
                    type="number"
                    value={formData.expectedTurns}
                    onChange={(e) =>
                      handleInputChange(
                        "expectedTurns",
                        parseInt(e.target.value) || 10,
                      )
                    }
                    min={5}
                    max={50}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    대화 스타일
                  </label>
                  <select
                    value={formData.conversationStyle}
                    onChange={(e) =>
                      handleInputChange(
                        "conversationStyle",
                        e.target
                          .value as PersonalConversationScenario["conversationStyle"],
                      )
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="FORMAL">격식</option>
                    <option value="INFORMAL">비격식</option>
                    <option value="MIXED">혼합</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) =>
                    handleInputChange("isPrivate", e.target.checked)
                  }
                  className="rounded"
                />
                <label htmlFor="isPrivate" className="text-sm text-foreground">
                  비공개 시나리오 (나만 볼 수 있음)
                </label>
              </div>
            </CardContent>
          </Card>

          {/* 버튼 */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/personal-daily-english")}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-20">
              {isSubmitting ? "생성 중..." : "생성하기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
