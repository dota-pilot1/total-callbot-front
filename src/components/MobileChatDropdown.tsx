import { useNavigate } from "react-router-dom";
import ModernDropdown from "./ui/ModernDropdown";
import {
  GlobeAltIcon,
  ListBulletIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

interface MobileChatDropdownProps {
  className?: string;
  participantCount?: number;
  onChatChange?: (type: string) => void;
}

export default function MobileChatDropdown({
  className,
  participantCount = 0,
  onChatChange,
}: MobileChatDropdownProps) {
  const navigate = useNavigate();

  const dropdownItems = [
    {
      id: "general",
      label: "전체 채팅",
      icon: GlobeAltIcon,
      onClick: () => {
        onChatChange?.("general");
      },
    },
    {
      id: "room-list",
      label: "채팅방 목록",
      icon: ListBulletIcon,
      onClick: () => navigate("/chat/rooms"),
    },
  ];

  return (
    <div className="relative">
      <ModernDropdown
        trigger={<UsersIcon className="h-4 w-4" />}
        items={dropdownItems}
        align="left"
        className={className}
      />
      {participantCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium pointer-events-none text-[10px]">
          {participantCount}
        </span>
      )}
    </div>
  );
}
