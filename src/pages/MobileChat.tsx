import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../features/auth";
import { Button } from "../components/ui";
import { chatApi } from "../features/chat/api/chat";
import {
  MicrophoneIcon,
  PaperAirplaneIcon,
  CogIcon,
  PhoneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  MicrophoneIcon as MicrophoneIconSolid,
} from "@heroicons/react/24/solid";
import { voiceApi } from "../features/voice/api/voice";
import {
  connectRealtimeVoice,
  type VoiceConnection,
} from "../features/voice/lib/realtime";
import VoicePulse from "../components/VoicePulse";
import MobileSettingsDropdown from "../components/MobileSettingsDropdown";

export default function MobileChat() {
  const { logout, getUser } = useAuthStore();
  
  // 사용자 정보 상태
  const [user, setUser] = useState(getUser());
  
  // 컴포넌트 마운트 시 사용자 정보 확인
  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, [getUser]);

  // 기본 챗봇 설정 (선택 없이 바로 연결)
  const defaultChatbot = {
    id: "total-callbot",
    name: "Total Callbot",
    description: "AI 음성 대화 전문 어시스턴트",
    color: "from-indigo-500 to-purple-600",
  };

  // 캐릭터/목소리 프리셋 (목소리만 선택 가능)
  const CHARACTER_PRESETS = [
    { id: 'buddy', name: '버디', emoji: '🤖', color: 'from-indigo-500 to-purple-600', defaultVoice: 'verse' },
    { id: 'sage', name: '세이지', emoji: '🧠', color: 'from-emerald-500 to-teal-600', defaultVoice: 'sage' },
    { id: 'spark', name: '스파크', emoji: '⚡️', color: 'from-amber-500 to-orange-600', defaultVoice: 'alloy' },
    { id: 'mentor', name: '멘토', emoji: '🧑‍🏫', color: 'from-sky-500 to-blue-600', defaultVoice: 'opal' },
    { id: 'jolly', name: '졸리', emoji: '😄', color: 'from-pink-500 to-rose-600', defaultVoice: 'ember' },
  ] as const;
  const VOICE_OPTIONS = ['verse', 'alloy', 'ember', 'sage', 'opal'] as const;

  // 채팅 관련 상태
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isIMEComposing, setIsIMEComposing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // 음성 관련 상태
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceConn, setVoiceConn] = useState<VoiceConnection | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  
  // 설정 관련 상태
  const [speechLang, setSpeechLang] = useState<"auto" | "ko" | "en">("auto");
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(false);
  const [coalesceDelayMs, setCoalesceDelayMs] = useState(800);
  const [debugEvents, setDebugEvents] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 캐릭터/음성 선택 상태
  const [selectedCharacterId, setSelectedCharacterId] = useState<(typeof CHARACTER_PRESETS)[number]['id']>(CHARACTER_PRESETS[0].id);
  const [selectedVoice, setSelectedVoice] = useState<string>(CHARACTER_PRESETS[0].defaultVoice);

  // 캐릭터 변경 시 기본 음성 동기화
  useEffect(() => {
    const c = CHARACTER_PRESETS.find(c => c.id === selectedCharacterId) || CHARACTER_PRESETS[0];
    setSelectedVoice(c.defaultVoice);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCharacterId]);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userPartialRef = useRef<string>("");
  const assistantPartialRef = useRef<string>("");
  const lastUserFinalRef = useRef<string>("");
  const lastAssistantFinalRef = useRef<string>("");

  // 텍스트 정규화 함수
  const normalizeText = (s: string) => {
    try {
      if (!s || typeof s !== 'string') return '';
      let normalized = s.normalize("NFC");
      normalized = normalized.replace(/[\uFFFD\u0000-\u001F]/g, "");
      normalized = normalized.replace(/\s+/g, " ").trim();
      return normalized;
    } catch (error) {
      console.warn('텍스트 정규화 실패:', error);
      return (s || "").trim();
    }
  };

  // 자동 스크롤
  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {}
  }, [messages]);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    const userMessage = {
      id: messages.length + 1,
      sender: "user" as const,
      message: normalizeText(messageContent),
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "text" as const,
    };

    setMessages((prev) => [...prev, userMessage]);

    // 실시간 음성 연결이 있으면 전송
    try {
      if (voiceConn?.dc && voiceConn.dc.readyState === "open") {
        voiceConn.dc.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [{ type: "input_text", text: userMessage.message }],
            },
          }),
        );
        voiceConn.dc.send(
          JSON.stringify({
            type: "response.create",
            response: { modalities: ["audio", "text"], conversation: "auto", voice: selectedVoice },
          }),
        );
        return;
      }
    } catch (e) {
      console.error("Realtime 텍스트 전송 실패:", e);
    }

    // 시뮬레이션 응답
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        sender: "callbot" as const,
        message: `"${messageContent}"에 대해 답변드리겠습니다. 백엔드 개발 관점에서 도움을 드릴 수 있습니다.`,
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "text" as const,
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

  // toggleConnection 함수 제거됨 - 더 이상 사용하지 않음

  // 음성 시작
  const startVoice = async () => {
    if (voiceConn) return;
    try {
      const session = await voiceApi.createSession({ lang: speechLang, voice: selectedVoice });
      const conn = await connectRealtimeVoice({
        token: session.token,
        model: session.model,
        audioElement: audioRef.current,
        voice: selectedVoice,
        audioConstraints: {
          echoCancellation,
          noiseSuppression,
          autoGainControl,
          channelCount: 1,
        },
        onEvent: (evt) => {
          const e: any = evt as any;
          const t = e?.type as string | undefined;
          if (t === "input_audio_buffer.speech_started") setIsListening(true);
          if (t === "input_audio_buffer.speech_stopped") setIsListening(false);
          if (t === "output_audio_buffer.started") setIsResponding(true);
          if (t === "response.done" || t === "output_audio_buffer.stopped")
            setIsResponding(false);
        },
        onUserTranscript: (text, isFinal) => {
          if (isFinal) {
            const finalText = normalizeText(text.trim());
            if (finalText && finalText !== normalizeText(lastUserFinalRef.current)) {
              setMessages((prev) => [
                ...prev,
                {
                  id: prev.length + 1,
                  sender: 'user' as const,
                  message: finalText,
                  timestamp: new Date().toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }),
                  type: 'text' as const,
                },
              ]);
              lastUserFinalRef.current = finalText;
            }
          }
        },
        onAssistantText: (text, isFinal) => {
          if (isFinal) {
            const finalText = normalizeText(assistantPartialRef.current || text);
            const normalizedFinal = normalizeText(finalText);
            const normalizedLast = normalizeText(lastAssistantFinalRef.current);
            if (normalizedFinal && normalizedFinal !== normalizedLast) {
              setMessages((prev) => [
                ...prev,
                {
                  id: prev.length + 1,
                  sender: "callbot" as const,
                  message: finalText,
                  timestamp: new Date().toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  type: "text" as const,
                },
              ]);
              lastAssistantFinalRef.current = finalText.trim();
            }
            assistantPartialRef.current = "";
          } else {
            assistantPartialRef.current += text;
          }
        },
      });
      setVoiceConn(conn);
      setIsRecording(true);
    } catch (e) {
      console.error("음성 연결 실패:", e);
    }
  };

  // 음성 정지
  const stopVoice = () => {
    try {
      voiceConn?.stop();
    } catch {}
    setVoiceConn(null);
    setIsRecording(false);
  };

  // 녹음 토글
  const toggleRecording = () => {
    if (!isConnected || !voiceEnabled) return;
    if (isRecording) {
      stopVoice();
    } else {
      startVoice();
    }
  };

  // 채팅 지우기
  const handleClearChat = () => {
    setMessages([]);
    lastUserFinalRef.current = "";
    lastAssistantFinalRef.current = "";
    assistantPartialRef.current = "";
    userPartialRef.current = "";
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Hidden audio sink for AI voice */}
      <audio ref={audioRef} autoPlay style={{ display: "none" }} />
      
      {/* 고정 헤더 */}
      <div className="bg-white shadow-sm border-b flex-shrink-0 sticky top-0 z-40">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <PhoneIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {defaultChatbot.name}
                </h1>
                <p className="text-xs text-gray-600">
                  {user?.name ? `${user.name}님` : user?.email ? `${user.email}님` : "로그인된 사용자"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <CogIcon className="h-5 w-5 text-gray-600" />
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log("Logout button clicked in MobileChat");
                  logout();
                }}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 챗봇 정보 및 연결 상태 */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="text-center">
          {/* <p className="text-sm text-gray-600 mb-3">{defaultChatbot.description}</p> */}
          
          {/* 연결 상태 */}
          <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium mb-3 ${
            isConnected 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : isConnecting 
                ? "bg-yellow-100 text-yellow-800 border border-yellow-200 animate-pulse" 
                : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? "bg-green-500" : isConnecting ? "bg-yellow-500" : "bg-gray-400"
            }`}></div>
            {isConnecting ? "연결중..." : isConnected ? "연결됨" : "연결 대기중"}
          </div>

          {/* 음성 시작 버튼 또는 파동 표시 */}
          <div className="flex justify-center items-center space-x-4">
            {voiceEnabled && isRecording ? (
              <>
                {/* 음성 파동 표시 */}
                <div className="bg-white rounded-full p-4 shadow-lg border border-gray-200">
                  <VoicePulse active={isListening || isResponding} size={48} />
                </div>
                
                {/* 중단 버튼 */}
                <button
                  onClick={() => {
                    stopVoice();
                    setVoiceEnabled(false);
                    setIsConnected(false);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transition-colors"
                  title="음성 연결 중단"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </>
            ) : (
              /* Start 버튼 */
              <Button
                onClick={async () => {
                  if (!isConnected) {
                    // 먼저 연결
                    setIsConnecting(true);
                    try {
                      const chatRoomData = await chatApi.getOrCreateChatRoom({
                        chatbotId: defaultChatbot.id,
                        chatbotName: defaultChatbot.name,
                      });
                      await chatApi.joinChatRoom(chatRoomData.id);
                      setIsConnected(true);
                    } catch (error) {
                      console.error("방 참여 실패:", error);
                      alert("채팅방 참여에 실패했습니다.");
                      setIsConnecting(false);
                      return;
                    }
                    setIsConnecting(false);
                  }
                  
                  // 음성 시작
                  if (!voiceEnabled) {
                    setVoiceEnabled(true);
                    await startVoice();
                  }
                }}
                variant="default"
                className="px-8 py-3 text-lg"
                disabled={isConnecting}
              >
                {isConnecting ? "연결중..." : "Start"}
              </Button>
            )}
          </div>

          {/* 음성 상태 표시 */}
          {voiceEnabled && isRecording && (
            <div className={`flex items-center justify-center space-x-2 text-sm mt-3 ${
              isListening 
                ? "text-red-600" 
                : isResponding 
                  ? "text-blue-600" 
                  : "text-gray-500"
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isListening 
                  ? "bg-red-500 animate-pulse" 
                  : isResponding 
                    ? "bg-blue-500 animate-pulse" 
                    : "bg-gray-400"
              }`}></div>
              <span>
                {isListening ? "듣는 중..." : isResponding ? "응답 중..." : "대기 중"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p className="mb-2">대화를 시작해 보세요!</p>
            <p className="text-sm">음성으로 말하거나 아래 입력창을 사용하세요.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg ${
                  message.sender === "user"
                    ? "bg-indigo-500 text-white"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === "user"
                      ? "text-indigo-100"
                      : "text-gray-500"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      {isConnected && (
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            {/* 음성 버튼 */}
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-full transition-colors ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
              disabled={!voiceEnabled}
            >
              {isRecording ? (
                <MicrophoneIconSolid className="h-5 w-5" />
              ) : (
                <MicrophoneIcon className="h-5 w-5" />
              )}
            </button>

            {/* 텍스트 입력 */}
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onCompositionStart={() => setIsIMEComposing(true)}
                onCompositionEnd={() => setIsIMEComposing(false)}
                onKeyDown={(e) => {
                  const anyEvt = e.nativeEvent as any;
                  const composing = isIMEComposing || anyEvt?.isComposing || anyEvt?.keyCode === 229;
                  if (e.key === "Enter" && !e.shiftKey && !composing) {
                    handleSendMessage();
                  }
                }}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                size="sm"
                className="px-3"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 설정 드롭다운 */}
      <MobileSettingsDropdown
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        // 캐릭터/목소리 선택 관련
        characterOptions={CHARACTER_PRESETS.map(c => ({ id: c.id, name: c.name, emoji: c.emoji }))}
        selectedCharacterId={selectedCharacterId}
        onSelectCharacter={setSelectedCharacterId}
        voiceOptions={[...VOICE_OPTIONS]}
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
        voiceEnabled={voiceEnabled}
        onVoiceEnabledChange={setVoiceEnabled}
        speechLang={speechLang}
        onSpeechLangChange={setSpeechLang}
        echoCancellation={echoCancellation}
        onEchoCancellationChange={setEchoCancellation}
        noiseSuppression={noiseSuppression}
        onNoiseSuppressionChange={setNoiseSuppression}
        autoGainControl={autoGainControl}
        onAutoGainControlChange={setAutoGainControl}
        coalesceDelayMs={coalesceDelayMs}
        onCoalesceDelayChange={setCoalesceDelayMs}
        debugEvents={debugEvents}
        onDebugEventsChange={setDebugEvents}
        onClearChat={handleClearChat}
      />
    </div>
  );
}
