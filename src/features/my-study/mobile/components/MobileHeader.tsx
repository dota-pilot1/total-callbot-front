import { useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../../components/ui';

interface MobileHeaderProps {
  onMenuClick?: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between h-14 px-4">
        {/* 왼쪽 - 메뉴 버튼과 로고 */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="p-1.5"
          >
            <Bars3Icon className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <span className="text-xs font-semibold text-blue-700">MS</span>
            </div>
            <h1 className="text-base font-semibold text-foreground">
              my-study
            </h1>
          </div>
        </div>

        {/* 오른쪽 - 알림과 프로필 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5 relative"
          >
            <BellIcon className="h-5 w-5" />
            {/* 알림 뱃지 */}
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              2
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="p-1.5"
          >
            <UserCircleIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
