import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth";
import { Button } from "../components/ui";

import {
  PaperAirplaneIcon,
  TrashIcon,
  XMarkIcon,
  SparklesIcon,
  Cog6ToothIcon,
  LanguageIcon,
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  SpeakerWaveIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";
import { useVoiceConnection } from "../features/chatbot/voice";
import { useChatMessages } from "../features/chatbot/messaging";
import VoicePulse from "../components/VoicePulse";
import MobileSettingsDropdown from "../components/MobileSettingsDropdown";

import MobileCharacterDialog from "../components/MobileCharacterDialog";
import { CHARACTER_LIST } from "../features/chatbot/character/characters";
import {
  useCharacterStore,
  CHARACTER_PRESETS,
  VOICE_OPTIONS,
  useCharacterSelection,
} from "../features/chatbot/character";
import { useWebSocketStore } from "../features/websocket/stores/useWebSocketStore";
import MobileTranslationDialog from "../components/MobileTranslationDialog";
import KoreanInputDialog from "../components/KoreanInputDialog";
import CardForChattingMessageWithTranslation from "../components/CardForChattingMessageWithTranslation";
import { MyConversationArchive } from "../features/conversation-archive";

import { useAudioSettings } from "../features/chatbot/settings";
import ExamResultsSlideDown from "../components/ExamResultsSlideDown";
import { useExamMode } from "../features/chatbot/exam";
import { useToast } from "../components/ui/Toast";

export default function ExamChat() {
  const { logout, getUser } = useAuthStore();
  const user = getUser();
  const navigate = useNavigate();
  const { ToastContainer } = useToast();

  // WebSocket Store 사용 (중복 연결 제거)
  const { participantCount, connected, connecting, connect, disconnect } =
    useWebSocketStore();

  // 컴포넌트 언마운트 시에만 연결 해제 (자동 연결 제거)
  useEffect(() => {
    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (connected) {
        disconnect();
      }
    };
  }, [connected, disconnect]);

  // zustand store에서 캐릭터 상태 가져오기
  const { personaCharacter, personaGender } = useCharacterStore();

  // 오디오 설정 훅 (responseDelayMs: 2초로 설정하여 사용자 메시지 등록 후 적절한 대기시간 제공)
  const {
    settings: {
      speechLang,
      echoCancellation,
      noiseSuppression,
      autoGainControl,
      coalesceDelayMs,
      responseDelayMs,
      debugEvents,
      maxSentenceCount,
      englishLevel,
    },
    setSpeechLang,
    setEchoCancellation,
    setNoiseSuppression,
    setAutoGainControl,
    setCoalesceDelayMs,
    setResponseDelayMs,
    setDebugEvents,
    setMaxSentenceCount,
    setEnglishLevel,
  } = useAudioSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Translation dialog state (mobile)
  const [translationOpen, setTranslationOpen] = useState(false);
  const [translationText, setTranslationText] = useState<string>("");

  // 나의 대화 아카이브 다이얼로그 상태
  const [conversationArchiveDialogOpen, setConversationArchiveDialogOpen] =
    useState(false);

  // 한국어 입력 다이얼로그 상태
  const [koreanInputDialogOpen, setKoreanInputDialogOpen] = useState(false);

  // 시험 결과 슬라이드 다운 상태
  const [examResultsVisible, setExamResultsVisible] = useState(false);
  const [examResultsText, setExamResultsText] = useState("");

  // 캐릭터 선택 훅
  const {
    selectedCharacterId,
    selectedVoice,
    characterDialogOpen,
    setSelectedCharacterId,
    setSelectedVoice,
    openCharacterDialog,
    closeCharacterDialog,
    applyCharacterSettings,
    getCurrentDialogValue,
  } = useCharacterSelection();

  // 채팅 메시지 훅
  const {
    messages,
    newMessage,
    isIMEComposing,
    suggestLoading,
    messagesEndRef,
    setNewMessage,
    setIsIMEComposing,
    addUserMessage,
    addAssistantMessage,
    sendMessage,
    clearChat,
    suggestReply,
  } = useChatMessages({
    responseDelayMs,
    selectedCharacterId,
    maxSentenceCount,
    englishLevel,
    onSendMessage: (text: string) => {
      // 음성 연결이 있으면 음성으로 전송
      try {
        if (voiceConn?.dc && voiceConn.dc.readyState === "open") {
          sendVoiceMessage(text);
        }
      } catch (e) {
        console.error("Realtime 텍스트 전송 실패:", e);
      }
    },
  });

  // 시험 완료 감지를 위한 어시스턴트 메시지 핸들러
  const handleAssistantMessage = (message: string) => {
    addAssistantMessage(message);

    // 시험 완료 감지
    if (detectExamCompletion(message)) {
      setExamResultsText(message);
      // 약간의 지연 후 슬라이드 다운 표시 (자연스러운 UX)
      setTimeout(() => {
        setExamResultsVisible(true);
      }, 1000);
    }
  };

  // CHARACTER_LIST에서 실제 캐릭터 찾기
  const actualPersonaCharacter =
    CHARACTER_LIST.find((c) => c.id === personaCharacter.id) ||
    CHARACTER_LIST[0];

  /**
   * 시험 완료 여부를 감지하는 함수
   * 빠른 테스트 결과 메시지 감지
   */
  const detectExamCompletion = (message: string): boolean => {
    const examCompletionIndicators = [
      "점수:",
      "한줄평:",
      "테스트 완료",
      /\d+\/10/, // 점수 패턴 (예: 7/10)
    ];

    return examCompletionIndicators.some((indicator) => {
      if (typeof indicator === "string") {
        return message.includes(indicator);
      } else {
        return indicator.test(message);
      }
    });
  };

  // 임시 음성 메시지 상태 (optimistic UI용)
  const [tempVoiceMessage, setTempVoiceMessage] = useState<string | null>(null);

  // 토스트 메시지 상태
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // TTS 관련 상태
  const [playingInputText, setPlayingInputText] = useState(false);
  const inputAudioRef = useRef<HTMLAudioElement | null>(null);

  // 음성 연결 훅
  const {
    voiceEnabled,
    isRecording,
    isListening,
    isResponding,
    voiceConn,
    audioRef,
    startVoice,
    stopVoice,
    setVoiceEnabled,
    sendVoiceMessage,
  } = useVoiceConnection({
    speechLang,
    echoCancellation,
    noiseSuppression,
    autoGainControl,
    selectedVoice,
    personaCharacter: actualPersonaCharacter,
    personaGender,
    onUserMessage: (text: string) => {
      // 최종 메시지가 오면 임시 메시지 제거하고 정식 메시지 추가
      setTempVoiceMessage(null);
      addUserMessage(text);
    },
    onAssistantMessage: handleAssistantMessage,
    onUserSpeechStart: () => {
      // 음성 시작 시 임시 메시지 표시 및 대화 시작 토스트
      console.log("🎤 음성 시작 - 임시 메시지 표시");
      setTempVoiceMessage("🎤 말하는 중...");

      // 테스트 시작 토스트 (첫 번째 음성 시작 시에만)
      if (messages.length === 0) {
        setToastMessage("⚡ 빠른 테스트가 시작되었습니다!");
        setTimeout(() => setToastMessage(null), 2000);
      }
    },
    onUserTranscriptUpdate: (text: string, isFinal: boolean) => {
      // 실시간 텍스트 업데이트만 처리 (중복 방지를 위해 addUserMessage 제거)
      if (!isFinal && text.trim()) {
        console.log("🎤 실시간 업데이트:", text);
        setTempVoiceMessage(text);
      } else if (isFinal) {
        // 음성 인식 완료 시 임시 메시지만 제거 (실제 메시지 추가는 onUserMessage에서 처리)
        console.log("🎤 음성 인식 완료 - 임시 메시지 제거");
        setTempVoiceMessage(null);
      }
    },
  });

  // 시험 연결 및 준비 함수
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const ensureConnectedAndReady = async () => {
    // Ensure WebSocket connection
    if (user && !connected) {
      connect("general", user.name, user.email, "전체 채팅");
      // Wait for connection
      for (let i = 0; i < 20; i++) {
        if (connected) break;
        await sleep(200);
      }
    }

    // Ensure voice connection
    if (!voiceEnabled || !voiceConn) {
      setVoiceEnabled(true);
      await startVoice();
    }

    // Wait for data channel open
    for (let i = 0; i < 20; i++) {
      if (voiceConn?.dc && voiceConn.dc.readyState === "open") return;
      await sleep(200);
    }
    // last attempt if state lagged
    if (!(voiceConn?.dc && voiceConn.dc.readyState === "open")) {
      throw new Error("데이터 채널이 준비되지 않았습니다");
    }
  };

  // 시험 모드 훅
  const { examSending, triggerSingleExam } = useExamMode({
    voiceConnection: voiceConn,
    selectedVoice,
    ensureConnectedAndReady,
    onAddAssistantMessage: handleAssistantMessage,
  });

  const openTranslation = (text: string) => {
    setTranslationText(text);
    setTranslationOpen(true);
  };

  // 인풋 텍스트 TTS 재생
  const playInputText = async (text: string) => {
    if (!text.trim()) return;

    try {
      // 이전 오디오 중지
      if (inputAudioRef.current) {
        inputAudioRef.current.pause();
        inputAudioRef.current.currentTime = 0;
      }

      setPlayingInputText(true);

      // 백엔드에서 OpenAI API 키 받기
      const token = localStorage.getItem("accessToken");

      const apiUrl =
        window.location.hostname === "localhost"
          ? "/api/config/openai-key"
          : "https://api.total-callbot.cloud/api/config/openai-key";

      const keyResponse = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!keyResponse.ok) {
        throw new Error(`API 요청 실패: ${keyResponse.status}`);
      }

      const { key } = await keyResponse.json();

      // OpenAI TTS API 직접 호출
      const ttsResponse = await fetch(
        "https://api.openai.com/v1/audio/speech",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "tts-1",
            input: text,
            voice: "alloy",
            speed: 1.0,
          }),
        },
      );

      if (ttsResponse.ok) {
        const audioBlob = await ttsResponse.blob();

        const reader = new FileReader();
        reader.onload = async () => {
          inputAudioRef.current = new Audio(reader.result as string);

          inputAudioRef.current.onended = () => {
            setPlayingInputText(false);
          };

          inputAudioRef.current.onerror = () => {
            setPlayingInputText(false);
            console.error("Audio playback failed");
          };

          try {
            await inputAudioRef.current.play();
          } catch (playError) {
            console.error("Audio play failed:", playError);
            setPlayingInputText(false);
          }
        };

        reader.onerror = () => {
          console.error("FileReader error");
          setPlayingInputText(false);
        };

        reader.readAsDataURL(audioBlob);
      } else {
        throw new Error(`TTS API request failed: ${ttsResponse.status}`);
      }
    } catch (error) {
      console.error("TTS failed:", error);
      setPlayingInputText(false);
    }
  };

  // 인풋 텍스트 읽기 중지
  const stopInputSpeech = () => {
    if (inputAudioRef.current) {
      inputAudioRef.current.pause();
      inputAudioRef.current.currentTime = 0;
    }
    setPlayingInputText(false);
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Hidden audio sink for AI voice */}
      <audio ref={audioRef} autoPlay style={{ display: "none" }} />

      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
            {toastMessage}
          </div>
        </div>
      )}

      {/* 고정 헤더 */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 sticky top-0 z-50">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {/* 시험 로고 */}
              <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                <span className="text-lg">🎓</span>
              </Button>
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

              {/* 연습장 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setKoreanInputDialogOpen(true)}
                title="한국어 입력"
                className="h-7 w-7 p-0"
              >
                <span className="text-[10px] font-bold">KR</span>
              </Button>

              {/* 나의 대화 아카이브 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConversationArchiveDialogOpen(true)}
                title="나의 대화 아카이브"
                className="h-7 w-7 p-0"
              >
                <ArchiveBoxIcon className="h-3 w-3" />
              </Button>

              {/* 설정 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                title="설정"
                className="h-7 w-7 p-0"
              >
                <Cog6ToothIcon className="h-3 w-3" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log("Logout button clicked in ExamChat");
                  logout();
                }}
                title="로그아웃"
                className="h-7 w-7 p-0"
              >
                <ArrowRightOnRectangleIcon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 시험 정보 및 연결 상태 */}
      <div className="bg-card border-b border-border p-4 flex-shrink-0">
        <div className="text-center">
          <div className="mb-2" />

          {/* 음성 시작 버튼 또는 파동 표시 */}
          <div className="flex justify-center items-center space-x-3">
            {voiceEnabled && isRecording ? (
              <>
                {/* 시험관 아바타 (시험 전용) */}
                <Button
                  onClick={openCharacterDialog}
                  variant="outline"
                  size="sm"
                  className="w-12 h-12 p-0"
                  title="시험관"
                >
                  <span className="text-lg">👩‍🏫</span>
                </Button>
                {/* 음성 파동 + 상태 점 오버레이 (compact) */}
                <div className="relative">
                  <div className="bg-card rounded-lg p-3 shadow-lg border border-border">
                    <VoicePulse
                      active={isListening || isResponding}
                      size={36}
                    />
                  </div>
                  <span
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ring-2 ring-card ${
                      connecting
                        ? "bg-amber-500 animate-pulse"
                        : isListening
                          ? "bg-red-500 animate-pulse"
                          : isResponding
                            ? "bg-blue-500 animate-pulse"
                            : connected
                              ? "bg-emerald-500"
                              : "bg-gray-400"
                    }`}
                  />
                </div>

                {/* 중단 버튼 */}
                <Button
                  onClick={() => {
                    stopVoice();
                    setVoiceEnabled(false);
                    disconnect();
                    clearChat();
                  }}
                  variant="destructive"
                  size="sm"
                  className="w-12 h-12 p-0"
                  title="시험 중단"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>

                {/* 시험 내용 클리어 버튼 (연결된 상태에서만) */}
                {connected && (
                  <Button
                    onClick={clearChat}
                    variant="outline"
                    size="sm"
                    className="w-12 h-12 p-0"
                    title="시험 내용 지우기"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}

                {/* 빠른 테스트 버튼 (연결된 상태에서만) */}
                {connected && (
                  <Button
                    onClick={async () => {
                      try {
                        // 기존 대화 내용 지우기
                        clearChat();
                        // 1문제 빠른 시험 시작
                        await triggerSingleExam();
                      } catch (error) {
                        console.error("빠른 테스트 시작 실패:", error);
                        alert("빠른 테스트를 시작할 수 없습니다.");
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="w-12 h-12 p-0 bg-green-100 hover:bg-green-200"
                    title="빠른 테스트"
                    disabled={examSending}
                  >
                    <span className="text-lg">⚡</span>
                  </Button>
                )}
              </>
            ) : (
              <>
                {/* 시험관 아바타 */}
                <Button
                  onClick={openCharacterDialog}
                  variant="outline"
                  size="sm"
                  className="w-12 h-12 p-0"
                  title="시험관"
                >
                  <span className="text-lg">👩‍🏫</span>
                </Button>

                {/* Connection and Exam Buttons */}
                {!connected ? (
                  <div className="relative inline-block">
                    <Button
                      onClick={async () => {
                        // WebSocket 연결 확인
                        if (user && !connected) {
                          connect(
                            "general",
                            user.name,
                            user.email,
                            "전체 채팅",
                          );
                        }

                        // 음성 시작 (시험 시작은 별도)
                        if (!voiceEnabled) {
                          setVoiceEnabled(true);
                          await startVoice();
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="h-12 px-6 text-sm"
                      disabled={connecting}
                    >
                      {connecting ? "연결중..." : "연결"}
                    </Button>
                    <span
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ring-2 ring-card ${
                        connecting
                          ? "bg-amber-500 animate-pulse"
                          : connected
                            ? "bg-emerald-500"
                            : "bg-gray-400"
                      }`}
                    />
                  </div>
                ) : (
                  <Button
                    onClick={async () => {
                      try {
                        // 기존 대화 내용 지우기
                        clearChat();
                        // 1문제 빠른 테스트 시작
                        await triggerSingleExam();
                      } catch (error) {
                        console.error("빠른 테스트 시작 실패:", error);
                        alert("빠른 테스트를 시작할 수 없습니다.");
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="h-12 px-4 text-sm bg-green-100 hover:bg-green-200"
                    disabled={examSending}
                  >
                    {examSending ? "준비중..." : "빠른 테스트"}
                  </Button>
                )}
              </>
            )}
          </div>

          {/* 음성 상태 표시: 활성 상태에서만 노출 (idle 시 숨김) */}
          {voiceEnabled && isRecording && (isListening || isResponding) && (
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

      {/* 시험 채팅 영역 */}
      <div
        className="h-[calc(100vh-200px)] overflow-y-scroll overscroll-contain p-4 space-y-3"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p className="mb-2">🎓 영어 회화 시험을 시작해 보세요!</p>
            <p className="text-sm">
              음성으로 답변하거나 아래 입력창을 사용하세요.
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

            {/* 임시 음성 메시지 표시 (optimistic UI) */}
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

      {/* 테스트 입력 영역 */}
      {connected && (
        <div className="bg-card border-t border-border p-4 flex-shrink-0">
          <div className="flex items-center space-x-2">
            {/* 왼쪽 미니 버튼들 */}
            <div className="flex flex-col space-y-1">
              <Button
                onClick={suggestReply}
                variant="outline"
                size="sm"
                className={`w-8 h-8 p-0 ${suggestLoading ? "animate-pulse" : ""}`}
                title="답변 도움말"
                disabled={suggestLoading}
              >
                <SparklesIcon className="h-3 w-3" />
              </Button>

              <Button
                onClick={async () => {
                  if (playingInputText) {
                    stopInputSpeech();
                  } else {
                    await playInputText(newMessage);
                  }
                }}
                variant="outline"
                size="sm"
                className={`w-8 h-8 p-0 ${playingInputText ? "animate-pulse" : ""}`}
                title={playingInputText ? "읽기 중지" : "내 답변 듣기"}
                disabled={!newMessage.trim()}
              >
                {playingInputText ? (
                  <PauseIcon className="h-3 w-3 text-red-500" />
                ) : (
                  <SpeakerWaveIcon className="h-3 w-3 text-blue-500" />
                )}
              </Button>
            </div>

            {/* 텍스트 입력 */}
            <textarea
              rows={3}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                // 자동 높이 조절 (최대 5줄)
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                const lineHeight = parseInt(
                  getComputedStyle(target).lineHeight,
                );
                const maxHeight = lineHeight * 5; // 5줄 최대
                const newHeight = Math.min(target.scrollHeight, maxHeight);
                target.style.height = `${newHeight}px`;
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
                  sendMessage();
                }
              }}
              placeholder={
                suggestLoading ? "AI 응답 생성 중…" : "답변을 입력하세요..."
              }
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none text-[13px] md:text-sm placeholder:text-muted-foreground overflow-y-auto"
              style={{
                minHeight: "4.5rem",
                maxHeight: "7.5rem", // 5줄 정도의 최대 높이
              }}
            />

            {/* 오른쪽 미니 버튼들 */}
            <div className="flex flex-col space-y-1">
              <Button
                onClick={() => openTranslation(newMessage)}
                disabled={!newMessage.trim()}
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                title="번역"
              >
                <LanguageIcon className="h-3 w-3" />
              </Button>

              <Button
                onClick={sendMessage}
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
      )}

      {/* 설정 드롭다운 */}
      <MobileSettingsDropdown
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        characterOptions={CHARACTER_PRESETS.map((c) => ({
          id: c.id,
          name: c.name,
          emoji: c.emoji,
        }))}
        selectedCharacterId={selectedCharacterId}
        onSelectCharacter={(id: string) =>
          setSelectedCharacterId(id as (typeof CHARACTER_PRESETS)[number]["id"])
        }
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
        responseDelayMs={responseDelayMs}
        onResponseDelayChange={setResponseDelayMs}
        debugEvents={debugEvents}
        onDebugEventsChange={setDebugEvents}
        maxSentenceCount={maxSentenceCount}
        onMaxSentenceCountChange={setMaxSentenceCount}
        englishLevel={englishLevel}
        onEnglishLevelChange={setEnglishLevel}
        onClearChat={clearChat}
      />

      {/* Character/Scenario/Gender Dialog */}
      <MobileCharacterDialog
        open={characterDialogOpen}
        onClose={closeCharacterDialog}
        value={getCurrentDialogValue()}
        onConfirm={(v) => {
          applyCharacterSettings(v);

          if (voiceConn && isRecording) {
            stopVoice();
            setTimeout(async () => {
              setVoiceEnabled(true);
              await startVoice();
            }, 500);
          }
        }}
      />

      {/* Translation Dialog (mobile) */}
      <MobileTranslationDialog
        open={translationOpen}
        onClose={() => setTranslationOpen(false)}
        text={translationText}
        onInsertText={(text: string) => setNewMessage(text)}
      />

      {/* My Conversation Archive Dialog */}
      <MyConversationArchive
        open={conversationArchiveDialogOpen}
        onClose={() => setConversationArchiveDialogOpen(false)}
        onInsertConversation={(text: string) => setNewMessage(text)}
      />

      {/* Korean Input Dialog */}
      <KoreanInputDialog
        isOpen={koreanInputDialogOpen}
        onClose={() => setKoreanInputDialogOpen(false)}
        onInsertText={(text: string) => setNewMessage(text)}
      />

      {/* Exam Results Slide Down */}
      <ExamResultsSlideDown
        examResultText={examResultsText}
        isVisible={examResultsVisible}
        onClose={() => setExamResultsVisible(false)}
      />

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
