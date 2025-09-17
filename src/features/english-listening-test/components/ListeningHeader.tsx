import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "../../auth";

interface ListeningHeaderProps {
  title?: string;
  showSettingsButton?: boolean;
  onSettingsClick?: () => void;
}

export default function ListeningHeader({
  title = "🎧 영어 듣기",
  showSettingsButton = false,
  onSettingsClick,
}: ListeningHeaderProps) {
  const navigate = useNavigate();
  const { getUser } = useAuthStore();
  const user = getUser();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="text-sm">뒤로</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600">
                안녕하세요, {user?.name || "사용자"}님!
              </p>
            </div>
          </div>
          {showSettingsButton && onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
