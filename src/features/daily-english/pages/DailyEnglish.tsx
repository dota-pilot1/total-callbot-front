import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cog6ToothIcon,
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
  useAllCategories,
  useScenariosByCategory,
  useRandomScenarios,
  useAllScenarios,
} from "../hooks/useConversationScenarios";
import type { ConversationScenario } from "../types";
import CreateDefaultScenariosButton from "../components/CreateDefaultScenariosButton";
import DeleteAllScenariosButton from "../components/DeleteAllScenariosButton";

const CATEGORY_LABELS: Record<string, string> = {
  "일상생활 (Everyday Life)": "일상생활",
  "사회생활 및 관계 (Social Life & Relationships)": "사회생활 · 관계",
  "비즈니스 및 학업 (Business & Academic)": "비즈니스 · 학업",
};

export default function DailyEnglish() {
  const navigate = useNavigate();
  const [isBasicDialogOpen, setIsBasicDialogOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [focusedScenarioId, setFocusedScenarioId] = useState<number | null>(
    null,
  );
  const [generatedScenarios, setGeneratedScenarios] = useState<
    ConversationScenario[]
  >([]);

  // API 훅들
  const { data: allScenarios = [], isLoading: allScenariosLoading } =
    useAllScenarios();
  const { data: categories = [], isLoading: categoriesLoading } =
    useAllCategories();
  const { data: categoryScenarios = [], isLoading: scenariosLoading } =
    useScenariosByCategory(activeCategory);
  const {
    data: randomScenarios,
    refetch: generateRandomScenarios,
    isLoading: randomLoading,
  } = useRandomScenarios({
    category: activeCategory,
    count: 3,
  });

  // 첫 번째 카테고리로 초기화
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
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

  const filteredScenarios = useMemo(
    () => categoryScenarios,
    [categoryScenarios],
  );

  const handleScenarioSelect = (scenario: ConversationScenario) => {
    setFocusedScenarioId(scenario.id);
  };

  const handleOpenBasicSettings = () => {
    console.log("베이직 모드 설정은 준비 중입니다.");
  };

  const handleGenerateScenario = async () => {
    if (!activeCategory) return;
    await generateRandomScenarios();
  };

  const handleStartScenario = (scenario: ConversationScenario) => {
    setFocusedScenarioId(scenario.id);

    // sessionStorage에 저장할 데이터 변환
    const legacyScenario = {
      id: scenario.id.toString(),
      category: scenario.category,
      title: scenario.title,
      description: scenario.description,
    };

    sessionStorage.setItem("dailyExamScenario", JSON.stringify(legacyScenario));
    navigate("/daily-english-conversation", {
      state: {
        scenario: legacyScenario,
        fullScenario: scenario, // 전체 시나리오 정보도 전달
      },
    });
  };

  const isLoading =
    allScenariosLoading ||
    categoriesLoading ||
    scenariosLoading ||
    randomLoading;

  // 시나리오 데이터가 없는지 확인
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
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">홈</span>
              </Button>
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <span className="text-sm">🇺🇸</span>
              </div>
              <h1 className="text-lg font-semibold text-foreground">
                일일 영어
              </h1>
            </div>
            <div className="flex items-center gap-2">
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
          {!hasNoData && (
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                베이직 회화 연습
              </h2>
              <div className="flex items-center gap-2">
                <DeleteAllScenariosButton onSuccess={() => {}} />
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
            <CreateDefaultScenariosButton
              onSuccess={() => {
                // 성공 후 아무것도 하지 않음 (자동으로 데이터 새로고침됨)
              }}
            />
          ) : generatedScenarios.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {generatedScenarios.map((scenario, index) => (
                <Card key={scenario.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>주제 {index + 1}</CardTitle>
                      <span className="text-xs font-medium text-blue-600">
                        {CATEGORY_LABELS[scenario.category] ??
                          scenario.category}
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
                  베이직 회화 연습을 시작하려면 상황을 선택해주세요.
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
        title="베이직 회화 상황 선택"
      >
        <div className="h-full overflow-y-auto bg-background">
          <div className="px-4 py-6 sm:px-6">
            {hasNoData ? (
              <CreateDefaultScenariosButton
                onSuccess={() => {
                  // 성공 후 다이얼로그 닫기
                  setIsBasicDialogOpen(false);
                }}
              />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  연습하고 싶은 상황을 선택하면 해당 주제에 맞는 기본 회화
                  문제가 제공됩니다.
                </p>

                <div className="mt-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 flex-nowrap gap-2 overflow-x-auto pb-1">
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
                            {CATEGORY_LABELS[category] ?? category}
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
                      aria-label="베이직 설정"
                      disabled={isLoading}
                    >
                      <Cog6ToothIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="flex-shrink-0"
                      onClick={handleGenerateScenario}
                      disabled={isLoading || !activeCategory}
                    >
                      {isLoading ? "생성 중..." : "생성"}
                    </Button>
                  </div>

                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      {CATEGORY_LABELS[activeCategory] ?? activeCategory}
                    </h3>

                    {scenariosLoading ? (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                          시나리오를 불러오는 중...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredScenarios.map((item) => {
                          const isSelected = focusedScenarioId === item.id;

                          return (
                            <div
                              key={item.id}
                              className={`group relative rounded-md transition-all duration-200 ${
                                isSelected
                                  ? "bg-primary/8 ring-1 ring-primary/20"
                                  : "bg-background hover:bg-muted/50"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleScenarioSelect(item)}
                                className="w-full p-4 text-left pr-16"
                              >
                                <div className="text-sm font-medium text-foreground mb-2">
                                  {item.title}
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {item.description}
                                </p>
                              </button>

                              <Button
                                size="sm"
                                variant={isSelected ? "default" : "outline"}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartScenario(item);
                                }}
                                className="absolute top-3 right-3 h-6 px-2 text-xs opacity-80 group-hover:opacity-100 transition-opacity"
                              >
                                선택
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              </>
            )}
          </div>
        </div>
      </FullScreenSlideDialog>
    </div>
  );
}
