import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui";
import { chatApi } from "../features/chatbot/messaging/api/chat";
import type { ChatRoom } from "../shared/api/chat-types";

interface ChatbotInfo {
  id: string;
  name: string;
  description: string;
  expertise: string[];
  greeting: string;
  color: string;
}

interface ChatbotPreviewProps {
  chatbot: ChatbotInfo | null;
}

const ChatbotPreview: React.FC<ChatbotPreviewProps> = ({ chatbot }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatbot) {
      loadBotChatRooms();
    }
  }, []); // 한 번만 호출되도록 빈 의존성 배열 사용

  const loadBotChatRooms = async () => {
    if (!chatbot) return;

    try {
      setLoading(true);
      const allRooms = await chatApi.getChatRooms();
      // 선택한 챗봇과 관련된 채팅방만 필터링
      const botRooms = allRooms.filter((room) => room.botType === chatbot.id);
      setChatRooms(botRooms);
    } catch (err) {
      console.error("Error loading bot chat rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = async (room: ChatRoom) => {
    try {
      await chatApi.joinChatRoom(room.id);
      navigate(`/chat/${room.id}`);
    } catch (err) {
      console.error("Error joining chat room:", err);
    }
  };

  const handleCreateNewChat = async () => {
    if (!chatbot) return;

    try {
      const newRoom = await chatApi.getOrCreateChatRoom({
        chatbotId: chatbot.id,
        chatbotName: chatbot.name,
        botType: chatbot.id,
        name: `${chatbot.name}와의 대화`,
      });
      navigate(`/chat/${newRoom.id}`);
    } catch (err) {
      console.error("Error creating new chat:", err);
    }
  };

  if (!chatbot) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-400">
            왼쪽에서 챗봇을 선택해주세요
          </p>
          <p className="text-sm text-gray-400 mt-1">
            선택한 챗봇과의 기존 대화 목록을 보여드립니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* 챗봇 정보 헤더 */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${chatbot.color} flex items-center justify-center text-white text-2xl font-bold`}
            >
              {chatbot.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">
                {chatbot.name}
              </h2>
              <p className="text-muted-foreground mt-1">{chatbot.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">💡 전문 분야</h4>
              <div className="flex flex-wrap gap-2">
                {chatbot.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm rounded-full bg-muted/30 text-foreground border border-border"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">👋 인사말</h4>
              <p className="text-sm text-muted-foreground italic">{chatbot.greeting}</p>
            </div>
          </div>
        </div>

        {/* 연결 영역 */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm mb-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {chatbot.name}와 대화하기
            </h3>
            <p className="text-muted-foreground mb-6">{chatbot.greeting}</p>
            <Button onClick={handleCreateNewChat} variant="outline" className="px-6 py-5 text-base">
              연결하기
            </Button>
          </div>
        </div>

        {/* 기존 대화 목록 */}
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border p-6">
            <h3 className="text-lg font-semibold text-foreground">
              이전 대화 목록
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground/40 mx-auto mb-4"></div>
              <p className="text-muted-foreground">대화 목록을 불러오는 중...</p>
            </div>
          ) : chatRooms.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-muted-foreground mb-4">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground">
                {chatbot.name}와 아직 대화한 기록이 없습니다.
                <br />
                위의 "연결하기" 버튼을 눌러 첫 대화를 시작해보세요!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {chatRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleRoomSelect(room)}
                  className="p-6 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-foreground">
                        {room.name || `${chatbot.name}와의 대화`}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {room.lastMessageAt &&
                          `마지막 활동: ${new Date(room.lastMessageAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotPreview;
