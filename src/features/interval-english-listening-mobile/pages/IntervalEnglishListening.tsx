import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LoadingSpinner,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import {
  ClockIcon,
  MagnifyingGlassIcon,
  PlayCircleIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";
import { IntervalListeningHeader } from "../components/IntervalListeningHeader";
import {
  useGenerateTestData,
  useGetActiveUserSessions,
  useGetAllTests,
  useGetTestsByDifficulty,
  useSearchTestsByKeyword,
} from "../api/hooks";
import type {
  IntervalListeningSession,
  IntervalListeningTest,
  ListeningDifficulty as ListeningDifficultyType,
} from "../types";
import { ListeningDifficulty } from "../types";

type DifficultyFilter = ListeningDifficultyType | "all";

const difficultyLabels: Record<ListeningDifficultyType, string> = {
  [ListeningDifficulty.BEGINNER]: "초급",
  [ListeningDifficulty.INTERMEDIATE]: "중급",
  [ListeningDifficulty.ADVANCED]: "고급",
};

const getDifficultyBadgeVariant = (difficulty: ListeningDifficultyType) => {
  switch (difficulty) {
    case ListeningDifficulty.BEGINNER:
      return "secondary";
    case ListeningDifficulty.INTERMEDIATE:
      return "default";
    case ListeningDifficulty.ADVANCED:
      return "destructive";
    default:
      return "outline";
  }
};

const IntervalEnglishListening: React.FC = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyFilter>("all");
  const [isSearching, setIsSearching] = useState(false);

  const {
    data: allTests = [],
    isLoading: isLoadingAllTests,
    error: allTestsError,
  } = useGetAllTests();

  const { data: filteredTests = [], isLoading: isLoadingFilteredTests } =
    useGetTestsByDifficulty(
      selectedDifficulty as ListeningDifficultyType,
      selectedDifficulty !== "all",
    );

  const { data: searchResults = [], isLoading: isLoadingSearch } =
    useSearchTestsByKeyword(searchKeyword.trim(), {
      enabled: isSearching && searchKeyword.trim().length > 0,
    });

  const {
    data: activeSessions = [],
    isLoading: isLoadingActiveSessions,
  } = useGetActiveUserSessions();

  const generateTestDataMutation = useGenerateTestData();

  const tests = useMemo<IntervalListeningTest[]>(() => {
    if (isSearching && searchKeyword.trim()) {
      return searchResults;
    }
    if (selectedDifficulty !== "all") {
      return filteredTests;
    }
    return allTests;
  }, [
    allTests,
    filteredTests,
    isSearching,
    searchKeyword,
    searchResults,
    selectedDifficulty,
  ]);

  const testLookup = useMemo(() => {
    const map = new Map<number, IntervalListeningTest>();
    for (const test of [...allTests, ...filteredTests, ...searchResults]) {
      if (!map.has(test.id)) {
        map.set(test.id, test);
      }
    }
    return map;
  }, [allTests, filteredTests, searchResults]);

  const isLoading =
    isLoadingAllTests ||
    isLoadingFilteredTests ||
    isLoadingSearch ||
    generateTestDataMutation.isPending;

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSearching(Boolean(searchKeyword.trim()));
  };

  const handleClearSearch = () => {
    setSearchKeyword("");
    setIsSearching(false);
  };

  const handleDifficultyFilter = (difficulty: DifficultyFilter) => {
    setSelectedDifficulty(difficulty);
    setIsSearching(false);
    setSearchKeyword("");
  };

  const handleGenerateTestData = () => {
    generateTestDataMutation.mutate();
  };

  const startTest = (testId: number) => {
    navigate(`/interval-listening/test/${testId}`);
  };

  const resumeSession = (session: IntervalListeningSession) => {
    navigate(`/interval-listening/test/${session.testSetId}`, {
      state: { sessionUuid: session.sessionUuid },
    });
  };

  const getCompletionPercentage = (session: IntervalListeningSession) => {
    if (session.totalQuestions <= 0) {
      return 0;
    }
    const answered = Math.max(
      0,
      Math.min(session.totalQuestions, session.currentQuestionNumber - 1),
    );
    return (answered / session.totalQuestions) * 100;
  };

  const formatDate = (value?: string) => {
    if (!value) {
      return "";
    }
    try {
      return new Date(value).toLocaleString("ko-KR");
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <IntervalListeningHeader
        title="인터벌 영어 듣기"
        onBack={() => navigate(-1)}
      />

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                듣기 테스트
              </h2>
              <p className="text-sm text-muted-foreground">
                난이도와 키워드로 원하는 테스트를 찾아보세요.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedDifficulty === "all" ? "default" : "outline"}
                onClick={() => handleDifficultyFilter("all")}
              >
                전체
              </Button>
              {(
                Object.keys(ListeningDifficulty) as ListeningDifficultyType[]
              ).map((difficulty) => (
                <Button
                  key={difficulty}
                  variant={
                    selectedDifficulty === difficulty ? "default" : "outline"
                  }
                  onClick={() => handleDifficultyFilter(difficulty)}
                >
                  {difficultyLabels[difficulty]}
                </Button>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder="테스트 제목 또는 키워드를 입력하세요"
                className="pl-10"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  초기화
                </button>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoadingSearch && isSearching}
              className="sm:w-auto"
            >
              검색
            </Button>
          </form>
        </div>

        {isLoading && (
          <Card>
            <CardContent>
              <LoadingSpinner text="테스트를 불러오는 중입니다..." />
            </CardContent>
          </Card>
        )}

        {!isLoadingActiveSessions && activeSessions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                진행 중인 세션
              </h2>
              <p className="text-sm text-muted-foreground">
                이어서 학습을 계속해보세요.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeSessions.map((session) => {
                const relatedTest = testLookup.get(session.testSetId);
                const completion = getCompletionPercentage(session);

                return (
                  <Card
                    key={session.sessionUuid}
                    className="border-primary/20 shadow-sm"
                  >
                    <CardHeader className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">
                          {relatedTest?.title ?? "듣기 테스트"}
                        </CardTitle>
                        {relatedTest?.difficulty && (
                          <Badge
                            variant={getDifficultyBadgeVariant(
                              relatedTest.difficulty,
                            )}
                          >
                            {difficultyLabels[relatedTest.difficulty]}
                          </Badge>
                        )}
                      </div>

                      <CardDescription className="text-sm text-muted-foreground">
                        진행률 {completion.toFixed(1)}%
                      </CardDescription>
                      {session.startedAt && (
                        <CardDescription className="text-xs">
                          시작: {formatDate(session.startedAt)}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ClockIcon className="h-4 w-4" />
                        총 {session.totalQuestions}문제
                      </div>

                      <Button
                        onClick={() => resumeSession(session)}
                        className="w-full"
                        variant="outline"
                      >
                        <PlayCircleIcon className="mr-2 h-4 w-4" />
                        이어서 듣기
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              테스트 목록
            </h2>
            <Button
              variant="outline"
              onClick={handleGenerateTestData}
              disabled={generateTestDataMutation.isPending}
            >
              {generateTestDataMutation.isPending
                ? "생성 중..."
                : "샘플 데이터 생성"}
            </Button>
          </div>

          {allTestsError && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="mb-4 text-destructive">
                  데이터를 불러오는 중 오류가 발생했습니다.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  다시 시도
                </Button>
              </CardContent>
            </Card>
          )}

          {!allTestsError && !isLoading && tests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <SpeakerWaveIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-4 text-muted-foreground">
                  {searchKeyword
                    ? "검색 결과가 없습니다."
                    : "아직 등록된 듣기 테스트가 없습니다."}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button
                    variant="outline"
                    onClick={handleGenerateTestData}
                    disabled={generateTestDataMutation.isPending}
                  >
                    {generateTestDataMutation.isPending
                      ? "생성 중..."
                      : "샘플 테스트 데이터 생성"}
                  </Button>
                  <Button onClick={() => navigate("/interval-listening/create")}>
                    첫 번째 테스트 만들기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tests.map((test) => {
                const timeLimit = (
                  test as IntervalListeningTest & { timeLimitMinutes?: number }
                ).timeLimitMinutes ?? test.estimatedTimeMinutes;

                return (
                  <Card key={test.id} className="flex h-full flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg leading-tight">
                          {test.title}
                        </CardTitle>
                        <Badge
                          variant={getDifficultyBadgeVariant(test.difficulty)}
                        >
                          {difficultyLabels[test.difficulty]}
                        </Badge>
                      </div>
                      {test.description && (
                        <CardDescription className="line-clamp-3">
                          {test.description}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="flex flex-1 flex-col justify-between space-y-4">
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <SpeakerWaveIcon className="h-4 w-4" />
                          {test.totalQuestions ?? 0}문제
                        </div>
                        {timeLimit && timeLimit > 0 && (
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4" />
                            예상 소요 시간: {timeLimit}분
                          </div>
                        )}
                      </div>

                      <Button onClick={() => startTest(test.id)}>
                        듣기 시작
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { IntervalEnglishListening };
export default IntervalEnglishListening;
