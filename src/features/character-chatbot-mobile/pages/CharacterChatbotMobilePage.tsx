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
import {
  PaperAirplaneIcon,
  SparklesIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";

// 기존 컴포넌트들 (필요한 것들만)
import MobileCharacterDialog from "../../../components/MobileCharacterDialog";
import VoicePulse from "../../../components/VoicePulse";
import CardForChattingMessageWithTranslation from "../../../components/CardForChattingMessageWithTranslation";
import { useWebSocketStore } from "../../websocket/stores/useWebSocketStore";
import { apiClient } from "../../../shared/api/client";

export default function CharacterChatbotMobilePage() {
  const { logout } = useAuthStore();
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

  // 텍스트 입력 상태
  const [newMessage, setNewMessage] = useState("");
  const [isIMEComposing, setIsIMEComposing] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translation, setTranslation] = useState("");

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

  // 텍스트 메시지 전송
  const handleSendMessage = () => {
    const text = newMessage.trim();
    if (!text || suggestLoading) return;

    // 사용자 메시지 추가
    addUserMessage(text);
    setNewMessage("");

    // 번역 숨기기
    setShowTranslation(false);

    // 음성 연결을 통해 전송
    if (isConnected) {
      sendTextMessage(text);
    }
  };

  // AI 자동 완성 기능
  const suggestReply = async () => {
    setSuggestLoading(true);
    try {
      // 캐릭터와 최근 대화 맥락을 고려한 AI 제안 생성
      const recentMessages = messages.slice(-3); // 최근 3개 메시지
      const conversationContext = recentMessages
        .map((msg) => `${msg.sender}: ${msg.message}`)
        .join("\n");

      const prompt = `You are having a conversation with ${settings.character.name} (${settings.character.personality}).
Based on this recent conversation context:
${conversationContext}

Generate a natural, engaging English response or question that would be appropriate to continue this conversation.
Keep it conversational, friendly, and relevant to ${settings.character.name}'s character.
Response should be 1-2 sentences maximum.`;

      const response = await apiClient.post("/chat/ai-suggestion", {
        prompt: prompt,
        maxTokens: 50,
      });

      let suggestedText = "";

      if (response.data && response.data.suggestion) {
        suggestedText = response.data.suggestion.trim();
      } else {
        // Fallback to character-specific suggestions
        const characterSuggestions = [
          `Tell me more about your ${settings.character.personality.toLowerCase()} side`,
          "What's been on your mind lately?",
          "Share something interesting with me",
          "What advice would you give me?",
          "How do you see the world?",
        ];
        suggestedText =
          characterSuggestions[
            Math.floor(Math.random() * characterSuggestions.length)
          ];
      }

      setNewMessage(suggestedText);

      // 간단한 번역 제공
      const translateText = (text: string): string => {
        // 영어 → 한국어 간단 번역
        const translations: { [key: string]: string } = {
          "What makes you unique?": "당신을 독특하게 만드는 것은 무엇인가요?",
          "Tell me about yourself": "자신에 대해 말해주세요",
          "What's your story?": "당신의 이야기는 무엇인가요?",
          "Share your thoughts with me": "당신의 생각을 저와 공유해주세요",
          "How are you feeling today?": "오늘 기분이 어떠세요?",
          "What's been on your mind lately?":
            "최근에 무엇을 생각하고 계셨나요?",
          "Share something interesting with me":
            "흥미로운 것을 저와 공유해주세요",
          "What advice would you give me?": "저에게 어떤 조언을 해주시겠어요?",
          "How do you see the world?": "세상을 어떻게 보시나요?",
        };

        return translations[text] || `[한국어 번역] ${text}`;
      };

      setTranslation(translateText(suggestedText));
      setShowTranslation(true);
    } catch (error) {
      console.error("AI 제안 생성 실패:", error);
      // Fallback suggestions
      const fallbackSuggestions = [
        "Tell me about yourself",
        "What's your story?",
        "Share your thoughts with me",
        "What makes you unique?",
        "How are you feeling today?",
      ];
      const randomSuggestion =
        fallbackSuggestions[
          Math.floor(Math.random() * fallbackSuggestions.length)
        ];
      setNewMessage(randomSuggestion);

      // 간단한 번역 제공
      const translateText = (text: string): string => {
        const translations: { [key: string]: string } = {
          "Tell me about yourself": "자신에 대해 말해주세요",
          "What's your story?": "당신의 이야기는 무엇인가요?",
          "Share your thoughts with me": "당신의 생각을 저와 공유해주세요",
          "What makes you unique?": "당신을 독특하게 만드는 것은 무엇인가요?",
          "How are you feeling today?": "오늘 기분이 어떠세요?",
        };
        return translations[text] || `[한국어 번역] ${text}`;
      };

      setTranslation(translateText(randomSuggestion));
      setShowTranslation(true);
    } finally {
      setSuggestLoading(false);
    }
  };

  // 캐릭터 변경 처리
  const handleCharacterChange = (newSettings: {
    characterId: string;
    scenarioId?: string;
    gender: "male" | "female";
    voice: "alloy" | "sage" | "verse";
  }) => {
    console.log("🎭 [CharacterChatbotMobilePage] 캐릭터 변경:", newSettings);

    updateCharacter(newSettings.characterId);
    updateGender(newSettings.gender);
    updateVoice(newSettings.voice);

    setCharacterDialogOpen(false);

    // 연결되어 있으면 재시작 (대화 내용도 지우고 새로 시작)
    if (isConnected) {
      console.log("🎭 연결 중이므로 재시작 - 새로운 캐릭터로 처음부터");
      stopConnection();
      clearMessages(); // 기존 대화 내용 지우기
      setTimeout(() => {
        startConnection(); // 새로운 캐릭터로 재시작 (첫 메시지 포함)
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

      {/* 입력 영역 */}
      {isConnected && (
        <div className="bg-card border-t border-border flex-shrink-0">
          {/* 번역 영역 */}
          {showTranslation && (
            <div className="px-4 py-3 bg-blue-50/50 border-b border-blue-200">
              <div className="flex items-start gap-3">
                <LanguageIcon className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-700 mb-1">
                    한글 번역
                  </p>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {translation || "번역을 가져올 수 없습니다."}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranslation(false)}
                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          <div className="p-4">
            <div className="flex items-center space-x-2">
              {/* 왼쪽 미니 버튼들 */}
              <div className="flex flex-col space-y-1">
                <Button
                  onClick={suggestReply}
                  variant="outline"
                  size="sm"
                  className={`w-8 h-8 p-0 ${suggestLoading ? "animate-pulse" : ""}`}
                  title="AI 제안"
                  disabled={suggestLoading}
                >
                  <SparklesIcon className="h-3 w-3" />
                </Button>
              </div>

              {/* 텍스트 입력 */}
              <textarea
                rows={3}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  // 텍스트 변경 시 번역 숨기기 (suggestLoading이 아닐 때만)
                  if (showTranslation && !suggestLoading) {
                    setShowTranslation(false);
                  }
                }}
                onCompositionStart={() => setIsIMEComposing(true)}
                onCompositionEnd={() => setIsIMEComposing(false)}
                onKeyDown={(e) => {
                  const anyEvt = e.nativeEvent as any;
                  const composing =
                    isIMEComposing ||
                    anyEvt?.isComposing ||
                    anyEvt?.keyCode === 229;
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !composing &&
                    !suggestLoading
                  ) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  suggestLoading ? "AI 응답 생성 중…" : "메시지를 입력하세요..."
                }
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none text-[13px] md:text-sm placeholder:text-muted-foreground"
                style={{ minHeight: "4.5rem" }}
              />

              {/* 오른쪽 미니 버튼들 */}
              <div className="flex flex-col space-y-1">
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || suggestLoading}
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0"
                  title="전송"
                >
                  <PaperAirplaneIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
