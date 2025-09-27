import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth";
import { Button } from "../../../components/ui";
import {
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

export default function CharacterChatbotWebPage() {
  const { logout, getUser } = useAuthStore();
  const user = getUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* 공통 헤더 */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                <span className="text-xl">🤖</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  캐릭터 챗봇 (웹)
                </h1>
                <p className="text-sm text-muted-foreground">
                  안녕하세요, {user?.name}님
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* 전체 채팅방 버튼 */}
              <Button
                variant="outline"
                onClick={() => navigate("/chat")}
                className="h-9 px-3"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                전체 채팅
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  console.log("Logout button clicked in CharacterChatbotWebPage");
                  logout();
                }}
                className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
            <div className="mb-6">
              <span className="text-6xl mb-4 block">🚧</span>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                웹 버전 준비 중
              </h2>
              <p className="text-muted-foreground">
                캐릭터 챗봇 웹 버전은 현재 개발 중입니다.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                현재 모바일 버전을 이용해 주세요:
              </p>
              <Button
                onClick={() => navigate("/character-chatbot-mobile")}
                variant="default"
                className="w-full max-w-xs mx-auto"
              >
                모바일 버전으로 이동
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
