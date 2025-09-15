import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui";
import {
  ChatBubbleLeftRightIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { useChatRooms } from "../features/chat-room";

interface ChatButtonsProps {
  className?: string;
}

export default function ChatButtons({ className }: ChatButtonsProps) {
  const navigate = useNavigate();
  const [participantCount, setParticipantCount] = useState(0);
  const { rooms } = useChatRooms();

  // 전체 채팅방 접속자 수 실시간 조회
  useEffect(() => {
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1";
    const wsUrl = isLocal
      ? "http://localhost:8080/ws-stomp"
      : "https://api.total-callbot.cloud/ws-stomp";

    const socket = new SockJS(wsUrl);
    const client = Stomp.over(socket);

    client.connect(
      {},
      () => {
        // 전체 채팅방 참여자 수 구독
        client.subscribe("/topic/participant-count", (message: any) => {
          try {
            const participantData = JSON.parse(message.body);
            setParticipantCount(participantData.count || 0);
          } catch (error) {
            console.error("Error parsing participant data:", error);
          }
        });

        // 참여자 수 요청
        setTimeout(() => {
          client.publish({
            destination: "/app/chat/participant-count",
            body: JSON.stringify({}),
          });
        }, 1000);
      },
      (error: any) => {
        console.log("Connection error:", error);
      }
    );

    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, []);

  return (
    <div className={`flex space-x-2 ${className}`}>
      {/* 전체 채팅방 버튼 */}
      <Button
        variant="outline"
        onClick={() => navigate("/chat")}
        className="flex items-center space-x-2 relative"
        size="sm"
      >
        <ChatBubbleLeftRightIcon className="h-4 w-4" />
        <span>전체 채팅</span>
        {participantCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 text-xs font-medium text-white bg-green-600 rounded-full flex items-center justify-center px-1">
            {participantCount}
          </span>
        )}
      </Button>

      {/* 채팅방 목록 버튼 */}
      <Button
        variant="outline"
        onClick={() => navigate("/chat/rooms")}
        className="flex items-center space-x-2 relative"
        size="sm"
      >
        <ListBulletIcon className="h-4 w-4" />
        <span>채팅방 목록</span>
        {rooms.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 text-xs font-medium text-white bg-blue-600 rounded-full flex items-center justify-center px-1">
            {rooms.length}
          </span>
        )}
      </Button>
    </div>
  );
}
