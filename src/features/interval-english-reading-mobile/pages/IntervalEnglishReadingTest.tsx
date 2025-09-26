import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { apiClient } from "../../../shared/api/client";
import { IntervalReadingHeader } from "../components/IntervalReadingHeader";
import FullScreenSlideDialog from "../../../components/ui/FullScreenSlideDialog";
import TestResultReportForIntervalEnglishReadingTest from "../components/TestResultReportForIntervalEnglishReadingTest";

interface Question {
  id: number;
  questionNumber: number;
  readingPassage: string;
  questionContent: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  points: number;
  testSetId: number;
}

interface TestSet {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  wordCount: number;
  estimatedReadingTimeMinutes: number;
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
  // 추가 필드들 (프론트엔드에서 생성)
  testTitle?: string;
  timeTaken?: number;
  answers?: {
    questionId: number;
    questionNumber: number;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    points: number;
  }[];
}

const IntervalEnglishReadingTest: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (testId) {
      loadQuestions();
    }
  }, [testId]);

  // 답안 제출 함수 (useEffect보다 먼저 정의)
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setIsTimerActive(false); // 타이머 중지

      // 1. 세션 시작 (필요한 경우)
      let sessionUuid = "";
      try {
        const sessionResponse = await apiClient.post(
          `/interval-reading/sessions/start`,
          { testSetId: parseInt(testId!) },
        );
        sessionUuid = sessionResponse.data.sessionUuid;
      } catch (error) {
        console.error("Session start failed:", error);
      }

      // 2. 각 문제별 답안 제출
      for (const question of questions) {
        const selectedAnswer = selectedAnswers[question.id];
        if (selectedAnswer) {
          try {
            await apiClient.post(
              `/interval-reading/sessions/${sessionUuid}/submit-answer`,
              {
                questionId: question.id,
                selectedAnswer,
                responseTimeSeconds: Math.floor(elapsedTime / questions.length), // 평균 시간으로 계산
              },
            );
          } catch (error) {
            console.error(
              `Failed to submit answer for question ${question.id}:`,
              error,
            );
          }
        }
      }

      // 3. 세션 결과 조회
      try {
        const resultResponse = await apiClient.get(
          `/interval-reading/sessions/${sessionUuid}/result`,
        );
        const result: TestResult = resultResponse.data;
        setTestResult(result);
        setShowResultDialog(true);
      } catch (error) {
        console.error("Failed to get test result:", error);
        // 결과 조회 실패시 기본 결과 생성
        const totalAnswered = Object.keys(selectedAnswers).length;
        const mockResult: TestResult = {
          sessionUuid,
          testTitle: testSet?.title || "영어 독해 테스트",
          totalQuestions: questions.length,
          correctAnswers: 0,
          totalScore: 0,
          accuracyRate: 0,
          timeTaken: elapsedTime,
          answers: questions.map((q) => ({
            questionId: q.id,
            questionNumber: q.questionNumber,
            selectedAnswer: selectedAnswers[q.id] || "",
            correctAnswer: q.correctAnswer,
            isCorrect: selectedAnswers[q.id] === q.correctAnswer,
            points: selectedAnswers[q.id] === q.correctAnswer ? q.points : 0,
          })),
        };

        // 정답률 계산
        const correctCount = mockResult.answers.filter(
          (a) => a.isCorrect,
        ).length;
        mockResult.correctAnswers = correctCount;
        mockResult.accuracyRate = (correctCount / questions.length) * 100;
        mockResult.totalScore = mockResult.answers.reduce(
          (sum, a) => sum + a.points,
          0,
        );

        setTestResult(mockResult);
        setShowResultDialog(true);
      }
    } catch (error) {
      console.error("Submit failed:", error);
      alert("답안 제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedAnswers,
    navigate,
    testId,
    questions,
    elapsedTime,
    testSet,
    isSubmitting,
  ]);

  // 타이머 효과
  useEffect(() => {
    if (!isTimerActive) {
      return;
    }

    const timer = setInterval(() => {
      if (startTime) {
        const now = new Date();
        const elapsed = Math.floor(
          (now.getTime() - startTime.getTime()) / 1000,
        );
        setElapsedTime(elapsed);

        // 시간 제한이 있는 경우 남은 시간 계산
        if (testSet?.timeLimitMinutes) {
          const totalTimeInSeconds = testSet.timeLimitMinutes * 60;
          const remaining = totalTimeInSeconds - elapsed;

          if (remaining <= 0) {
            setTimeRemaining(0);
            setIsTimerActive(false);
            // 시간 초과시 자동 제출
            handleSubmit();
          } else {
            setTimeRemaining(remaining);
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, startTime, testSet?.timeLimitMinutes, handleSubmit]);

  // 시간 포맷팅 함수
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(
        `/interval-reading/tests/${testId}/questions`,
      );
      setQuestions(response.data);

      // 테스트 세트 정보 가져오기
      const testResponse = await apiClient.get(
        `/interval-reading/tests/${testId}`,
      );
      const testSetData = testResponse.data;
      setTestSet(testSetData);

      // 시간 제한이 있으면 타이머 설정
      if (testSetData.timeLimitMinutes && testSetData.timeLimitMinutes > 0) {
        setTimeRemaining(testSetData.timeLimitMinutes * 60); // 분을 초로 변환
        setIsTimerActive(true);
        setStartTime(new Date());
      }
    } catch (error) {
      console.error("Failed to load questions:", error);
    } finally {
      setLoading(false);
    }
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
    navigate("/interval-english-reading-mobile");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground">문제를 불러올 수 없습니다.</p>
            <Button onClick={handleBack} className="mt-4">
              돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-gray-50">
      <IntervalReadingHeader
        title={testSet?.title || "독해 테스트"}
        showBackButton={true}
        onBack={handleBack}
      />

      {/* Progress Section */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* 첫 번째 줄: 문제 진행상황과 답안 완료 상태 */}
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {currentQuestionIndex + 1} / {questions.length}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {Object.keys(selectedAnswers).length} / {questions.length} 완료
            </div>
          </div>

          {/* 두 번째 줄: 타이머 정보 (제한시간이 있는 경우만) */}
          {testSet?.timeLimitMinutes && testSet.timeLimitMinutes > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div
                className={`flex items-center gap-2 font-medium ${
                  timeRemaining !== null && timeRemaining <= 300
                    ? "text-red-600"
                    : "text-blue-600"
                }`}
              >
                <ClockIcon className="h-4 w-4" />
                남은시간:{" "}
                {timeRemaining !== null ? formatTime(timeRemaining) : "--:--"}
              </div>
              <div className="text-gray-600">
                경과시간: {formatTime(elapsedTime)}
              </div>
            </div>
          )}

          {/* 세 번째 줄: 프로그레스바들 */}
          <div className="space-y-2">
            {/* 시간 진행 프로그레스바 (제한시간이 있는 경우만) */}
            {testSet?.timeLimitMinutes && testSet.timeLimitMinutes > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-gray-500">남은 시간</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      timeRemaining !== null && timeRemaining <= 300
                        ? "bg-red-500"
                        : "bg-blue-500"
                    }`}
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          timeRemaining !== null && testSet.timeLimitMinutes
                            ? (timeRemaining /
                                (testSet.timeLimitMinutes * 60)) *
                                100
                            : 0,
                        ),
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Reading Passage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">독해 지문</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {currentQuestion.readingPassage}
            </p>
          </CardContent>
        </Card>

        {/* Question */}
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

            {/* Answer Options */}
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
                  className={`w-full p-4 border rounded-lg cursor-pointer transition-colors text-left ${
                    selectedAnswer === option.key
                      ? "bg-primary/10 border-primary ring-2 ring-primary/20"
                      : "border-border hover:bg-muted hover:border-muted-foreground"
                  }`}
                  onClick={() => handleAnswerSelect(option.key)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                        selectedAnswer === option.key
                          ? "bg-primary border-primary text-primary-foreground"
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

      {/* Navigation */}
      <div className="sticky bottom-0 bg-background border-t p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            이전 문제
          </Button>

          <div className="text-sm text-muted-foreground">
            {Object.keys(selectedAnswers).length} / {questions.length} 답안 완료
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={
                Object.keys(selectedAnswers).length !== questions.length ||
                isSubmitting
              }
            >
              {isSubmitting ? "제출 중..." : "제출하기"}
            </Button>
          ) : (
            <Button onClick={handleNext}>다음 문제</Button>
          )}
        </div>
      </div>

      {/* 시험 결과 다이얼로그 */}
      <FullScreenSlideDialog
        isOpen={showResultDialog}
        onClose={() => setShowResultDialog(false)}
        title="시험 결과"
        showCloseButton={true}
      >
        {testResult && (
          <TestResultReportForIntervalEnglishReadingTest
            result={testResult}
            onClose={() => setShowResultDialog(false)}
            onRetakeTest={() => {
              // 테스트 재도전 로직
              setSelectedAnswers({});
              setCurrentQuestionIndex(0);
              setElapsedTime(0);
              setStartTime(new Date());
              setIsTimerActive(true);
              if (testSet?.timeLimitMinutes) {
                setTimeRemaining(testSet.timeLimitMinutes * 60);
              }
            }}
          />
        )}
      </FullScreenSlideDialog>
    </div>
  );
};

export default IntervalEnglishReadingTest;
