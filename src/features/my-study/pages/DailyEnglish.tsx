import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChartBarIcon,
  Cog6ToothIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import FullScreenSlideDialog from "../../../components/ui/FullScreenSlideDialog";
import { Button } from "../../../components/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import {
  useAllCategories,
  useScenariosByCategory,
  useRandomScenarios,
  useAllScenarios,
} from "../shared/hooks/useConversationScenarios";
import type { ConversationScenario } from "../shared/types";
import CreateDefaultScenariosButton from "../shared/components/CreateDefaultScenariosButton";
import DeleteAllScenariosButton from "../shared/components/DeleteAllScenariosButton";
import { MyStudyHeader } from "../web";

const CATEGORY_LABELS: Record<string, string> = {
  "일상생활 (Everyday Life)": "일상생활",
  "사회생활 및 관계 (Social Life & Relationships)": "사회생활 · 관계",
  "비즈니스 및 학업 (Business & Academic)": "비즈니스 · 학업",
};

export default function MyStudyDashboard() {
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
  const {
    data: allScenarios = [] as ConversationScenario[],
    isLoading: allScenariosLoading,
  } = useAllScenarios();
  const {
    data: categories = [] as string[],
    isLoading: categoriesLoading,
  } = useAllCategories();
  const {
    data: categoryScenarios = [] as ConversationScenario[],
    isLoading: scenariosLoading,
  } = useScenariosByCategory(activeCategory);
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

  const filteredScenarios = useMemo<ConversationScenario[]>(
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
    <div className="min-h-screen bg-gray-50">
      <MyStudyHeader />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 환영 메시지 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            안녕하세요! 오늘도 학습해볼까요? 📚
          </h1>
          <p className="text-gray-600">
            지금까지 많은 학습을 완료했고, 꾸준히 학습하고 있어요!
          </p>
        </div>

        {/* 학습 현황 */}
        <div className="mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">학습 현황</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">
                  7시간 15분
                </div>
                <div className="text-xs text-gray-500">총 학습 시간</div>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <FireIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">5일</div>
                <div className="text-xs text-gray-500">연속 학습일</div>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">87.5점</div>
                <div className="text-xs text-gray-500">평균 점수</div>
              </div>

              <div className="text-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <ChartBarIcon className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-lg font-bold text-gray-900">2개</div>
                <div className="text-xs text-gray-500">오늘 완료</div>
              </div>
            </div>

            {/* 주간 목표 진행률 */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  이번 주 목표
                </span>
                <span className="text-sm text-gray-500">10시간 중 7시간</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: "70%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 실행 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">빠른 실행</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/daily-english")}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🇺🇸</div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">일일 영어</h3>
                  <p className="text-sm text-gray-600">오늘의 영어 학습</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/daily-english-conversation")}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">💬</div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">영어 회화</h3>
                  <p className="text-sm text-gray-600">실시간 대화 연습</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/quiz-list")}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎧</div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">듣기 시험</h3>
                  <p className="text-sm text-gray-600">영어 듣기 능력 테스트</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {!hasNoData && (
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                시나리오personal-daily-english
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
