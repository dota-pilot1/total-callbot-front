import React, { useCallback, useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  ClockIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";
import FullScreenSlideDialog from "@/components/ui/FullScreenSlideDialog";
import { intervalListeningApi } from "../api/intervalListeningApi";
import { IntervalListeningHeader } from "../components/IntervalListeningHeader";
import { ListeningSettingsDialog } from "../components/ListeningSettingsDialog";
import TestResultReportForIntervalEnglishListeningTest from "../components/TestResultReportForIntervalEnglishListeningTest";
import type {
  IntervalListeningQuestion,
  IntervalListeningSettings,
  ListeningDifficulty as ListeningDifficultyType,
  SessionResult,
} from "../types";
import { ListeningDifficulty } from "../types";

interface Question {
  id: number;
  questionNumber: number;
  audioText: string;
  questionContent: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer?: string;
  points?: number;
  testSetId?: number;
}

interface TestSet {
  id: number;
  title: string;
  description: string;
  difficulty: ListeningDifficultyType;
  totalQuestions: number;
  estimatedTimeMinutes?: number;
  timeLimitMinutes?: number;
}

interface TestResult {
  sessionUuid: string;
  testSetId: number;
  totalQuestions: number;
  correctAnswers: number;
  totalScore: number;
  sessionStatus: string;
  completedAt: string;
  accuracy: number;
  testTitle?: string;
  timeTaken?: number;
  answers?: {
    questionId: number;
    questionNumber: number;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    points: number;
    responseTimeSeconds?: number;
  }[];
}

const defaultSettings: IntervalListeningSettings = {
  audioSpeed: 1,
  autoPlay: false,
  showTranscript: false,
  autoRepeat: false,
  playbackDelay: 2,
};

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

const IntervalEnglishListeningTest: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const resumeSessionUuid =
    ((location.state as { sessionUuid?: string } | null) ?? {}).sessionUuid ??
    null;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [testSet, setTestSet] = useState<TestSet | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] =
    useState<IntervalListeningSettings>(defaultSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = (text: string) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.lang = "en-US";

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const timeLimitMinutes = useMemo(() => {
    if (!testSet) {
      return null;
    }
    const limit =
      testSet.timeLimitMinutes ?? testSet.estimatedTimeMinutes ?? null;
    return limit && limit > 0 ? limit : null;
  }, [testSet]);

  const loadQuestions = useCallback(async () => {
    if (!testId) {
      setLoading(false);
      return;
    }

    const parsedId = Number(testId);
    if (Number.isNaN(parsedId)) {
      alert("유효하지 않은 테스트 ID입니다.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [questionsData, testSetData] = await Promise.all([
        intervalListeningApi.getQuestionsByTestSet(parsedId),
        intervalListeningApi.getTestById(parsedId),
      ]);

      const normalizedQuestions: Question[] = questionsData.map(
        (
          question: IntervalListeningQuestion & {
            id?: number;
            correctAnswer?: string;
            points?: number;
            testSetId?: number;
          },
        ) => ({
          id: question.questionId ?? question.id ?? 0,
          questionNumber: question.questionNumber,
          audioText: question.audioText,
          questionContent: question.questionContent,
          optionA: question.optionA,
          optionB: question.optionB,
          optionC: question.optionC,
          optionD: question.optionD,
          correctAnswer: question.correctAnswer,
          points: question.points,
          testSetId: question.testSetId ?? parsedId,
        }),
      );

      const normalizedTestSet: TestSet = {
        id: testSetData.id,
        title: testSetData.title,
        description: testSetData.description,
        difficulty: testSetData.difficulty,
        totalQuestions:
          testSetData.totalQuestions ?? normalizedQuestions.length ?? 0,
        estimatedTimeMinutes: testSetData.estimatedTimeMinutes,
        timeLimitMinutes: (testSetData as { timeLimitMinutes?: number })
          .timeLimitMinutes,
      };

      setQuestions(normalizedQuestions);
      setTestSet(normalizedTestSet);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setElapsedTime(0);
      setStartTime(new Date());
      setIsTimerActive(true);
      setShowResultDialog(false);
      setTestResult(null);

      const limit =
        normalizedTestSet.timeLimitMinutes ??
        normalizedTestSet.estimatedTimeMinutes ??
        0;
      setTimeRemaining(limit > 0 ? limit * 60 : null);
    } catch (error) {
      console.error("Failed to load questions:", error);
      alert("문제를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    if (!testId) {
      alert("테스트 정보를 찾을 수 없습니다.");
      return;
    }

    const parsedTestId = Number(testId);
    if (Number.isNaN(parsedTestId)) {
      alert("유효하지 않은 테스트 ID입니다.");
      return;
    }

    const averageResponseTimeSeconds =
      questions.length > 0 ? Math.floor(elapsedTime / questions.length) : 0;

    const createMockResult = (sessionUuid: string): TestResult => {
      const mockResult: TestResult = {
        sessionUuid,
        testSetId: testSet?.id || parsedTestId,
        testTitle: testSet?.title || "영어 듣기 테스트",
        totalQuestions: questions.length,
        correctAnswers: 0,
        totalScore: 0,
        sessionStatus: "COMPLETED",
        completedAt: new Date().toISOString(),
        accuracy: 0,
        timeTaken: elapsedTime,
        answers: questions.map((question) => {
          const correctAnswer = question.correctAnswer ?? "";
          const selectedAnswer = selectedAnswers[question.id] || "";
          const isCorrect = correctAnswer
            ? selectedAnswer === correctAnswer
            : false;
          const pointsAwarded = isCorrect ? (question.points ?? 0) : 0;

          return {
            questionId: question.id,
            questionNumber: question.questionNumber,
            selectedAnswer,
            correctAnswer,
            isCorrect,
            points: pointsAwarded,
            responseTimeSeconds: averageResponseTimeSeconds,
          };
        }),
      };

      if (mockResult.answers && mockResult.answers.length > 0) {
        const correctCount = mockResult.answers.filter(
          (answer) => answer.isCorrect,
        ).length;
        mockResult.correctAnswers = correctCount;
        mockResult.accuracy =
          questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
        mockResult.totalScore = mockResult.answers.reduce(
          (sum, answer) => sum + answer.points,
          0,
        );
      }

      return mockResult;
    };

    try {
      setIsSubmitting(true);
      setIsTimerActive(false);

      let sessionUuid = resumeSessionUuid ?? "";

      if (!sessionUuid) {
        try {
          const sessionResponse = await intervalListeningApi.startSession({
            testSetId: parsedTestId,
          });
          sessionUuid = sessionResponse.sessionUuid;
        } catch (startError) {
          console.error("Failed to start session:", startError);

          if (
            isAxiosError(startError) &&
            typeof startError.response?.data?.sessionUuid === "string"
          ) {
            sessionUuid = startError.response.data.sessionUuid;
          }

          if (!sessionUuid) {
            setTestResult(createMockResult("mock-session"));
            setShowResultDialog(true);
            return;
          }
        }
      }

      for (const question of questions) {
        const selectedAnswer = selectedAnswers[question.id];
        if (!selectedAnswer) {
          continue;
        }

        try {
          await intervalListeningApi.submitAnswer(sessionUuid, {
            questionId: question.id,
            selectedAnswer,
            responseTimeSeconds: averageResponseTimeSeconds,
          });
        } catch (submitError) {
          console.error(
            `Failed to submit answer for question ${question.id}:`,
            submitError,
          );
        }
      }

      try {
        const rawResult: SessionResult & { testTitle?: string } =
          await intervalListeningApi.getSessionResult(sessionUuid);
        const normalizedResult: TestResult = {
          ...rawResult,
          testTitle:
            rawResult.testTitle ?? testSet?.title ?? "영어 듣기 테스트",
          answers: rawResult.answers?.map((answer) => ({
            ...answer,
          })),
        };
        setTestResult(normalizedResult);
        setShowResultDialog(true);
      } catch (resultError) {
        console.error("Failed to get test result:", resultError);
        setTestResult(createMockResult(sessionUuid));
        setShowResultDialog(true);
      }
    } catch (error) {
      console.error("Submit failed:", error);
      alert("답안 제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    elapsedTime,
    isSubmitting,
    questions,
    resumeSessionUuid,
    selectedAnswers,
    testId,
    testSet,
  ]);

  useEffect(() => {
    if (!isTimerActive) {
      return;
    }

    const timer = window.setInterval(() => {
      if (!startTime) {
        return;
      }

      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(elapsed);

      if (timeLimitMinutes) {
        const totalSeconds = timeLimitMinutes * 60;
        const remaining = totalSeconds - elapsed;

        if (remaining <= 0) {
          setTimeRemaining(0);
          setIsTimerActive(false);
          handleSubmit();
        } else {
          setTimeRemaining(remaining);
        }
      }
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [handleSubmit, isTimerActive, startTime, timeLimitMinutes]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    }

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleBack = () => {
    navigate("/interval-listening");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-4xl">
          <div className="py-10 text-center">
            <p className="text-muted-foreground">
              테스트를 불러오는 중입니다...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-4 py-10 text-center">
            <p className="text-muted-foreground">문제를 찾을 수 없습니다.</p>
            <Button onClick={handleBack}>목록으로 돌아가기</Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestion.id];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <IntervalListeningHeader
        title="인터벌 영어 듣기"
        showBackButton
        onBack={handleBack}
      />

      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant="outline">
              {currentQuestionIndex + 1} / {questions.length}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SpeakerWaveIcon className="h-4 w-4" />
              {answeredCount} / {questions.length} 답안 완료
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            {testSet?.difficulty && (
              <Badge variant={getDifficultyBadgeVariant(testSet.difficulty)}>
                {difficultyLabels[testSet.difficulty]}
              </Badge>
            )}

            {resumeSessionUuid && (
              <span className="text-xs text-primary">
                이전 세션({resumeSessionUuid})에서 이어서 진행 중입니다.
              </span>
            )}
          </div>

          {timeLimitMinutes && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-blue-600">
                <ClockIcon className="h-4 w-4" />
                남은 시간:{" "}
                {timeRemaining !== null ? formatTime(timeRemaining) : "--:--"}
              </div>
              <div className="text-muted-foreground">
                경과 시간: {formatTime(elapsedTime)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">듣기 지문</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => playAudio(currentQuestion.audioText)}
              disabled={!currentQuestion.audioText}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              재생 버튼을 눌러 듣기 지문을 들어보세요.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              문제 {currentQuestion.questionNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base font-medium">
              {currentQuestion.questionContent}
            </p>

            <div className="space-y-3">
              {[
                { key: "A", text: currentQuestion.optionA },
                { key: "B", text: currentQuestion.optionB },
                { key: "C", text: currentQuestion.optionC },
                { key: "D", text: currentQuestion.optionD },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`w-full cursor-pointer rounded-lg border p-4 text-left transition-colors ${
                    selectedAnswer === option.key
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border hover:border-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => handleAnswerSelect(option.key)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium ${
                        selectedAnswer === option.key
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground text-muted-foreground"
                      }`}
                    >
                      {option.key}
                    </div>
                    <p className="text-sm leading-relaxed">{option.text}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-0 border-t bg-background p-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            이전 문제
          </Button>

          <div className="text-sm text-muted-foreground">
            {answeredCount} / {questions.length} 답안 완료
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount !== questions.length || isSubmitting}
            >
              {isSubmitting ? "제출 중..." : "제출하기"}
            </Button>
          ) : (
            <Button onClick={handleNext}>다음 문제</Button>
          )}
        </div>
      </div>

      <ListeningSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={(nextSettings) => setSettings(nextSettings)}
      />

      <FullScreenSlideDialog
        isOpen={showResultDialog}
        onClose={() => setShowResultDialog(false)}
        title="테스트 결과"
        showCloseButton
      >
        {testResult && (
          <TestResultReportForIntervalEnglishListeningTest
            result={testResult}
            onClose={() => setShowResultDialog(false)}
            onRetakeTest={() => {
              setSelectedAnswers({});
              setCurrentQuestionIndex(0);
              setElapsedTime(0);
              setStartTime(new Date());
              setIsTimerActive(true);
              setShowResultDialog(false);
              setTimeRemaining(timeLimitMinutes ? timeLimitMinutes * 60 : null);
            }}
          />
        )}
      </FullScreenSlideDialog>
    </div>
  );
};

export { IntervalEnglishListeningTest };
export default IntervalEnglishListeningTest;
