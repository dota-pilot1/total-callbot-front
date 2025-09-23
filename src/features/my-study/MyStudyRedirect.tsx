import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDevice } from "./shared/hooks/useDevice";

/**
 * /my-study 접속 시 디바이스 타입에 따라 자동으로 적절한 라우트로 리다이렉트
 * - 모바일 (< 768px): /my-study-mobile로 리다이렉트
 * - 데스크탑 (>= 768px): /my-study-web으로 리다이렉트
 *
 * 이렇게 함으로써 각 플랫폼별로 완전히 독립적인 개발과 발전이 가능합니다.
 */
export default function MyStudyRedirect() {
  const navigate = useNavigate();
  const { isMobile } = useDevice();

  useEffect(() => {
    // 디바이스 타입에 따라 적절한 라우트로 즉시 리다이렉트
    if (isMobile) {
      navigate("/my-study-mobile", { replace: true });
    } else {
      navigate("/my-study-web", { replace: true });
    }
  }, [isMobile, navigate]);

  // 리다이렉트 중임을 나타내는 로딩 상태
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">
          {isMobile ? "모바일 버전으로 이동 중..." : "웹 버전으로 이동 중..."}
        </p>
      </div>
    </div>
  );
}
