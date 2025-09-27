import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Badge,
  Button,
} from "../../../components/ui";
import type { TestRoom } from "../types";

const statusColor: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  WAITING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-gray-100 text-gray-700",
  ENDED: "bg-gray-100 text-gray-700",
  CLOSED: "bg-gray-100 text-gray-700",
};

interface RoomCardProps {
  room: TestRoom;
  onEnter: (roomId: number) => void;
  onManage: (roomId: number) => void;
}

export default function RoomCard({ room, onEnter, onManage }: RoomCardProps) {
  const status =
    room.status ??
    (room.isActive ? "ACTIVE" : room.isAvailable ? "WAITING" : "COMPLETED");
  const maxParticipants = room.maxParticipants ?? room.capacity;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground">
              {room.name}
            </CardTitle>
            {room.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {room.description}
              </CardDescription>
            )}
          </div>
          <Badge className={`text-xs ${statusColor[status] ?? "bg-gray-100 text-gray-700"}`}>
            {status === "ACTIVE"
              ? "진행중"
              : status === "WAITING"
              ? "대기중"
              : "종료"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 pt-0">
        <div className="text-sm text-muted-foreground">
          {room.testTypeDisplayName}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            참여 {room.currentParticipants}/{maxParticipants}
          </span>
          <span>정원 {room.capacity}명</span>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <Button onClick={() => onEnter(room.id)} disabled={room.currentParticipants >= maxParticipants}>
            입장하기
          </Button>
          <Button
            variant="outline"
            onClick={() => onManage(room.id)}
          >
            문제 관리
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
