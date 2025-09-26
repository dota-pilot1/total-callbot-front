import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

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
    responseTimeSeconds?: number;
  }[];
}

interface TestResultReportProps {
  result: TestResult;
  onClose: () => void;
  onRetakeTest?: () => void;
}

const TestResultReportForIntervalEnglishReadingTest: React.FC<
  TestResultReportProps
> = ({ result, onClose, onRetakeTest }) => {
  const navigate = useNavigate();

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

  // 성적 등급 계산
  const getGradeInfo = (accuracy: number | undefined) => {
    const safeAccuracy = accuracy || 0;
    if (safeAccuracy >= 90)
      return { grade: "A+", color: "text-green-600", bgColor: "bg-green-50" };
    if (safeAccuracy >= 80)
      return { grade: "A", color: "text-green-600", bgColor: "bg-green-50" };
    if (safeAccuracy >= 70)
      return { grade: "B+", color: "text-blue-600", bgColor: "bg-blue-50" };
    if (safeAccuracy >= 60)
      return { grade: "B", color: "text-blue-600", bgColor: "bg-blue-50" };
    if (safeAccuracy >= 50)
      return { grade: "C+", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    if (safeAccuracy >= 40)
      return { grade: "C", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    return { grade: "D", color: "text-red-600", bgColor: "bg-red-50" };
  };

  const gradeInfo = getGradeInfo(result.accuracy);
  const safeAccuracyRate = result.accuracy || 0;
  const safeAnswers = result.answers || [];
  const displayTitle = result.testTitle || "영어 독해 테스트";

  // 총 소요 시간 계산 (답변 응답 시간들의 합)
  const totalTime = safeAnswers.reduce(
    (sum, answer) => sum + (answer.responseTimeSeconds || 0),
    0,
  );
  const displayTime = totalTime > 0 ? formatTime(totalTime) : "N/A";

  const handleGoHome = () => {
    navigate("/interval-english-reading-web");
    onClose();
  };

  const handleRetake = () => {
    if (onRetakeTest) {
      onRetakeTest();
    }
    onClose();
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* 헤더 - 컴팩트 */}
      <div className="text-center space-y-2">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-1">
            테스트 완료
          </h1>
          <p className="text-sm text-muted-foreground">{displayTitle}</p>
        </div>
      </div>

      {/* 종합 결과 카드 */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            종합 결과
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 정답률 */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${gradeInfo.color} mb-1`}>
                {safeAccuracyRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">정답률</div>
              <Badge variant="outline" className={`mt-2 ${gradeInfo.color}`}>
                {gradeInfo.grade}
              </Badge>
            </div>

            {/* 정답 수 */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {result.correctAnswers}
              </div>
              <div className="text-sm text-muted-foreground">
                정답 / {result.totalQuestions}
              </div>
            </div>

            {/* 총점 */}
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {result.totalScore}
              </div>
              <div className="text-sm text-muted-foreground">총점</div>
            </div>

            {/* 소요 시간 */}
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">
                {displayTime}
              </div>
              <div className="text-sm text-muted-foreground">소요 시간</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 문제별 상세 결과 */}
      <Card>
        <CardHeader>
          <CardTitle>문제별 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {safeAnswers.map((answer) => (
              <div
                key={answer.questionId}
                className={`p-4 rounded-lg border ${
                  answer.isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {answer.isCorrect ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        문제 {answer.questionNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">내 답안:</span>
                      <Badge
                        variant={answer.isCorrect ? "default" : "destructive"}
                        className="font-mono"
                      >
                        {answer.selectedAnswer || "미선택"}
                      </Badge>
                    </div>

                    {!answer.isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">정답:</span>
                        <Badge
                          variant="outline"
                          className="font-mono text-green-600 border-green-600"
                        >
                          {answer.correctAnswer}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">점수:</span>
                      <span className="font-medium">{answer.points}점</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {answer.responseTimeSeconds || 0}초
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼들 */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button onClick={handleRetake} variant="outline" className="flex-1">
          다시 도전하기
        </Button>
        <Button onClick={handleGoHome} className="flex-1">
          테스트 목록으로
        </Button>
      </div>

      {/* 성취 메시지 */}
      <Card className={`${gradeInfo.bgColor} border-0`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className={`text-lg font-medium ${gradeInfo.color}`}>
              {safeAccuracyRate >= 80
                ? "🎉 훌륭한 결과입니다!"
                : safeAccuracyRate >= 60
                  ? "👍 좋은 성과네요!"
                  : "💪 다음에는 더 잘할 수 있을 거예요!"}
            </div>
            <p className="text-sm text-muted-foreground">
              {safeAccuracyRate >= 80
                ? "영어 독해 실력이 뛰어나시네요. 더 도전적인 문제에 도전해보세요!"
                : safeAccuracyRate >= 60
                  ? "꾸준히 연습하면 더욱 실력이 향상될 것입니다."
                  : "포기하지 마세요. 반복 학습을 통해 실력을 향상시켜보세요!"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResultReportForIntervalEnglishReadingTest;
