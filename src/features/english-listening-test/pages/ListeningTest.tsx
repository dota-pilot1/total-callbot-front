import { useState, useMemo } from "react";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useSearchParams } from "react-router-dom";
import { ListeningSettingsDialog, ListeningHeader } from "../components";
import { useTestQuestions } from "../hooks/useListeningTests";
import { Button } from "../../../components/ui";
import { convertToQuestion, type Question } from "../types";

export default function ListeningTest() {
  const [searchParams] = useSearchParams();
  const testId = Number(searchParams.get("testId")) || 1;

  const {
    data: apiQuestions = [],
    isLoading,
    error,
  } = useTestQuestions(testId);

  // API 데이터를 UI용 Question 형태로 변환
  const englishQuestions = useMemo(() => {
    return apiQuestions.map(convertToQuestion);
  }, [apiQuestions]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 듣기 설정 상태
  const [speechRate, setSpeechRate] = useState(0.8);
  const [autoRepeat, setAutoRepeat] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [difficulty, setDifficulty] = useState<
    "beginner" | "intermediate" | "advanced"
  >("intermediate");

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ListeningHeader />
        <div className="max-w-2xl mx-auto p-4">
          <div className="rounded-lg border bg-card p-6 shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              시험 문제를 불러오는 중...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <ListeningHeader />
        <div className="max-w-2xl mx-auto p-4">
          <div className="rounded-lg border bg-card p-6 shadow-lg text-center">
            <div className="text-destructive text-lg mb-4">
              ❌ 시험 문제를 불러오는데 실패했습니다
            </div>
            <p className="text-muted-foreground mb-4">
              네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
            </p>
            <Button
              onClick={() => (window.location.href = "/quiz-list")}
              variant="outline"
            >
              시험 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 문제가 없는 경우
  if (englishQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <ListeningHeader />
        <div className="max-w-2xl mx-auto p-4">
          <div className="rounded-lg border bg-card p-6 shadow-lg text-center">
            <div className="text-muted-foreground text-lg mb-4">
              📝 이 시험에는 아직 문제가 없습니다
            </div>
            <Button
              onClick={() => (window.location.href = "/quiz-list")}
              variant="outline"
            >
              시험 목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const question = englishQuestions[currentQuestion];

  const playAudio = () => {
    if ("speechSynthesis" in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(question.audioText);
      utterance.lang = "en-US";
      utterance.rate = speechRate;
      utterance.onend = () => {
        setIsPlaying(false);
        // 자동 반복 기능
        if (autoRepeat) {
          setTimeout(() => {
            if ("speechSynthesis" in window) {
              const repeatUtterance = new SpeechSynthesisUtterance(
                question.audioText,
              );
              repeatUtterance.lang = "en-US";
              repeatUtterance.rate = speechRate;
              speechSynthesis.speak(repeatUtterance);
            }
          }, 1000);
        }
      };
      speechSynthesis.speak(utterance);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    console.log("Answer selected:", answerIndex);
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    console.log("handleNext called");
    console.log("selectedAnswer:", selectedAnswer);
    console.log("question.correct:", question.correct);
    console.log("Is correct?", selectedAnswer === question.correct);

    if (selectedAnswer === question.correct) {
      setScore(score + 1);
      console.log("Score increased to:", score + 1);
    }

    if (currentQuestion < englishQuestions.length - 1) {
      console.log("Moving to next question");
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      console.log("Showing results");
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="rounded-lg border bg-card p-8 shadow-lg text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              🎉 시험 완료!
            </h2>
            <div className="text-6xl font-bold text-primary mb-4">
              {score}/{englishQuestions.length}
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              정답률: {Math.round((score / englishQuestions.length) * 100)}%
            </p>
            <Button onClick={handleRestart} variant="outline" size="lg">
              다시 시작
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ListeningHeader
        showSettingsButton={true}
        onSettingsClick={() => setShowSettings(true)}
      />

      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              문제 {currentQuestion + 1} / {englishQuestions.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              점수: {score}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / englishQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-lg mb-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              🎧 영어 듣기
            </h2>
            <Button
              onClick={playAudio}
              disabled={isPlaying}
              variant="outline"
              size="lg"
              className="inline-flex items-center space-x-2"
            >
              <PlayIcon className="w-5 h-5" />
              <span>{isPlaying ? "재생 중..." : "▶ 듣기"}</span>
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              버튼을 클릭해서 영어 문장을 들어보세요
            </p>
            {showSubtitles && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground italic">
                  "{question.audioText}"
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {question.question}
          </h3>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-lg mb-6">
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedAnswer === index
                    ? "border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-200"
                    : "border-border hover:border-gray-400 text-foreground hover:bg-muted"
                }`}
              >
                <span className="font-medium">
                  {String.fromCharCode(65 + index)}. {option}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            variant="outline"
            size="lg"
          >
            {currentQuestion < englishQuestions.length - 1
              ? "다음 문제"
              : "결과 보기"}
          </Button>
        </div>
      </div>

      {/* 듣기 설정 다이얼로그 */}
      <ListeningSettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        speechRate={speechRate}
        onSpeechRateChange={setSpeechRate}
        autoRepeat={autoRepeat}
        onAutoRepeatChange={setAutoRepeat}
        showSubtitles={showSubtitles}
        onShowSubtitlesChange={setShowSubtitles}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
      />
    </div>
  );
}
