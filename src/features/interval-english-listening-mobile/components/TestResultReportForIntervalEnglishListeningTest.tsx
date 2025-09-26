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
  SpeakerWaveIcon,
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

const TestResultReportForIntervalEnglishListeningTest: React.FC<
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
  const displayTitle = result.testTitle || "영어 듣기 테스트";

  // 총 소요 시간 계산 (답변 응답 시간들의 합)
  const totalTime = safeAnswers.reduce(
    (sum, answer) => sum + (answer.responseTimeSeconds || 0),
    0,
  );
  const displayTime = totalTime > 0 ? formatTime(totalTime) : "N/A";

  const handleGoHome = () => {
    navigate("/interval-listening");
    onClose();
  };

  const handleRetake = () => {
    if (onRetakeTest) {
      onRetakeTest();
    } else {
      navigate(`/interval-listening/test/${result.testSetId}`);
      onClose();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <SpeakerWaveIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">듣기 테스트 완료!</h1>
        </div>
        <p className="text-lg text-muted-foreground">{displayTitle}</p>
      </div>

      {/* 메인 결과 */}
      <Card className={`${gradeInfo.bgColor} border-2`}>
        <CardContent className="text-center py-8">
          <div className={`text-6xl font-bold ${gradeInfo.color} mb-2`}>
            {gradeInfo.grade}
          </div>
          <div className="text-3xl font-bold mb-4">
            {safeAccuracyRate.toFixed(1)}%
          </div>
          <div className="text-lg text-muted-foreground">
            {result.correctAnswers} / {result.totalQuestions} 문제 정답
          </div>
        </CardContent>
      </Card>

      {/* 상세 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="text-center py-6">
            <ChartBarIcon className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{result.totalScore}</div>
            <div className="text-sm text-muted-foreground">총 점수</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <ClockIcon className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{displayTime}</div>
            <div className="text-sm text-muted-foreground">소요 시간</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-6">
            <SpeakerWaveIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{result.totalQuestions}</div>
            <div className="text-sm text-muted-foreground">총 문제 수</div>
          </CardContent>
        </Card>
      </div>

      {/* 문제별 상세 결과 */}
      {safeAnswers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5" />
              문제별 상세 결과
            </CardTitle>
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
                      {answer.isCorrect ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      ) : (
                        <XCircleIcon className="h-6 w-6 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">
                          문제 {answer.questionNumber}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          선택: {answer.selectedAnswer} | 정답:{" "}
                          {answer.correctAnswer}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={answer.isCorrect ? "default" : "destructive"}
                      >
                        {answer.points}점
                      </Badge>
                      {answer.responseTimeSeconds && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTime(answer.responseTimeSeconds)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          variant="outline"
          onClick={handleGoHome}
          className="w-full sm:w-auto"
        >
          메인으로 돌아가기
        </Button>
        <Button onClick={handleRetake} className="w-full sm:w-auto">
          다시 시도하기
        </Button>
      </div>

      {/* 추가 정보 */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="text-sm text-muted-foreground text-center">
            <div>세션 ID: {result.sessionUuid}</div>
            <div>
              완료 시간: {new Date(result.completedAt).toLocaleString("ko-KR")}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResultReportForIntervalEnglishListeningTest;
