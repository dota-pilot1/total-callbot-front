import { useNavigate } from "react-router-dom";
import ModernDropdown from "./ui/ModernDropdown";
import {
  ChatBubbleLeftRightIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

interface ChatRoomDropdownProps {
  className?: string;
}

export default function ChatRoomDropdown({ className }: ChatRoomDropdownProps) {
  const navigate = useNavigate();

  const dropdownItems = [
    {
      id: "all-rooms",
      label: "🏠 전체 채팅방",
      icon: ChatBubbleLeftRightIcon,
      onClick: () => navigate("/chat"),
    },
    {
      id: "room-list",
      label: "📋 채팅방 목록",
      icon: ListBulletIcon,
      onClick: () => navigate("/chat/rooms"),
    },
  ];

  return (
    <ModernDropdown
      trigger={
        <div className="flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="h-4 w-4" />
          <span>채팅방</span>
        </div>
      }
      items={dropdownItems}
      align="right"
      className={className}
    />
  );
}
