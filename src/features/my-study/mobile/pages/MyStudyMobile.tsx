import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cog6ToothIcon,
  ArrowLeftIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import FullScreenSlideDialog from "../../../../components/ui/FullScreenSlideDialog";
import { Button } from "../../../../components/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/Card";
import { HeaderAuthControls } from "../../../../components/layout/HeaderAuthControls";
import {
  useMyScenarios,
  useMyCategories,
  useMyScenariosByCategory,
  useMyRandomScenarios,
  useCreateMyScenario,
} from "../../../personal-daily-english";
import type { PersonalConversationScenario } from "../../../personal-daily-english";

export default function MyStudyMobile() {
  const navigate = useNavigate();
  const [isBasicDialogOpen, setIsBasicDialogOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [focusedScenarioId, setFocusedScenarioId] = useState<number | null>(
    null,
  );
  const [generatedScenarios, setGeneratedScenarios] = useState<
    PersonalConversationScenario[]
  >([]);

  // API 훅들 - 개인 시나리오용
  const { data: allScenarios = [], isLoading: allScenariosLoading } =
    useMyScenarios();
  const { data: categories = [], isLoading: categoriesLoading } =
    useMyCategories();
  const { data: categoryScenarios = [], isLoading: scenariosLoading } =
    useMyScenariosByCategory(activeCategory);
  const {
    data: randomScenarios,
    isLoading: randomLoading,
  } = useMyRandomScenarios({
    category: activeCategory,
    count: 3,
  });

  const createScenarioMutation = useCreateMyScenario();

  // 첫 번째 카테고리로 초기화 또는 "모든 카테고리" 선택
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory("모든 카테고리");
    }
  }, [categories, activeCategory]);

  // 랜덤 시나리오 생성 결과 처리
  useEffect(() => {
    if (randomScenarios) {
      setGeneratedScenarios(randomScenarios);
      setFocusedScenarioId(randomScenarios[0]?.id ?? null);
      setIsBasicDialogOpen(false);
    }
  }, [randomScenarios]);

  const filteredScenarios = useMemo(() => {
    if (activeCategory === "모든 카테고리" || !activeCategory) {
      return allScenarios;
    }
    return categoryScenarios;
  }, [activeCategory, allScenarios, categoryScenarios]);

  const handleScenarioSelect = (scenario: PersonalConversationScenario) => {
    setFocusedScenarioId(scenario.id);
  };

  const handleOpenBasicSettings = () => {
    console.log("개인 시나리오 설정은 준비 중입니다.");
  };

  const handleStartScenario = (scenario: PersonalConversationScenario) => {
    setFocusedScenarioId(scenario.id);

    // sessionStorage에 저장할 데이터 변환 (DailyEnglishConversation과 호환)
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

  const handleCreateQuickScenario = async () => {
    if (!activeCategory || activeCategory === "모든 카테고리") {
      alert("카테고리를 선택해주세요.");
      return;
    }

    try {
      const quickScenario: Omit<
        PersonalConversationScenario,
        "id" | "createdBy" | "isActive" | "createdAt" | "updatedAt"
      > = {
        category: activeCategory,
        title: `${activeCategory} 연습`,
        description: `${activeCategory} 상황에서의 영어 회화를 연습해보세요.`,
        systemInstructions: `You are a helpful English conversation partner. Help the user practice ${activeCategory} situations in English. Be encouraging and provide natural corrections when needed.`,
        userRole: "학습자",
        aiRole: "영어 대화 파트너",
        scenarioBackground: `${activeCategory} 상황에서의 영어 회화 연습`,
        learningGoals: `${activeCategory}에 필요한 영어 표현 학습`,
        aiKnowledge: "일반적인 영어 회화 및 상황별 표현",
        aiStarts: true,
        openingMessage: `안녕하세요! ${activeCategory} 상황에서의 영어 회화를 연습해볼까요?`,
        difficulty: "INTERMEDIATE",
        expectedTurns: 10,
        conversationStyle: "INFORMAL",
        modalities: ["TEXT"],
        voice: "",
        isPrivate: true,
        isCopy: false,
      };

      const createdScenario =
        await createScenarioMutation.mutateAsync(quickScenario);
      setGeneratedScenarios([createdScenario]);
      setFocusedScenarioId(createdScenario.id);
      setIsBasicDialogOpen(false);
    } catch (error) {
      console.error("빠른 시나리오 생성 실패:", error);
      alert("시나리오 생성에 실패했습니다.");
    }
  };

  const isLoading =
    allScenariosLoading ||
    categoriesLoading ||
    scenariosLoading ||
    randomLoading;
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
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <span className="text-sm">📝</span>
              </div>
              <h1 className="text-lg font-semibold text-foreground">
                내 영어 시나리오
              </h1>
            </div>
            <HeaderAuthControls />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="space-y-6">
          {!hasNoData && (
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                개인 회화 연습
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateScenario}
                  className="flex items-center gap-1"
                >
                  <PlusIcon className="h-3 w-3" />
                  새로 만들기
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBasicDialogOpen(true)}
                  disabled={isLoading}
                >
                  상황 다시 선택하기
                </Button>
              </div>
            </div>
          )}

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
          ) : generatedScenarios.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {generatedScenarios.map((scenario, index) => (
                <Card key={scenario.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>시나리오 {index + 1}</CardTitle>
                      <span className="text-xs font-medium text-orange-600">
                        {scenario.category}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground mt-2">
                      {scenario.title}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
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
          ) : (
            <Card>
              <CardContent className="py-10 text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  개인 회화 연습을 시작하려면 상황을 선택해주세요.
                </p>
                <Button
                  onClick={() => setIsBasicDialogOpen(true)}
                  disabled={isLoading}
                >
                  {isLoading ? "로딩 중..." : "상황 선택하기"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <FullScreenSlideDialog
        isOpen={isBasicDialogOpen}
        onClose={() => setIsBasicDialogOpen(false)}
        title="개인 회화 상황 선택"
      >
        <div className="h-full overflow-y-auto bg-background">
          <div className="px-4 py-6 sm:px-6">
            {hasNoData ? (
              <div className="text-center space-y-4">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-foreground">
                  첫 번째 시나리오를 만들어보세요
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  개인 맞춤형 영어 회화 시나리오를 직접 만들고 연습할 수
                  있습니다.
                </p>
                <Button onClick={handleCreateScenario}>
                  <PlusIcon className="h-4 w-4 mr-2" />첫 시나리오 만들기
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  연습하고 싶은 상황을 선택하면 해당 주제에 맞는 개인 맞춤
                  회화를 시작할 수 있습니다.
                </p>

                <div className="mt-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 flex-nowrap gap-2 overflow-x-auto pb-1">
                      <Button
                        size="sm"
                        variant={
                          activeCategory === "모든 카테고리"
                            ? "default"
                            : "outline"
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
                                ? "shadow-md ring-2 ring-orange-200"
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
                      type="button"
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0"
                      onClick={handleOpenBasicSettings}
                      aria-label="설정"
                      disabled={isLoading}
                    >
                      <Cog6ToothIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="flex-shrink-0"
                      onClick={handleCreateQuickScenario}
                      disabled={
                        isLoading ||
                        !activeCategory ||
                        activeCategory === "모든 카테고리"
                      }
                    >
                      {isLoading ? "생성 중..." : "빠른 생성"}
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
                          시나리오 만들기
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
                                className="w-full p-4 text-left pr-16"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-medium text-foreground">
                                    {scenario.title}
                                  </span>
                                  {scenario.isPrivate && (
                                    <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                                      개인용
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs text-orange-600 font-medium">
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

                              <Button
                                size="sm"
                                variant={isSelected ? "default" : "outline"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartScenario(scenario);
                                }}
                                className="absolute top-3 right-3 h-6 px-2 text-xs opacity-80 group-hover:opacity-100 transition-opacity"
                              >
                                시작
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <div className="pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={handleCreateScenario}
                      className="w-full flex items-center gap-2"
                    >
                      <PlusIcon className="h-4 w-4" />새 시나리오 만들기
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </FullScreenSlideDialog>
    </div>
  );
}
