import { useNavigate } from "react-router-dom";
import {
  BookOpenIcon,
  AcademicCapIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon } from "@heroicons/react/24/solid";
import { ListeningHeader } from "../components";
import { useListeningTests } from "../hooks/useListeningTests";
import { Button } from "../../../components/ui";
import type { ListeningTest } from "../types";

export default function ListeningTestList() {
  const navigate = useNavigate();
  const { data: tests = [], isLoading: loading, error } = useListeningTests();

  const handleStartTest = (testId: number) => {
    navigate(`/quiz?testId=${testId}`);
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER":
        return <BookOpenIcon className="h-5 w-5 sm:h-6 sm:w-6" />;
      case "INTERMEDIATE":
        return <AcademicCapIcon className="h-5 w-5 sm:h-6 sm:w-6" />;
      case "ADVANCED":
        return <TrophyIcon className="h-5 w-5 sm:h-6 sm:w-6" />;
      default:
        return <BookOpenIcon className="h-5 w-5 sm:h-6 sm:w-6" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER":
        return {
          card: "bg-green-50/80 border-green-200/60",
          badge: "bg-green-100 text-green-700 border-green-200",
          button: "bg-green-600 hover:bg-green-700",
          text: "text-green-700",
          icon: "text-green-600",
        };
      case "INTERMEDIATE":
        return {
          card: "bg-blue-50/80 border-blue-200/60",
          badge: "bg-blue-100 text-blue-700 border-blue-200",
          button: "bg-blue-600 hover:bg-blue-700",
          text: "text-blue-700",
          icon: "text-blue-600",
        };
      case "ADVANCED":
        return {
          card: "bg-purple-50/80 border-purple-200/60",
          badge: "bg-purple-100 text-purple-700 border-purple-200",
          button: "bg-purple-600 hover:bg-purple-700",
          text: "text-purple-700",
          icon: "text-purple-600",
        };
      default:
        return {
          card: "bg-muted/50 border-border",
          badge: "bg-muted text-muted-foreground border-border",
          button: "bg-primary hover:bg-primary/90",
          text: "text-muted-foreground",
          icon: "text-muted-foreground",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ListeningHeader />
        <div className="max-w-4xl mx-auto p-4">
          <div className="rounded-lg border bg-card p-6 shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              시험 목록을 불러오는 중...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <ListeningHeader />
        <div className="max-w-4xl mx-auto p-4">
          <div className="rounded-lg border bg-card p-6 shadow-lg text-center">
            <div className="text-destructive text-lg mb-4">
              ❌ 시험 목록을 불러오는데 실패했습니다
            </div>
            <p className="text-muted-foreground mb-4">
              네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <ListeningHeader />

      <div className="max-w-4xl mx-auto px-3 py-6 sm:px-6">
        {/* 안내 메시지 - shadcn/ui 스타일 */}
        <div className="rounded-xl bg-card/95 backdrop-blur-sm p-6 sm:p-8 mb-8 border border-border shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
            🎧 영어 듣기 시험
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            수준에 맞는 듣기 시험을 선택해주세요.
          </p>
        </div>

        {/* 시험 목록 */}
        <div className="space-y-6">
          {tests.map((test: ListeningTest) => {
            const colors = getDifficultyColor(test.difficulty);
            return (
              <div
                key={test.id}
                className={`${colors.card} rounded-lg border shadow-sm hover:shadow-md transition-all duration-200`}
              >
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                    {/* 왼쪽: 정보 */}
                    <div className="flex-1 space-y-4">
                      {/* 헤더 */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`${colors.icon} p-2.5 rounded-md bg-background border`}
                        >
                          {getDifficultyIcon(test.difficulty)}
                        </div>
                        <span
                          className={`${colors.badge} px-3 py-1.5 rounded-md text-sm font-medium border`}
                        >
                          {test.difficultyDisplayName}
                        </span>
                      </div>

                      {/* 제목과 설명 */}
                      <div>
                        <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                          {test.title}
                        </h3>
                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                          {test.description}
                        </p>
                      </div>

                      {/* 정보 태그 */}
                      <div className="flex gap-3">
                        <span className="bg-muted/60 text-muted-foreground px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2">
                          <span>📝</span>
                          <span>{test.totalQuestions}문제</span>
                        </span>
                        <span className="bg-muted/60 text-muted-foreground px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2">
                          <span>⏱️</span>
                          <span>{test.timeLimitMinutes}분</span>
                        </span>
                      </div>
                    </div>

                    {/* 오른쪽: 버튼 */}
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() => handleStartTest(test.id)}
                        className={`${colors.button} text-white rounded-md px-6 py-2.5 sm:px-8 sm:py-3 font-medium text-sm sm:text-base flex items-center gap-2 justify-center w-full sm:w-auto transition-colors`}
                      >
                        <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>시험 시작</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 하단 안내 - shadcn/ui 스타일 */}
        <div className="mt-8 bg-muted/30 rounded-lg p-6 border border-border">
          <div className="flex items-start gap-4">
            <div className="text-primary text-xl shrink-0">💡</div>
            <div className="text-sm sm:text-base">
              <p className="font-semibold mb-3 text-foreground">
                시험 진행 안내
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 브라우저 종료 후에도 이어서 진행 가능</li>
                <li>• 음성은 여러 번 재생할 수 있습니다</li>
                <li>• 시작 전 설정에서 음성 속도 조절 가능</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
