import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuthStore } from "../features/auth";
import {
  useWebSocketStore,
  type ChatMessage,
} from "../features/websocket/stores/useWebSocketStore";
import { Button } from "../components/ui";
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  UsersIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import { getChatbotHomeRoute } from "../lib/chatbotRoute";
import { useToast } from "../components/ui/Toast";

// 메시지 컴포넌트
function MessageBubble({
  message,
  currentUserName,
}: {
  message: ChatMessage;
  currentUserName: string;
}) {
  const isMyMessage = message.senderName === currentUserName;
  const isSystemMessage = message.senderName === "시스템";

  // 시스템 메시지는 가운데 정렬된 공지 스타일
  if (isSystemMessage) {
    return (
      <div className="flex justify-center mb-4">
        <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600 border">
          {message.content}
        </div>
      </div>
    );
  }

  // 일반 메시지
  return (
    <div
      className={`flex items-start space-x-2 mb-4 ${isMyMessage ? "flex-row-reverse space-x-reverse" : ""}`}
    >
      {/* 아바타 */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mt-1 ${
          isMyMessage ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-600"
        }`}
      >
        {message.senderName.charAt(0).toUpperCase()}
      </div>

      {/* 메시지 내용 */}
      <div
        className={`flex flex-col ${isMyMessage ? "items-end" : "items-start"}`}
      >
        {/* 발신자 이름 */}
        <div className="text-xs text-gray-500 mb-1">{message.senderName}</div>

        {/* 메시지 버블 */}
        <div
          className={`px-4 py-2 rounded-lg max-w-xs break-words ${
            isMyMessage
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-200 text-gray-800 rounded-bl-none"
          }`}
        >
          {message.content}
        </div>

        {/* 시간 */}
        <div className="text-xs text-gray-400 mt-1">{message.timestamp}</div>
      </div>
    </div>
  );
}

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId } = useParams<{ roomId?: string }>();
  const { getUser } = useAuthStore();
  const user = getUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast, ToastContainer } = useToast();

  // location.state에서 roomName 가져오기
  const roomNameFromState = location.state?.roomName;

  // Zustand 웹소켓 스토어 사용
  const {
    connected,
    connecting,
    messages,
    currentRoomId,
    currentRoomName,
    participantCount,
    participants,
    showParticipantList,
    connect,
    disconnect,
    sendMessage,
    setCurrentRoom,
    toggleParticipantList,
    // requestParticipantCount,
  } = useWebSocketStore();

  // 입력 상태
  const [inputMessage, setInputMessage] = useState("");

  // 현재 사용자 정보
  const currentUserName = user?.name || user?.email || "익명";
  const userEmail = user?.email || "unknown@example.com";

  // 현재 채팅방 ID
  const targetRoomId = roomId || "general";

  // 룸 변경 시 처리
  useEffect(() => {
    if (currentRoomId !== targetRoomId) {
      setCurrentRoom(targetRoomId, roomNameFromState);
      // 기존 연결이 있으면 해제하고 새로 연결
      if (connected) {
        disconnect();
      }
    }
  }, [
    targetRoomId,
    currentRoomId,
    connected,
    disconnect,
    setCurrentRoom,
    roomNameFromState,
  ]);

  // 연결되지 않은 상태에서 연결 시도
  useEffect(() => {
    if (!connected && !connecting) {
      connect(targetRoomId, currentUserName, userEmail, roomNameFromState);
    }
  }, [
    connected,
    connecting,
    targetRoomId,
    currentUserName,
    userEmail,
    connect,
    roomNameFromState,
  ]);

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSendMessage = () => {
    console.log("handleSendMessage called", {
      inputMessage,
      connected,
      currentUserName,
    });
    if (!inputMessage.trim()) {
      console.log("Empty message, returning");
      return;
    }
    console.log("Calling sendMessage...");
    sendMessage(inputMessage, currentUserName, userEmail);
    setInputMessage("");
  };

  // Enter 키로 메시지 전송
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 다시 연결 핸들러
  // const handleReconnect = () => {
  //   connect(targetRoomId, currentUserName, userEmail);
  // };

  // 채팅방 나가기 핸들러
  const handleLeave = () => {
    disconnect();
    showToast(`${currentUserName}님이 채팅방에서 나갔습니다.`, "info", 1500);
    navigate(getChatbotHomeRoute());
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 p-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleLeave}
              size="sm"
              className="flex items-center space-x-1"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>나가기</span>
            </Button>
            {currentRoomId === "general" && (
              <Button
                variant="outline"
                onClick={() => navigate("/chat/rooms")}
                size="sm"
                className="flex items-center space-x-1"
              >
                <ListBulletIcon className="h-4 w-4" />
                <span>목록</span>
              </Button>
            )}
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-gray-900">
                {currentRoomName}
              </h1>
              {currentRoomId !== "general" && (
                <p className="text-xs text-gray-500 truncate max-w-48">
                  ID: {currentRoomId}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleParticipantList}
              className={`relative p-2 rounded-full transition-colors ${
                connected
                  ? "bg-green-100 hover:bg-green-200 text-green-700"
                  : "bg-red-100 hover:bg-red-200 text-red-700"
              }`}
              title={`참여자 ${participantCount}명 (클릭하여 목록 보기)`}
            >
              <UsersIcon className="h-5 w-5" />
              {participantCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 min-w-[1.25rem] h-5 text-xs font-medium text-white rounded-full flex items-center justify-center px-1 ${
                    connected ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {participantCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 슬라이딩 참여자 목록 */}
      <div
        className={`bg-white border-b border-gray-200 transition-all duration-300 ease-in-out overflow-hidden ${
          showParticipantList ? "max-h-40" : "max-h-0"
        }`}
      >
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            참여자 목록 ({participantCount}명)
          </h3>
          <div className="space-y-2 max-h-24 overflow-y-auto">
            {participants.length > 0 ? (
              participants.map((participant, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">
                    {participant.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{participant}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">참여자가 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>채팅을 시작해보세요!</p>
            <p className="text-sm">현재 사용자: {currentUserName}</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserName={currentUserName}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!connected}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!connected || !inputMessage.trim()}
            className="px-4 py-2"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Toast 컨테이너 */}
      <ToastContainer />
    </div>
  );
}
