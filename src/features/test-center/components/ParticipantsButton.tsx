import { Button } from "../../../components/ui";
import { UserGroupIcon } from "@heroicons/react/24/outline";

interface ParticipantsButtonProps {
  participantCount: number;
  onlineCount: number;
  onClick: () => void;
  className?: string;
}

export default function ParticipantsButton({
  participantCount,
  onlineCount,
  onClick,
  className = "",
}: ParticipantsButtonProps) {
  const clampedParticipantCount = Math.max(0, participantCount);
  const clampedOnlineCount = Math.max(0, Math.min(onlineCount, clampedParticipantCount));

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`flex items-center gap-2 relative ${className}`}
    >
      <UserGroupIcon className="w-5 h-5" />
      <span className="hidden sm:inline">참가자</span>

      {/* Badge with participant count */}
      <div className="flex items-center gap-1">
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
          {clampedOnlineCount}/{clampedParticipantCount}
        </span>
      </div>

      {/* Online indicator */}
      {clampedOnlineCount > 0 && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </Button>
  );
}
