import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  PlayIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { IntervalListeningHeader } from "../components/IntervalListeningHeader";
import { intervalListeningApi } from "../api/intervalListeningApi";
import type { IntervalListeningTest, ListeningDifficulty } from "../types";

const difficultyColors = {
  BEGINNER: "bg-green-100 text-green-800 border-green-200",
  INTERMEDIATE: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ADVANCED: "bg-red-100 text-red-800 border-red-200",
} as const;

const difficultyLabels = {
  BEGINNER: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
} as const;

export function IntervalEnglishListening() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<IntervalListeningTest[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    ListeningDifficulty | "ALL"
  >("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTests();
  }, [selectedDifficulty]);

  const loadTests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let data: IntervalListeningTest[];
      if (selectedDifficulty === "ALL") {
        data = await intervalListeningApi.getAllTests();
      } else {
        data =
          await intervalListeningApi.getTestsByDifficulty(selectedDifficulty);
      }

      setTests(data);
    } catch (err) {
      setError("테스트 목록을 불러오는데 실패했습니다.");
      console.error("Failed to load tests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTest = (testId: number) => {
    navigate(`/interval-listening/test/${testId}`);
  };

  const handleGenerateTestData = async () => {
    try {
      setIsLoading(true);
      await intervalListeningApi.generateTestData();
      await loadTests();
    } catch (err) {
      setError("테스트 데이터 생성에 실패했습니다.");
      console.error("Failed to generate test data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <IntervalListeningHeader />

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* 난이도 필터 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedDifficulty === "ALL" ? "default" : "outline"}
                size="default"
                onClick={() => setSelectedDifficulty("ALL")}
              >
                전체
              </Button>
              {Object.entries(difficultyLabels).map(([value, label]) => (
                <Button
                  key={value}
                  variant={selectedDifficulty === value ? "default" : "outline"}
                  size="default"
                  onClick={() =>
                    setSelectedDifficulty(value as ListeningDifficulty)
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 테스트 데이터 생성 버튼 (개발용) */}
        <Card>
          <CardContent className="p-6">
            <Button
              onClick={handleGenerateTestData}
              disabled={isLoading}
              className="flex items-center gap-2"
              variant="outline"
              size="lg"
            >
              <PlusIcon className="h-5 w-5" />
              테스트 데이터 생성 (개발용)
            </Button>
          </CardContent>
        </Card>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="text-lg text-muted-foreground">로딩 중...</div>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center py-8">
                <div className="text-destructive mb-4 text-lg">{error}</div>
                <Button onClick={loadTests} variant="outline" size="lg">
                  다시 시도
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 테스트 목록 */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-12">
                    <div className="text-center py-12">
                      <QuestionMarkCircleIcon className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                      <div className="text-xl text-muted-foreground mb-6">
                        {selectedDifficulty === "ALL"
                          ? "등록된 테스트가 없습니다."
                          : `${difficultyLabels[selectedDifficulty as ListeningDifficulty]} 레벨의 테스트가 없습니다.`}
                      </div>
                      <Button
                        onClick={handleGenerateTestData}
                        variant="outline"
                        size="lg"
                      >
                        테스트 데이터 생성
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              tests.map((test) => (
                <Card
                  key={test.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl font-semibold leading-tight">
                        {test.title}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={difficultyColors[test.difficulty]}
                      >
                        {difficultyLabels[test.difficulty]}
                      </Badge>
                    </div>
                    {test.description && (
                      <p className="text-muted-foreground mt-3 leading-relaxed">
                        {test.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center gap-6 text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <QuestionMarkCircleIcon className="h-5 w-5" />
                        <span>{test.totalQuestions}문제</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-5 w-5" />
                        <span>약 {test.estimatedTimeMinutes}분</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleStartTest(test.id)}
                      className="w-full flex items-center gap-2"
                      size="lg"
                    >
                      <PlayIcon className="h-5 w-5" />
                      테스트 시작
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
