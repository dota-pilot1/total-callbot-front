import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui";
import { UserInfoBadge } from "../../../components/common/UserInfoBadge";
import { ArrowUturnLeftIcon, PowerIcon } from "@heroicons/react/24/outline";

interface AdminHeaderProps {
  title?: string;
}

export function AdminHeader({ title = "Admin" }: AdminHeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2 mr-4"
            >
              <ArrowUturnLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">뒤로 가기</span>
            </Button>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <UserInfoBadge />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
            >
              <PowerIcon className="h-4 w-4" />
              <span className="hidden sm:inline">로그아웃</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
