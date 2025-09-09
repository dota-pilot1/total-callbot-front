import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../features/auth";
import { Button } from "../components/ui";
import { chatApi } from "../features/chat/api/chat";
import {
  MicrophoneIcon,
  PaperAirplaneIcon,
  CogIcon,
  PhoneIcon,
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

// 모바일 설정 다이얼로그 컴포넌트
interface MobileSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  voiceEnabled: boolean;
  onVoiceEnabledChange: (enabled: boolean) => void;
  speechLang: "auto" | "ko" | "en";
  onSpeechLangChange: (lang: "auto" | "ko" | "en") => void;
  echoCancellation: boolean;
  onEchoCancellationChange: (enabled: boolean) => void;
  noiseSuppression: boolean;
  onNoiseSuppressionChange: (enabled: boolean) => void;
  autoGainControl: boolean;
  onAutoGainControlChange: (enabled: boolean) => void;
  onClearChat: () => void;
}

function MobileSettingsDialog({
  isOpen,
  onClose,
  voiceEnabled,
  onVoiceEnabledChange,
  speechLang,
  onSpeechLangChange,
  echoCancellation,
  onEchoCancellationChange,
  noiseSuppression,
  onNoiseSuppressionChange,
  autoGainControl,
  onAutoGainControlChange,
  onClearChat,
}: MobileSettingsDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">채팅 설정</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          {/* 음성 인식 설정 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">음성 인식</h4>
                <p className="text-sm text-gray-600">실시간 음성 대화 기능</p>
              </div>
              <button
                onClick={() => onVoiceEnabledChange(!voiceEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  voiceEnabled ? "bg-indigo-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    voiceEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 언어 설정 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">음성 인식 언어</h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "auto" as const, label: "자동" },
                { key: "ko" as const, label: "한국어" },
                { key: "en" as const, label: "English" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => onSpeechLangChange(option.key)}
                  className={`p-2 rounded-lg text-sm font-medium ${
                    speechLang === option.key
                      ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 오디오 최적화 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">오디오 최적화</h4>
            
            {[
              {
                key: "echo",
                label: "에코 제거",
                description: "스피커 소리가 마이크로 들어가는 것을 방지",
                value: echoCancellation,
                onChange: onEchoCancellationChange,
              },
              {
                key: "noise",
                label: "노이즈 억제",
                description: "배경 소음을 줄여 음성 품질 향상",
                value: noiseSuppression,
                onChange: onNoiseSuppressionChange,
              },
              {
                key: "gain",
                label: "자동 음량 조절",
                description: "마이크 입력 음량을 자동으로 조절",
                value: autoGainControl,
                onChange: onAutoGainControlChange,
              },
            ].map((setting) => (
              <div key={setting.key} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{setting.label}</div>
                  <div className="text-sm text-gray-600">{setting.description}</div>
                </div>
                <button
                  onClick={() => setting.onChange(!setting.value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    setting.value ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      setting.value ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {/* 기타 기능 */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                onClearChat();
                onClose();
              }}
              className="w-full p-3 bg-red-50 text-red-700 rounded-lg font-medium"
            >
              대화 기록 지우기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MobileChat() {
  const { logout } = useAuthStore();

  // 사용자 정보
  const getUserFromStorage = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error("Failed to parse user:", e);
        return null;
      }
    }
    return null;
  };

  const user = getUserFromStorage();

  // 기본 챗봇 설정 (선택 없이 바로 연결)
  const defaultChatbot = {
    id: "backend",
    name: "백엔드 전문가",
    description: "서버 개발, API 설계, 데이터베이스 최적화 전문",
    color: "from-indigo-500 to-purple-600",
  };

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
  const [settingsOpen, setSettingsOpen] = useState(false);

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
            response: { modalities: ["audio", "text"], conversation: "auto" },
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

  // 연결 토글
  const toggleConnection = async () => {
    if (isConnected) {
      setIsConnected(false);
      try {
        voiceConn?.stop();
      } catch {}
      setVoiceConn(null);
      setIsRecording(false);
      setVoiceEnabled(false);
    } else {
      setIsConnecting(true);
      try {
        const chatRoomData = await chatApi.getOrCreateChatRoom({
          chatbotId: defaultChatbot.id,
          chatbotName: defaultChatbot.name,
        });

        await chatApi.joinChatRoom(chatRoomData.id);
        setIsConnected(true);

        if (voiceEnabled) {
          await startVoice();
        }
      } catch (error) {
        console.error("방 참여 실패:", error);
        alert("채팅방 참여에 실패했습니다.");
      } finally {
        setIsConnecting(false);
      }
    }
  };

  // 음성 시작
  const startVoice = async () => {
    if (voiceConn) return;
    try {
      const session = await voiceApi.createSession({ lang: speechLang });
      const conn = await connectRealtimeVoice({
        token: session.token,
        model: session.model,
        audioElement: audioRef.current,
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
                <p className="text-xs text-gray-600">{user?.name || user?.email || "게스트"}님</p>
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
          <p className="text-sm text-gray-600 mb-3">{defaultChatbot.description}</p>
          
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

          {/* 연결 버튼 */}
          <div className="flex justify-center space-x-3">
            <Button
              onClick={toggleConnection}
              variant={isConnected ? "destructive" : "default"}
              className="px-6"
              disabled={isConnecting}
            >
              {isConnecting ? "연결중..." : isConnected ? "연결 해제" : "연결하기"}
            </Button>
            
            {/* 음성 모드 토글 */}
            {isConnected && (
              <Button
                onClick={() => {
                  const next = !voiceEnabled;
                  setVoiceEnabled(next);
                  if (next && !isRecording) {
                    startVoice();
                  } else if (!next && isRecording) {
                    stopVoice();
                  }
                }}
                variant={voiceEnabled ? "default" : "outline"}
                className="px-4"
              >
                {voiceEnabled ? "음성 ON" : "음성 OFF"}
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
        {/* 음성 인식 시 파동 표시 */}
        {isRecording && (
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3 shadow-lg border border-gray-200">
              <VoicePulse active={true} size={32} />
            </div>
          </div>
        )}

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

      {/* 설정 다이얼로그 */}
      <MobileSettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
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
        onClearChat={handleClearChat}
      />
    </div>
  );
}