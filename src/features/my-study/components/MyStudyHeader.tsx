import { Button } from "../../../components/ui";
import { useAuthStore } from "../../auth";
import { useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ChartBarIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

interface MyStudyHeaderProps {
  currentPage?: 'dashboard' | 'progress' | 'library' | 'settings';
}

export function MyStudyHeader({ currentPage = 'dashboard' }: MyStudyHeaderProps) {
  const { logout, getUser } = useAuthStore();
  const user = getUser();
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: HomeIcon, path: '/my-study' },
    { id: 'progress', label: '진도', icon: ChartBarIcon, path: '/my-study/progress' },
    { id: 'library', label: '학습자료', icon: BookOpenIcon, path: '/my-study/library' },
    { id: 'settings', label: '설정', icon: Cog6ToothIcon, path: '/my-study/settings' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex justify-between items-center">
          {/* 로고 및 브랜딩 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MS</span>
              </div>
              <span className="font-bold text-lg text-gray-900">my-study</span>
            </div>
          </div>

          {/* 네비게이션 */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 ${
                    isActive
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* 사용자 정보 및 액션 */}
          <div className="flex items-center gap-2">
            {/* 사용자 정보 */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
              <UserCircleIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{user?.name || '사용자'}</span>
            </div>

            {/* 게시판 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/board')}
              className="hidden sm:flex items-center gap-2"
            >
              <span className="text-sm">게시판</span>
            </Button>

            {/* 로그아웃 */}
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

        {/* 모바일 네비게이션 */}
        <nav className="md:hidden mt-3 flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
