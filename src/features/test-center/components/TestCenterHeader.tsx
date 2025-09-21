import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../../components/ui";
import {
  ArrowLeftIcon,
  HomeIcon,
  PlusIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import ParticipantsButton from "./ParticipantsButton";

interface TestCenterHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showCreateButton?: boolean;
  showSettingsButton?: boolean;
  showParticipantsButton?: boolean;
  participantCount?: number;
  onlineCount?: number;
  onCreateRoom?: () => void;
  onParticipantsClick?: () => void;
  children?: React.ReactNode;
}

export default function TestCenterHeader({
  title = "테스트 센터",
  showBackButton = false,
  showCreateButton = false,
  showSettingsButton = false,
  showParticipantsButton = false,
  participantCount = 0,
  onlineCount = 0,
  onCreateRoom,
  onParticipantsClick,
  children,
}: TestCenterHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.pathname === "/test-center") {
      navigate(-1);
    } else {
      navigate("/test-center");
    }
  };

  const handleHome = () => {
    navigate("/test-center");
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-2"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleHome}
              className="p-2"
            >
              <HomeIcon className="w-5 h-5" />
            </Button>

            <div className="border-l border-gray-300 h-6 mx-2" />

            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h1>
          </div>

          {/* Center Section */}
          {children && <div className="flex-1 max-w-md mx-4">{children}</div>}

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {showParticipantsButton && onParticipantsClick && (
              <div className="md:hidden">
                <ParticipantsButton
                  participantCount={participantCount}
                  onlineCount={onlineCount}
                  onClick={onParticipantsClick}
                />
              </div>
            )}

            {showSettingsButton && (
              <Button variant="ghost" size="sm" className="p-2">
                <Cog6ToothIcon className="w-5 h-5" />
              </Button>
            )}

            {showCreateButton && onCreateRoom && (
              <Button
                onClick={onCreateRoom}
                size="sm"
                className="hidden sm:flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />방 만들기
              </Button>
            )}

            {showCreateButton && onCreateRoom && (
              <Button
                onClick={onCreateRoom}
                size="sm"
                className="sm:hidden p-2"
              >
                <PlusIcon className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
