import { useState } from "react";
import { Button } from "../../../components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import FullScreenSlideDialog from "../../../components/ui/FullScreenSlideDialog";
import {
  useAllScenarios,
  useCreateScenario,
  useDeleteScenario,
  useAllCategories,
} from "../hooks/useConversationScenarios";
import type { ConversationScenario } from "../types";
import { PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";

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
  difficulty: ConversationScenario['difficulty'];
  expectedTurns: number;
  conversationStyle: ConversationScenario['conversationStyle'];
  voice: string;
}

const initialFormData: ScenarioFormData = {
  category: "일상생활 (Everyday Life)",
  title: "",
  description: "",
  systemInstructions: "",
  userRole: "",
  aiRole: "",
  scenarioBackground: "",
  learningGoals: "",
  aiKnowledge: "",
  aiStarts: false,
  openingMessage: "",
  difficulty: "BEGINNER",
  expectedTurns: 10,
  conversationStyle: "MIXED",
  voice: "alloy",
};

export default function ScenarioManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ScenarioFormData>(initialFormData);

  const { data: scenarios = [], isLoading, refetch } = useAllScenarios();
  const { data: categories = [] } = useAllCategories();
  const createMutation = useCreateScenario();
  const deleteMutation = useDeleteScenario();

  const fallbackCategories = [
    "일상생활 (Everyday Life)",
    "사회생활 및 관계 (Social Life & Relationships)",
    "비즈니스 및 학업 (Business & Academic)",
  ];

  const categoryOptions = categories.length > 0 ? categories : fallbackCategories;

  const handleInputChange = (field: keyof ScenarioFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const scenarioData = {
        ...formData,
        modalities: ['TEXT' as const],
      };

      await createMutation.mutateAsync(scenarioData);
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      refetch();
    } catch (error) {
      console.error("시나리오 생성 실패:", error);
      alert("시나리오 생성에 실패했습니다.");
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`"${title}" 시나리오를 삭제하시겠습니까?`)) return;

    try {
      await deleteMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error("시나리오 삭제 실패:", error);
      alert("시나리오 삭제에 실패했습니다.");
    }
  };

  const categoryGroups = scenarios.reduce<Record<string, ConversationScenario[]>>((acc, scenario) => {
    if (!acc[scenario.category]) {
      acc[scenario.category] = [];
    }
    acc[scenario.category].push(scenario);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">시나리오 관리</h2>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          새 시나리오 추가
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">시나리오를 불러오는 중...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(categoryGroups).map(([category, categoryScenarios]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {category} ({categoryScenarios.length}개)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryScenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{scenario.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {scenario.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>난이도: {scenario.difficulty}</span>
                          <span>턴: {scenario.expectedTurns}</span>
                          <span>스타일: {scenario.conversationStyle}</span>
                          <span>역할: {scenario.userRole} ↔ {scenario.aiRole}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // TODO: 수정 기능 구현
                            console.log("수정:", scenario.id);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(scenario.id, scenario.title)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deleteMutation.isPending}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 시나리오 생성 다이얼로그 */}
      <FullScreenSlideDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="새 시나리오 추가"
      >
        <div className="h-full overflow-y-auto bg-background">
          <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">기본 정보</h3>

              <div>
                <label className="block text-sm font-medium mb-2">카테고리</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                  required
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">제목</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background"
                  placeholder="예: 카페에서 주문하기"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background h-20"
                  placeholder="시나리오에 대한 간략한 설명을 입력하세요"
                  required
                />
              </div>
            </div>

            {/* 역할 설정 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">역할 설정</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">사용자 역할</label>
                  <input
                    type="text"
                    value={formData.userRole}
                    onChange={(e) => handleInputChange('userRole', e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                    placeholder="예: 고객"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">AI 역할</label>
                  <input
                    type="text"
                    value={formData.aiRole}
                    onChange={(e) => handleInputChange('aiRole', e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                    placeholder="예: 카페 직원"
                  />
                </div>
              </div>
            </div>

            {/* AI 지침 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">AI 지침</h3>

              <div>
                <label className="block text-sm font-medium mb-2">시스템 지침</label>
                <textarea
                  value={formData.systemInstructions}
                  onChange={(e) => handleInputChange('systemInstructions', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background h-24"
                  placeholder="AI가 어떻게 행동해야 하는지 구체적으로 설명해주세요"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">배경 상황</label>
                <textarea
                  value={formData.scenarioBackground}
                  onChange={(e) => handleInputChange('scenarioBackground', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background h-20"
                  placeholder="대화가 일어나는 상황과 배경을 설명해주세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">AI 사전 지식</label>
                <textarea
                  value={formData.aiKnowledge}
                  onChange={(e) => handleInputChange('aiKnowledge', e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-background h-20"
                  placeholder="AI가 미리 알고 있어야 하는 정보 (메뉴, 가격, 규정 등)"
                />
              </div>
            </div>

            {/* 대화 설정 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">대화 설정</h3>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="aiStarts"
                  checked={formData.aiStarts}
                  onChange={(e) => handleInputChange('aiStarts', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="aiStarts" className="text-sm">AI가 먼저 대화를 시작</label>
              </div>

              {formData.aiStarts && (
                <div>
                  <label className="block text-sm font-medium mb-2">첫 인사 메시지</label>
                  <input
                    type="text"
                    value={formData.openingMessage}
                    onChange={(e) => handleInputChange('openingMessage', e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                    placeholder="AI가 먼저 할 인사말"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">난이도</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                  >
                    <option value="BEGINNER">초급</option>
                    <option value="INTERMEDIATE">중급</option>
                    <option value="ADVANCED">고급</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">예상 턴 수</label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={formData.expectedTurns}
                    onChange={(e) => handleInputChange('expectedTurns', parseInt(e.target.value))}
                    className="w-full p-2 border border-border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">대화 스타일</label>
                  <select
                    value={formData.conversationStyle}
                    onChange={(e) => handleInputChange('conversationStyle', e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-background"
                  >
                    <option value="FORMAL">격식</option>
                    <option value="INFORMAL">비격식</option>
                    <option value="MIXED">혼합</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "생성 중..." : "시나리오 생성"}
              </Button>
            </div>
          </form>
        </div>
      </FullScreenSlideDialog>
    </div>
  );
}
