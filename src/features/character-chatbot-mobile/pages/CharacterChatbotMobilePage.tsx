import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth";
import { Button } from "../../../components/ui";
import {
  XMarkIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

// 새로운 독립적인 훅들
import { useCharacterState } from "../hooks/useCharacterState";
import { useCharacterVoice } from "../hooks/useCharacterVoice";
import { useCharacterChat } from "../hooks/useCharacterChat";

// 기존 컴포넌트들 (필요한 것들만)
import MobileCharacterDialog from "../../../components/MobileCharacterDialog";
import VoicePulse from "../../../components/VoicePulse";
import CardForChattingMessageWithTranslation from "../../../components/CardForChattingMessageWithTranslation";
import { useWebSocketStore } from "../../websocket/stores/useWebSocketStore";

export default function CharacterChatbotMobilePage() {
  const { logout, getUser } = useAuthStore();
  const user = getUser();
  const navigate = useNavigate();

  // WebSocket Store (참가자 수 표시용)
  const { participantCount } = useWebSocketStore();

  // 새로운 독립적인 상태 관리
  const { settings, updateCharacter, updateGender, updateVoice } =
    useCharacterState();

  // 채팅 메시지 관리
  const {
    messages,
    tempVoiceMessage,
    messagesEndRef,
    addUserMessage,
    addAssistantMessage,
    setTempMessage,
    clearMessages,
  } = useCharacterChat();

  // 음성 연결 관리
  const {
    isConnected,
    isListening,
    isResponding,
    startConnection,
    stopConnection,
    sendTextMessage,
    audioRef,
  } = useCharacterVoice({
    settings,
    onUserMessage: addUserMessage,
    onAssistantMessage: addAssistantMessage,
    onUserSpeechStart: () => {
      console.log("🎤 음성 시작");
      setTempMessage("🎤 말하는 중...");
    },
    onUserTranscriptUpdate: (text, isFinal) => {
      if (!isFinal && text.trim()) {
        setTempMessage(text);
      } else if (isFinal) {
        setTempMessage(null);
      }
    },
  });

  // 캐릭터 선택 다이얼로그 상태
  const [characterDialogOpen, setCharacterDialogOpen] = useState(false);

  // 대화 시작/중단 처리
  const handleStartConversation = async () => {
    try {
      await startConnection();
    } catch (error) {
      console.error("대화 시작 실패:", error);
      alert("대화를 시작할 수 없습니다.");
    }
  };

  const handleStopConversation = () => {
    stopConnection();
    clearMessages();
  };

  // 캐릭터 변경 처리
  const handleCharacterChange = (newSettings: {
    characterId: string;
    scenarioId?: string;
    gender: "male" | "female";
    voice: "alloy" | "sage" | "verse";
  }) => {
    console.log("🎭 [CharacterChatbotMobilePageNew] 캐릭터 변경:", newSettings);

    updateCharacter(newSettings.characterId);
    updateGender(newSettings.gender);
    updateVoice(newSettings.voice);

    setCharacterDialogOpen(false);

    // 연결되어 있으면 재시작
    if (isConnected) {
      console.log("🎭 연결 중이므로 재시작");
      stopConnection();
      setTimeout(() => {
        startConnection();
      }, 1000);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Hidden audio sink for AI voice */}
      <audio ref={audioRef} autoPlay style={{ display: "none" }} />

      {/* 고정 헤더 */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 sticky top-0 z-50">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                <span className="text-lg">🤖</span>
              </Button>
              <div className="text-sm text-gray-600">
                캐릭터 음성 채팅 (독립형)
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {/* 전체 채팅방 버튼 */}
              <Button
                variant="outline"
                onClick={() => navigate("/chat")}
                className="relative h-7 w-7 p-0"
                size="sm"
              >
                <ChatBubbleLeftRightIcon className="h-3 w-3" />
                {participantCount >= 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[0.75rem] h-3 text-[10px] font-medium text-primary-foreground bg-primary rounded-full flex items-center justify-center px-0.5">
                    {participantCount}
                  </span>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log("Logout button clicked");
                  logout();
                }}
                title="로그아웃"
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 현재 캐릭터 정보 */}
      <div className="bg-card border-b border-border p-4 flex-shrink-0">
        <div className="text-center">
          <div className="mb-2">
            <div className="text-sm text-gray-600">현재 캐릭터</div>
            <div className="font-medium">
              {settings.character.emoji} {settings.character.name}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {settings.gender} · {settings.voice}
            </div>
          </div>

          {/* 음성 연결 상태 및 컨트롤 */}
          <div className="flex justify-center items-center space-x-3">
            {isConnected ? (
              <>
                {/* 캐릭터 아바타 */}
                <Button
                  onClick={() => setCharacterDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="w-12 h-12 p-0"
                  title={`${settings.character.name} 설정`}
                >
                  <span className="text-lg">{settings.character.emoji}</span>
                </Button>

                {/* 음성 파동 */}
                <div className="relative">
                  <div className="bg-card rounded-lg p-3 shadow-lg border border-border">
                    <VoicePulse
                      active={isListening || isResponding}
                      size={36}
                    />
                  </div>
                  <span
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ring-2 ring-card ${
                      isListening
                        ? "bg-red-500 animate-pulse"
                        : isResponding
                          ? "bg-blue-500 animate-pulse"
                          : "bg-emerald-500"
                    }`}
                  />
                </div>

                {/* 중단 버튼 */}
                <Button
                  onClick={handleStopConversation}
                  variant="destructive"
                  size="sm"
                  className="w-12 h-12 p-0"
                  title="대화 중단"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>

                {/* 대화 지우기 */}
                <Button
                  onClick={clearMessages}
                  variant="outline"
                  size="sm"
                  className="w-12 h-12 p-0"
                  title="대화 내용 지우기"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                {/* 캐릭터 아바타 */}
                <Button
                  onClick={() => setCharacterDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="w-12 h-12 p-0"
                  title={`${settings.character.name} 설정`}
                >
                  <span className="text-lg">{settings.character.emoji}</span>
                </Button>

                {/* 대화 시작 버튼 */}
                <Button
                  onClick={handleStartConversation}
                  variant="outline"
                  size="sm"
                  className="h-12 px-6 text-sm"
                >
                  대화 시작
                </Button>
              </>
            )}
          </div>

          {/* 음성 상태 표시 */}
          {isConnected && (isListening || isResponding) && (
            <div
              className={`flex items-center justify-center space-x-2 text-sm mt-3 ${
                isListening
                  ? "text-red-600"
                  : isResponding
                    ? "text-blue-600"
                    : "text-gray-500"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isListening
                    ? "bg-red-500 animate-pulse"
                    : isResponding
                      ? "bg-blue-500 animate-pulse"
                      : "bg-gray-400"
                }`}
              ></div>
              <span>{isListening ? "듣는 중..." : "응답 중..."}</span>
            </div>
          )}
        </div>
      </div>

      {/* 채팅 영역 */}
      <div
        className="flex-1 overflow-y-scroll overscroll-contain p-4 space-y-3"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p className="mb-2">{settings.character.name}과 대화해보세요!</p>
            <p className="text-sm">
              대화 시작 버튼을 눌러 음성 대화를 시작하세요.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <CardForChattingMessageWithTranslation
                key={message.id}
                message={message}
                isUser={message.sender === "user"}
              />
            ))}

            {/* 임시 음성 메시지 표시 */}
            {tempVoiceMessage && (
              <div className="mb-4 flex justify-end">
                <div className="max-w-[85%] bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-br-md">
                  <div className="flex items-center space-x-2">
                    <span
                      className={
                        tempVoiceMessage.startsWith("🎤") ? "animate-pulse" : ""
                      }
                    >
                      {tempVoiceMessage}
                    </span>
                    {tempVoiceMessage.startsWith("🎤") && (
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                        <div
                          className="w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 캐릭터 선택 다이얼로그 */}
      <MobileCharacterDialog
        open={characterDialogOpen}
        onClose={() => setCharacterDialogOpen(false)}
        value={{
          characterId: settings.character.id,
          gender: settings.gender,
          voice: settings.voice,
        }}
        onConfirm={handleCharacterChange}
      />
    </div>
  );
}
