import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui";
import { Button } from "../../../components/ui";
import type { Mission, MissionQuiz } from "../types";

const sampleMissions: Mission[] = [
  {
    id: "1",
    title: "독서 마스터",
    description:
      "매일 30분씩 책을 읽어 지식을 넓히고 사고력을 기르는 미션입니다.",
    difficulty: "easy",
    category: "learning",
    points: 10,
  },
  {
    id: "2",
    title: "운동 챔피언",
    description:
      "주 3회 이상 30분씩 운동하여 건강한 몸과 마음을 기르는 미션입니다.",
    difficulty: "medium",
    category: "health",
    points: 20,
  },
  {
    id: "3",
    title: "새로운 언어 마스터",
    description:
      "새로운 언어를 배우고 기초 회화까지 익히는 도전적인 미션입니다.",
    difficulty: "hard",
    category: "skill",
    points: 50,
  },
];

const sampleQuizzes: MissionQuiz[] = [
  {
    id: "1",
    question: "목표를 달성하기 위해 가장 중요한 요소는 무엇인가요?",
    options: ["완벽한 계획", "꾸준한 실행", "큰 목표", "남들의 인정"],
    correctAnswer: 1,
    explanation:
      "목표 달성에는 꾸준한 실행이 가장 중요합니다. 작은 단계라도 매일 실행하는 것이 성공의 열쇠입니다.",
  },
  {
    id: "2",
    question: "새로운 습관을 만들기 위해 필요한 최소 기간은?",
    options: ["7일", "21일", "66일", "100일"],
    correctAnswer: 2,
    explanation:
      "연구에 따르면 새로운 습관이 자동화되기까지는 평균 66일이 걸린다고 합니다.",
  },
  {
    id: "3",
    question: "미션 수행 시 가장 효과적인 방법은?",
    options: ["한 번에 많이", "매일 조금씩", "기분 좋을 때만", "주말에 몰아서"],
    correctAnswer: 1,
    explanation:
      "매일 조금씩 꾸준히 하는 것이 가장 효과적입니다. 일관성이 성공의 핵심입니다.",
  },
];

export default function HistoryPage() {
  const [currentTab, setCurrentTab] = useState<"missions" | "quiz">("missions");
  const [currentQuiz, setCurrentQuiz] = useState<MissionQuiz | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCount, setQuizCount] = useState(0);

  const startRandomQuiz = () => {
    const randomQuiz =
      sampleQuizzes[Math.floor(Math.random() * sampleQuizzes.length)];
    setCurrentQuiz(randomQuiz);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null || !currentQuiz) return;

    setShowResult(true);
    setQuizCount(quizCount + 1);

    if (selectedAnswer === currentQuiz.correctAnswer) {
      setScore(score + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🎯 미션 센터</CardTitle>
            <div className="flex justify-center gap-2">
              <Button
                variant={currentTab === "missions" ? "default" : "outline"}
                onClick={() => setCurrentTab("missions")}
              >
                미션 목록
              </Button>
              <Button
                variant={currentTab === "quiz" ? "default" : "outline"}
                onClick={() => setCurrentTab("quiz")}
              >
                퀴즈
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {currentTab === "missions" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">도전해볼 미션들</h3>
                {sampleMissions.map((mission) => (
                  <Card key={mission.id} className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg">{mission.title}</h4>
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            mission.difficulty === "easy"
                              ? "bg-green-100 text-green-800"
                              : mission.difficulty === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {mission.difficulty === "easy"
                            ? "쉬움"
                            : mission.difficulty === "medium"
                              ? "보통"
                              : "어려움"}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-2">
                        {mission.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {mission.category === "learning"
                              ? "학습"
                              : mission.category === "health"
                                ? "건강"
                                : "스킬"}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-blue-600">
                          +{mission.points} 포인트
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {currentTab === "quiz" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-lg font-medium text-muted-foreground mb-4">
                    점수: {score}/{quizCount}
                  </div>
                </div>

                {!currentQuiz ? (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      미션 관련 퀴즈를 시작해보세요!
                    </p>
                    <Button onClick={startRandomQuiz} size="lg">
                      퀴즈 시작하기
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Card className="bg-muted/50">
                      <CardContent className="pt-6">
                        <h3 className="text-xl font-bold mb-4">
                          {currentQuiz.question}
                        </h3>
                        <div className="space-y-2">
                          {currentQuiz.options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() =>
                                !showResult && setSelectedAnswer(index)
                              }
                              disabled={showResult}
                              className={`w-full p-3 text-left border rounded-md transition-colors ${
                                selectedAnswer === index
                                  ? showResult
                                    ? index === currentQuiz.correctAnswer
                                      ? "bg-green-100 border-green-500 text-green-800"
                                      : "bg-red-100 border-red-500 text-red-800"
                                    : "bg-blue-100 border-blue-500"
                                  : showResult &&
                                      index === currentQuiz.correctAnswer
                                    ? "bg-green-100 border-green-500 text-green-800"
                                    : "hover:bg-gray-50"
                              }`}
                            >
                              {index + 1}. {option}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {showResult && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-4">
                          <div className="text-blue-800">
                            <div className="font-bold mb-2">
                              {selectedAnswer === currentQuiz.correctAnswer
                                ? "정답입니다! 🎉"
                                : "틀렸습니다 😔"}
                            </div>
                            <p>{currentQuiz.explanation}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={submitAnswer}
                        disabled={selectedAnswer === null || showResult}
                        variant="default"
                      >
                        정답 확인
                      </Button>
                      <Button onClick={startRandomQuiz} variant="outline">
                        다음 문제
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
