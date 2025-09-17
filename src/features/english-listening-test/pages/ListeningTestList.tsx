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
        return <BookOpenIcon className="h-8 w-8" />;
      case "INTERMEDIATE":
        return <AcademicCapIcon className="h-8 w-8" />;
      case "ADVANCED":
        return <TrophyIcon className="h-8 w-8" />;
      default:
        return <BookOpenIcon className="h-8 w-8" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER":
        return {
          gradient: "from-green-100 to-green-200",
          border: "border-green-300",
          button: "bg-green-600 hover:bg-green-700",
          text: "text-green-800",
        };
      case "INTERMEDIATE":
        return {
          gradient: "from-blue-100 to-blue-200",
          border: "border-blue-300",
          button: "bg-blue-600 hover:bg-blue-700",
          text: "text-blue-800",
        };
      case "ADVANCED":
        return {
          gradient: "from-purple-100 to-purple-200",
          border: "border-purple-300",
          button: "bg-purple-600 hover:bg-purple-700",
          text: "text-purple-800",
        };
      default:
        return {
          gradient: "from-gray-100 to-gray-200",
          border: "border-gray-300",
          button: "bg-gray-600 hover:bg-gray-700",
          text: "text-gray-800",
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
    <div className="min-h-screen bg-background">
      <ListeningHeader />

      <div className="max-w-4xl mx-auto p-4">
        {/* 안내 메시지 */}
        <div className="rounded-lg border bg-card p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            📚 영어 듣기 시험 선택
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            본인의 영어 수준에 맞는 듣기 시험을 선택해주세요. 각 시험은 TTS
            음성으로 진행되며, 재생 속도와 자막 표시 등을 설정할 수 있습니다.
          </p>
        </div>

        {/* 시험 목록 */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          {tests.map((test: ListeningTest) => {
            const colors = getDifficultyColor(test.difficulty);
            return (
              <div
                key={test.id}
                className={`bg-gradient-to-r ${colors.gradient} border-2 ${colors.border} rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`${colors.text} p-3 rounded-lg bg-white/50`}
                    >
                      {getDifficultyIcon(test.difficulty)}
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${colors.text} mb-2`}>
                        {test.title}
                      </h3>
                      <p className="text-muted-foreground text-lg mb-3">
                        {test.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="bg-white/70 px-3 py-1 rounded-full">
                          📝 {test.totalQuestions}문제
                        </span>
                        <span className="bg-white/70 px-3 py-1 rounded-full">
                          ⏱️ {test.timeLimitMinutes}분
                        </span>
                        <span className="bg-white/70 px-3 py-1 rounded-full font-semibold">
                          🎯 {test.difficultyDisplayName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleStartTest(test.id)}
                    variant="outline"
                    className="inline-flex items-center space-x-2"
                  >
                    <PlayIcon className="w-5 h-5" />
                    <span>시험 시작</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 하단 안내 */}
        <div className="mt-8 rounded-lg border bg-muted/20 p-4">
          <div className="flex items-start space-x-3">
            <div className="text-muted-foreground text-lg">💡</div>
            <div className="text-sm">
              <p className="font-semibold mb-1 text-foreground">
                시험 진행 안내
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  • 시험 중 브라우저를 닫아도 다시 접속하여 이어서 진행할 수
                  있습니다
                </li>
                <li>• 각 문제마다 영어 음성을 여러 번 들을 수 있습니다</li>
                <li>
                  • 시험 시작 전 설정 버튼으로 음성 속도와 자막을 조절하세요
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
