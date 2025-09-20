import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../../../components/ui";
import { UserInfoBadge } from "../../../components/common/UserInfoBadge";
import { useAuthStore } from "../../auth";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<
    "영어 회화" | "영어 읽기" | "개발 챌린지"
  >("영어 회화");
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      {/* 미션 설정 전용 헤더 */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">미션 설정</h1>
            <div className="flex items-center gap-3">
              <UserInfoBadge />
              <Button size="sm" onClick={() => console.log("미션 설정 클릭")}>미션 설정</Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 본문: 기존 내용 제거, 상단 탭만 배치 */}
      <div className="container mx-auto max-w-4xl p-4">
        <div className="flex gap-2">
          {(["영어 회화", "영어 읽기", "개발 챌린지"] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* 탭별 본문 */}
        <div className="mt-6">
          {activeTab === "영어 회화" && (
            <Card>
              <CardHeader>
                <CardTitle>영어 회화 미션</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  하루 10분 대화 연습으로 회화 감각을 키워요.
                </p>
                <Button onClick={() => navigate("/chatbots")} size="lg">
                  대화 시작하기
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "영어 읽기" && (
            <Card>
              <CardHeader>
                <CardTitle>영어 읽기 미션</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  흥미로운 뉴스 기사로 리딩 실력을 키워요.
                </p>
                <Button onClick={() => navigate("/news")} size="lg" variant="outline">
                  뉴스 리딩 열기
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "개발 챌린지" && (
            <Card>
              <CardHeader>
                <CardTitle>개발 챌린지</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  작은 과제를 통해 실력을 키워요. 커뮤니티에서 도전 과제를 찾아보세요.
                </p>
                <Button onClick={() => navigate("/board")} size="lg">
                  커뮤니티 보드 열기
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
