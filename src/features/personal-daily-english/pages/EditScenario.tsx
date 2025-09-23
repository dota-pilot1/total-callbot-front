import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  useMyScenarioById,
  useUpdateMyScenario
} from "../hooks/usePersonalConversationScenarios";
import type { PersonalConversationScenario } from "../types";

interface ScenarioFormData {
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

export default function EditScenario() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const scenarioId = parseInt(id || "0");

  const { data: scenario, isLoading } = useMyScenarioById(scenarioId);
  const updateScenarioMutation = useUpdateMyScenario();

  const [formData, setFormData] = useState<ScenarioFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 시나리오 데이터를 폼 데이터로 변환
  useEffect(() => {
    if (scenario) {
      setFormData({
        category: scenario.category,
        title: scenario.title,
        description: scenario.description,
        systemInstructions: scenario.systemInstructions,
        userRole: scenario.userRole || "",
        aiRole: scenario.aiRole || "",
        scenarioBackground: scenario.scenarioBackground || "",
        learningGoals: scenario.learningGoals || "",
        aiKnowledge: scenario.aiKnowledge || "",
        aiStarts: scenario.aiStarts,
        openingMessage: scenario.openingMessage || "",
        difficulty: scenario.difficulty,
        expectedTurns: scenario.expectedTurns,
        conversationStyle: scenario.conversationStyle,
        modalities: scenario.modalities,
        voice: scenario.voice || "",
        isPrivate: scenario.isPrivate,
      });
    }
  }, [scenario]);

  const handleInputChange = (
    field: keyof ScenarioFormData,
    value: string | boolean | number | string[]
  ) => {
    if (!formData) return;
    setFormData(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setIsSubmitting(true);

    try {
      await updateScenarioMutation.mutateAsync({
        id: scenarioId,
        ...formData
      });
      navigate("/personal-daily-english");
    } catch (error) {
      console.error("시나리오 수정 실패:", error);
      alert("시나리오 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">시나리오를 불러오는 중...</p>
      </div>
    );
  }

  if (!scenario || !formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">시나리오를 찾을 수 없습니다.</p>
          <Button onClick={() => navigate("/personal-daily-english")}>
            뒤로 가기
          </Button>
        </div>
      </div>
    );
  }

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
                <span className="text-sm">✏️</span>
              </div>
              <h1 className="text-lg font-semibold text-foreground">
                시나리오 편집
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    카테고리 *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
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
                    onChange={(e) => handleInputChange("difficulty", e.target.value as PersonalConversationScenario["difficulty"])}
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
                  onChange={(e) => handleInputChange("description", e.target.value)}
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
                    onChange={(e) => handleInputChange("userRole", e.target.value)}
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
                    onChange={(e) => handleInputChange("aiRole", e.target.value)}
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
                  onChange={(e) => handleInputChange("scenarioBackground", e.target.value)}
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
                  onChange={(e) => handleInputChange("systemInstructions", e.target.value)}
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
                  onChange={(e) => handleInputChange("learningGoals", e.target.value)}
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
                  onChange={(e) => handleInputChange("aiStarts", e.target.checked)}
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
                    onChange={(e) => handleInputChange("openingMessage", e.target.value)}
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
                    onChange={(e) => handleInputChange("expectedTurns", parseInt(e.target.value) || 10)}
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
                    onChange={(e) => handleInputChange("conversationStyle", e.target.value as PersonalConversationScenario["conversationStyle"])}
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
                  onChange={(e) => handleInputChange("isPrivate", e.target.checked)}
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-20"
            >
              {isSubmitting ? "저장 중..." : "저장하기"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
