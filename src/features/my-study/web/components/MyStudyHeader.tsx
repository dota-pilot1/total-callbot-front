import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../../../../components/ui";
import { useAuthStore } from "../../../auth";

type MyStudyNavKey = "dashboard" | "progress" | "library" | "settings";

interface MyStudyHeaderProps {
  currentPage?: MyStudyNavKey;
}

const NAV_ITEMS: Array<{
  key: MyStudyNavKey;
  label: string;
  href: string;
  Icon: typeof HomeIcon;
}> = [
  { key: "dashboard", label: "대시보드", href: "/my-study", Icon: HomeIcon },
  {
    key: "progress",
    label: "진도",
    href: "/my-study/progress",
    Icon: ChartBarIcon,
  },
  {
    key: "library",
    label: "학습자료",
    href: "/my-study/library",
    Icon: BookOpenIcon,
  },
  {
    key: "settings",
    label: "설정",
    href: "/my-study/settings",
    Icon: Cog6ToothIcon,
  },
];

export function MyStudyHeader({ currentPage }: MyStudyHeaderProps) {
  const { logout, getUser } = useAuthStore();
  const user = getUser();
  const navigate = useNavigate();

  const navItems = useMemo(() => NAV_ITEMS, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MS</span>
              </div>
              <span className="font-bold text-lg text-gray-900">my-study</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ key, label, href, Icon }) => {
              const isActive = currentPage === key;

              return (
                <Button
                  key={key}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(href)}
                  className={`flex items-center gap-2 ${
                    isActive
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </Button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <UserCircleIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {user?.name || "사용자"}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/board")}
              className="hidden sm:flex items-center gap-2"
            >
              <span className="text-sm">게시판</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-500 hover:text-gray-700"
              title="로그아웃"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <nav className="md:hidden mt-3 flex items-center gap-1 overflow-x-auto">
          {navItems.map(({ key, label, href, Icon }) => {
            const isActive = currentPage === key;

            return (
              <Button
                key={key}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(href)}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export default MyStudyHeader;
