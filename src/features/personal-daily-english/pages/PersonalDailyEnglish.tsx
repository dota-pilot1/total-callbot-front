import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";
import FullScreenSlideDialog from "../../../components/ui/FullScreenSlideDialog";
import { Button } from "../../../components/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { HeaderAuthControls } from "../../../components/layout/HeaderAuthControls";
import {
  useMyScenarios,
  useMyCategories,
  useMyScenariosByCategory,
  useDeleteMyScenario,
  useToggleMyScenarioPrivacy,
} from "../hooks/usePersonalConversationScenarios";
import type { PersonalConversationScenario } from "../types";

export default function PersonalDailyEnglish() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [focusedScenarioId, setFocusedScenarioId] = useState<number | null>(
    null,
  );

  // API 훅들
  const { data: allScenarios = [], isLoading: allScenariosLoading } =
    useMyScenarios();
  const { data: categories = [], isLoading: categoriesLoading } =
    useMyCategories();
  const { data: categoryScenarios = [], isLoading: scenariosLoading } =
    useMyScenariosByCategory(activeCategory);

  const deleteScenarioMutation = useDeleteMyScenario();
  const togglePrivacyMutation = useToggleMyScenarioPrivacy();

  // 첫 번째 카테고리로 초기화 또는 "모든 카테고리" 선택
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory("모든 카테고리");
    }
  }, [categories, activeCategory]);

  const filteredScenarios = useMemo(() => {
    if (activeCategory === "모든 카테고리" || !activeCategory) {
      return allScenarios;
    }
    return categoryScenarios;
  }, [activeCategory, allScenarios, categoryScenarios]);

  const handleScenarioSelect = (scenario: PersonalConversationScenario) => {
    setFocusedScenarioId(scenario.id);
  };

  const handleStartScenario = (scenario: PersonalConversationScenario) => {
    setFocusedScenarioId(scenario.id);

    // DailyEnglishConversation과 호환되는 형식으로 변환
    const legacyScenario = {
      id: scenario.id.toString(),
      category: scenario.category,
      title: scenario.title,
      description: scenario.description,
    };

    // 기존 DailyEnglishConversation 컴포넌트와 호환되도록 동일한 키 사용
    sessionStorage.setItem("dailyExamScenario", JSON.stringify(legacyScenario));
    navigate("/daily-english-conversation", {
      state: {
        scenario: legacyScenario,
        fullScenario: scenario,
      },
    });
  };

  const handleCreateScenario = () => {
    navigate("/personal-daily-english/create");
  };

  const handleEditScenario = (scenario: PersonalConversationScenario) => {
    navigate(`/personal-daily-english/edit/${scenario.id}`);
  };

  const handleDeleteScenario = async (
    scenario: PersonalConversationScenario,
  ) => {
    if (confirm(`"${scenario.title}" 시나리오를 삭제하시겠습니까?`)) {
      try {
        await deleteScenarioMutation.mutateAsync(scenario.id);
      } catch (error) {
        console.error("시나리오 삭제 실패:", error);
        alert("시나리오 삭제에 실패했습니다.");
      }
    }
  };

  const handleTogglePrivacy = async (
    scenario: PersonalConversationScenario,
  ) => {
    try {
      await togglePrivacyMutation.mutateAsync(scenario.id);
    } catch (error) {
      console.error("공개 설정 변경 실패:", error);
      alert("공개 설정 변경에 실패했습니다.");
    }
  };

  const isLoading =
    allScenariosLoading || categoriesLoading || scenariosLoading;
  const hasNoData = !allScenariosLoading && allScenarios.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/my-study")}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">내 학습</span>
              </Button>
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <span className="text-sm">📝</span>
              </div>
              <h1 className="text-lg font-semibold text-foreground">
                내 시나리오
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/conversation-scenario-templates")}
                className="flex items-center gap-2"
              >
                <RectangleStackIcon className="h-4 w-4" />
                <span className="hidden sm:inline">시나리오 템플릿</span>
              </Button>
              <HeaderAuthControls />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              개인 회화 시나리오
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                disabled={isLoading}
              >
                시나리오 둘러보기
              </Button>
              <Button
                size="sm"
                onClick={handleCreateScenario}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />새 시나리오
              </Button>
            </div>
          </div>

          {hasNoData ? (
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-foreground">
                  첫 번째 시나리오를 만들어보세요
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  개인 맞춤형 영어 회화 시나리오를 직접 만들고 연습할 수
                  있습니다.
                </p>
                <Button onClick={handleCreateScenario} className="mt-4">
                  <PlusIcon className="h-4 w-4 mr-2" />첫 시나리오 만들기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allScenarios.slice(0, 6).map((scenario) => (
                <Card key={scenario.id} className="relative group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {scenario.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-blue-600">
                            {scenario.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {scenario.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePrivacy(scenario)}
                          className="h-6 w-6 p-0"
                          title={scenario.isPrivate ? "비공개" : "공개"}
                        >
                          {scenario.isPrivate ? (
                            <EyeSlashIcon className="h-3 w-3" />
                          ) : (
                            <EyeIcon className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditScenario(scenario)}
                          className="h-6 w-6 p-0"
                          title="편집"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteScenario(scenario)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                          title="삭제"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {scenario.description}
                    </p>
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => handleStartScenario(scenario)}
                    >
                      🎤 대화 시작
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {allScenarios.length > 6 && (
            <div className="text-center">
              <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                모든 시나리오 보기 ({allScenarios.length}개)
              </Button>
            </div>
          )}
        </div>
      </div>

      <FullScreenSlideDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="내 시나리오 목록"
      >
        <div className="h-full overflow-y-auto bg-background">
          <div className="px-4 py-6 sm:px-6">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="flex flex-1 flex-nowrap gap-2 overflow-x-auto pb-1">
                  <Button
                    size="sm"
                    variant={
                      activeCategory === "모든 카테고리" ? "default" : "outline"
                    }
                    onClick={() => setActiveCategory("모든 카테고리")}
                    className="whitespace-nowrap"
                    disabled={isLoading}
                  >
                    모든 카테고리
                  </Button>
                  {categories.map((category) => {
                    const isActiveCategory = activeCategory === category;
                    return (
                      <Button
                        key={category}
                        size="sm"
                        variant={isActiveCategory ? "default" : "outline"}
                        onClick={() => setActiveCategory(category)}
                        className={`whitespace-nowrap ${
                          isActiveCategory
                            ? "shadow-md ring-2 ring-blue-200"
                            : ""
                        }`}
                        disabled={isLoading}
                      >
                        {category}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  size="sm"
                  onClick={handleCreateScenario}
                  className="flex-shrink-0 flex items-center gap-1"
                >
                  <PlusIcon className="h-3 w-3" />
                  새로 만들기
                </Button>
              </div>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {activeCategory === "모든 카테고리"
                    ? "전체 시나리오"
                    : activeCategory}
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({filteredScenarios.length}개)
                  </span>
                </h3>

                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      시나리오를 불러오는 중...
                    </p>
                  </div>
                ) : filteredScenarios.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {activeCategory === "모든 카테고리"
                        ? "아직 만든 시나리오가 없습니다."
                        : `${activeCategory} 카테고리에 시나리오가 없습니다.`}
                    </p>
                    <Button size="sm" onClick={handleCreateScenario}>
                      첫 시나리오 만들기
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredScenarios.map((scenario) => {
                      const isSelected = focusedScenarioId === scenario.id;
                      return (
                        <div
                          key={scenario.id}
                          className={`group relative rounded-md transition-all duration-200 ${
                            isSelected
                              ? "bg-primary/8 ring-1 ring-primary/20"
                              : "bg-background hover:bg-muted/50"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleScenarioSelect(scenario)}
                            className="w-full p-4 text-left pr-24"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-foreground">
                                {scenario.title}
                              </span>
                              {scenario.isPrivate ? (
                                <EyeSlashIcon
                                  className="h-3 w-3 text-muted-foreground"
                                  title="비공개"
                                />
                              ) : (
                                <EyeIcon
                                  className="h-3 w-3 text-green-600"
                                  title="공개"
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-blue-600 font-medium">
                                {scenario.category}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {scenario.difficulty}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {scenario.description}
                            </p>
                          </button>

                          <div className="absolute top-3 right-3 flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditScenario(scenario)}
                              className="h-6 px-2 text-xs"
                            >
                              편집
                            </Button>
                            <Button
                              size="sm"
                              variant={isSelected ? "default" : "outline"}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartScenario(scenario);
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              시작
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </FullScreenSlideDialog>
    </div>
  );
}
