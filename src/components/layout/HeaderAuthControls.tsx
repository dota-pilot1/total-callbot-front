import { Button } from "../ui";
import { UserInfoBadge } from "../common/UserInfoBadge";
import {
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../features/auth";

interface HeaderAuthControlsProps {
  showProfile?: boolean;
  showSettings?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
}

export function HeaderAuthControls({
  showProfile = true,
  showSettings = true,
  size = "sm",
}: HeaderAuthControlsProps) {
  const { logout } = useAuthStore();

  const handleProfile = () => {
    console.log("프로필 페이지로 이동");
  };

  const handleSettings = () => {
    console.log("설정 열기");
  };

  return (
    <div className="flex items-center gap-3">
      <UserInfoBadge />
      {showProfile && (
        <Button
          variant="outline"
          size={size}
          onClick={handleProfile}
          className="flex items-center gap-2"
        >
          <UserIcon className="h-4 w-4" />
          <span className="hidden sm:inline">프로필</span>
        </Button>
      )}
      {showSettings && (
        <Button
          variant="outline"
          size={size}
          onClick={handleSettings}
          className="flex items-center gap-2"
        >
          <Cog6ToothIcon className="h-4 w-4" />
          <span className="hidden sm:inline">설정</span>
        </Button>
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={logout}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        title="로그아웃"
        aria-label="로그아웃"
      >
        <ArrowRightOnRectangleIcon className="h-4 w-4" />
        <span className="sr-only">로그아웃</span>
      </Button>
    </div>
  );
}
