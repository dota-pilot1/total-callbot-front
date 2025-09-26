import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card, CardContent } from "../../../components/ui/Card";
import { IntervalListeningHeader } from "../components/IntervalListeningHeader";
import TestResultReportForIntervalEnglishListeningTest from "../components/TestResultReportForIntervalEnglishListeningTest";
import { intervalListeningApi } from "../api/intervalListeningApi";
import type { SessionResult } from "../types";

export function IntervalEnglishListeningResult() {
  const navigate = useNavigate();
  const { sessionUuid } = useParams<{ sessionUuid: string }>();
  const [result, setResult] = useState<SessionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionUuid) {
      loadResult();
    }
  }, [sessionUuid]);

  const loadResult = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await intervalListeningApi.getSessionResult(sessionUuid!);
      setResult(data);
    } catch (err) {
      setError('결과를 불러오는데 실패했습니다.');
      console.error('Failed to load result:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToList = () => {
    navigate('/interval-listening');
  };

  const handleRetakeTest = () => {
    if (result) {
      navigate(`/interval-listening/test/${result.testSetId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <IntervalListeningHeader
          title="결과 로딩 중..."
          onBack={() => navigate(-1)}
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">결과를 불러오고 있습니다...</div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background">
        <IntervalListeningHeader
          title="오류"
          onBack={() => navigate(-1)}
        />
        <div className="p-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="text-destructive">
                  {error || '결과를 찾을 수 없습니다.'}
                </div>
                <div className="space-y-2">
                  <Button onClick={loadResult} variant="outline" className="w-full">
                    다시 시도
                  </Button>
                  <Button onClick={handleReturnToList} className="w-full">
                    테스트 목록으로
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <IntervalListeningHeader
        title="테스트 결과"
        onBack={handleReturnToList}
      />

      <div className="p-4 space-y-6">
        {/* 결과 리포트 */}
        <TestResultReportForIntervalEnglishListeningTest
          result={result}
          onClose={handleReturnToList}
        />

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          <Button
            onClick={handleRetakeTest}
            className="w-full"
            size="lg"
          >
            다시 도전하기
          </Button>

          <Button
            onClick={handleReturnToList}
            variant="outline"
            className="w-full"
            size="lg"
          >
            테스트 목록으로 돌아가기
          </Button>
        </div>

        {/* 완료 정보 */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">
                테스트 완료 시간
              </div>
              <div className="text-sm font-medium">
                {new Date(result.completedAt).toLocaleString('ko-KR')}
              </div>
              <div className="text-xs text-muted-foreground">
                세션 ID: {result.sessionUuid}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
