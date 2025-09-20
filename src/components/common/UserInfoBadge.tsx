import { UserCircleIcon } from "@heroicons/react/24/solid";
import { useAuthStore } from "../../features/auth";

interface UserInfoBadgeProps {
  compact?: boolean;
}

export function UserInfoBadge({ compact = false }: UserInfoBadgeProps) {
  const { getUser } = useAuthStore();
  const user = getUser();

  const name = user?.name || "게스트";
  const email = user?.email || "-";

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white">
      <UserCircleIcon className="h-6 w-6 text-gray-600" />
      <div className="leading-tight">
        <div className="text-sm font-medium text-gray-900">{name}</div>
        {!compact && (
          <div className="text-xs text-gray-500 truncate max-w-[180px]">{email}</div>
        )}
      </div>
    </div>
  );
}

