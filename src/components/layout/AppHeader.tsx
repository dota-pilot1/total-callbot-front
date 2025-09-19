import { Button } from "../ui";
import { UserIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

interface AppHeaderProps {
  title?: string;
}

export default function AppHeader({ title = "Total CallBot" }: AppHeaderProps) {
  const handleLogout = () => {
    // TODO: 실제 로그아웃 로직 구현
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleProfile = () => {
    // TODO: 프로필 페이지로 이동
    console.log("프로필 페이지로 이동");
  };

  const handleSettings = () => {
    // 설정 메뉴 옵션들:
    // - 테마 설정 (다크모드/라이트모드)
    // - 알림 설정 (게시글 답글, 좋아요 알림)
    // - 언어 설정 (한국어/영어)
    // - 폰트 크기 조절
    // - TTS 음성 설정 (듣기시험용)
    // - 자동 로그아웃 시간 설정
    // - 개인정보 설정
    // - 건의사항 (기능 개선, 버그 신고, 새 기능 제안)
    // - 도움말 및 FAQ
    // - 앱 정보 (버전, 개발자 정보, 라이선스)
    console.log("설정 메뉴:", {
      theme: "다크/라이트 모드",
      notifications: "알림 설정",
      language: "언어 변경",
      fontSize: "폰트 크기",
      ttsSettings: "TTS 음성 설정",
      autoLogout: "자동 로그아웃",
      privacy: "개인정보 설정",
      feedback: "건의사항 및 피드백",
      help: "도움말 및 FAQ",
      about: "앱 정보",
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 앱 제목 */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <span className="ml-2 text-sm text-gray-500">v1.0</span>
          </div>

          {/* 사용자 메뉴 */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleProfile}
              className="flex items-center gap-2"
            >
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">프로필</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSettings}
              className="flex items-center gap-2"
            >
              <Cog6ToothIcon className="h-4 w-4" />
              <span className="hidden sm:inline">설정</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
