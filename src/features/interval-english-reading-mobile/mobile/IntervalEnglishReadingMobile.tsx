import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import {
  BookOpenIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { ReadingDifficulty } from "../types";
import type { ReadingDifficulty as ReadingDifficultyType } from "../types";
import {
  useGetAllTests,
  useGetTestsByDifficulty,
  useGetActiveUserSessions,
  useSearchTestsByKeyword,
  useGenerateTestData,
} from "../api/hooks";
import { IntervalReadingHeader } from "../components/IntervalReadingHeader";

const IntervalEnglishReadingMobile: React.FC = () => {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    ReadingDifficultyType | "all"
  >("all");
  const [isSearching, setIsSearching] = useState(false);

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
  };

  const handleKeywordKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleDifficultyChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    handleDifficultyFilter(event.target.value as ReadingDifficultyType | "all");
  };

  // TanStack Query hooks
  const {
    data: allTests = [],
    isLoading: isLoadingAllTests,
    error: allTestsError,
  } = useGetAllTests();

  const { data: filteredTests = [], isLoading: isLoadingFilteredTests } =
    useGetTestsByDifficulty(
      selectedDifficulty !== "all"
        ? (selectedDifficulty as ReadingDifficultyType)
        : ReadingDifficulty.BEGINNER,
      selectedDifficulty !== "all",
    );

  const { data: searchResults = [], isLoading: isLoadingSearch } =
    useSearchTestsByKeyword(searchKeyword, {
      enabled: isSearching && searchKeyword.length > 0,
    });

  const { data: activeSessions = [], isLoading: isLoadingActiveSessions } =
    useGetActiveUserSessions();

  const generateTestDataMutation = useGenerateTestData();

  // 현재 표시할 테스트 데이터 결정
  const getCurrentTests = () => {
    if (isSearching && searchKeyword.length > 0) {
      return searchResults;
    }
    if (selectedDifficulty !== "all") {
      return filteredTests;
    }
    return allTests;
  };

  const tests = getCurrentTests();
  const isLoading =
    isLoadingAllTests ||
    isLoadingFilteredTests ||
    isLoadingSearch ||
    generateTestDataMutation.isPending;

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };

  const handleDifficultyFilter = (
    difficulty: ReadingDifficultyType | "all",
  ) => {
    setSelectedDifficulty(difficulty);
    setIsSearching(false);
    setSearchKeyword("");
  };

  const handleGenerateTestData = () => {
    generateTestDataMutation.mutate();
  };

  const startTest = (testId: number) => {
    navigate(`/interval-english-reading-mobile/test/${testId}`);
  };

  const resumeSession = (sessionUuid: string) => {
    navigate(`/interval-english-reading-mobile/session/${sessionUuid}`);
  };

  const getDifficultyBadgeVariant = (difficulty: ReadingDifficultyType) => {
    switch (difficulty) {
      case ReadingDifficulty.BEGINNER:
        return "secondary";
      case ReadingDifficulty.INTERMEDIATE:
        return "default";
      case ReadingDifficulty.ADVANCED:
        return "destructive";
      default:
        return "outline";
    }
  };

  const getDifficultyLabel = (difficulty: ReadingDifficultyType) => {
    switch (difficulty) {
      case ReadingDifficulty.BEGINNER:
        return "초급";
      case ReadingDifficulty.INTERMEDIATE:
        return "중급";
      case ReadingDifficulty.ADVANCED:
        return "고급";
      default:
        return difficulty;
    }
  };

  if (isLoading && !generateTestDataMutation.isPending) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <IntervalReadingHeader />

      <div className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex flex-col gap-4 mb-6">
          <Button
            onClick={() => navigate("/interval-english-reading-mobile/create")}
            className="w-full flex items-center justify-center gap-2"
            size="sm"
          >
            <PlusIcon className="h-4 w-4" />새 독해 테스트 만들기
          </Button>

          {/* Search */}
          <div className="space-y-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="독해 테스트 검색..."
                value={searchKeyword}
                onChange={handleKeywordChange}
                onKeyDown={handleKeywordKeyDown}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedDifficulty}
                onChange={handleDifficultyChange}
                className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">전체</option>
                <option value={ReadingDifficulty.BEGINNER}>초급</option>
                <option value={ReadingDifficulty.INTERMEDIATE}>중급</option>
                <option value={ReadingDifficulty.ADVANCED}>고급</option>
              </select>
              <Button onClick={handleSearch} variant="outline" size="sm">
                <MagnifyingGlassIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        {!isLoadingActiveSessions && activeSessions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">진행 중인 세션</h2>
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <Card key={session.sessionUuid} className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {session.testTitle}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ClockIcon className="h-4 w-4" />
                      진행률: {session.completionPercentage?.toFixed(1) || 0}%
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      onClick={() => resumeSession(session.sessionUuid)}
                      className="w-full"
                      size="sm"
                    >
                      이어서 읽기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reading Tests */}
        <div>
          <h2 className="text-lg font-semibold mb-3">독해 테스트</h2>

          {/* Error State */}
          {allTestsError && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-destructive mb-4 text-sm">
                  데이터를 불러오는 중 오류가 발생했습니다.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                >
                  다시 시도
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!allTestsError && tests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpenIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4 text-sm">
                  {searchKeyword
                    ? "검색 결과가 없습니다."
                    : "아직 독해 테스트가 없습니다."}
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={handleGenerateTestData}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={generateTestDataMutation.isPending}
                  >
                    {generateTestDataMutation.isPending
                      ? "생성 중..."
                      : "샘플 테스트 데이터 생성"}
                  </Button>
                  <Button
                    onClick={() =>
                      navigate("/interval-english-reading-mobile/create")
                    }
                    size="sm"
                    className="w-full"
                  >
                    첫 번째 테스트 만들기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Tests List */
            <div className="space-y-4">
              {Array.isArray(tests) &&
                tests.map((test) => (
                  <Card key={test.id} className="w-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-base line-clamp-2">
                          {test.title}
                        </CardTitle>
                        <Badge
                          variant={getDifficultyBadgeVariant(test.difficulty)}
                          className="text-xs"
                        >
                          {getDifficultyLabel(test.difficulty)}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm line-clamp-2">
                        {test.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <BookOpenIcon className="h-4 w-4" />
                          {test.totalQuestions || 0}문제
                        </div>
                        {test.timeLimitMinutes && test.timeLimitMinutes > 0 && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ClockIcon className="h-4 w-4" />
                            제한시간: {test.timeLimitMinutes}분
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => startTest(test.id)}
                        className="w-full"
                        size="sm"
                      >
                        독해 시작
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntervalEnglishReadingMobile;
