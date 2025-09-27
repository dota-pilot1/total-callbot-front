import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth";
import { Button } from "../../../components/ui";

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
} from "@heroicons/react/24/outline";
// no solid icons needed currently
import { useVoiceConnection } from "../../chatbot/voice";
import { useChatMessages } from "../../chatbot/messaging";
import VoicePulse from "../../../components/VoicePulse";
import MobileSettingsDropdown from "../../../components/MobileSettingsDropdown";
// import SockJS from "sockjs-client";
// import { Stomp } from "@stomp/stompjs";

import MobileCharacterDialog from "../../../components/MobileCharacterDialog";
import { CHARACTER_LIST } from "../../chatbot/character/characters";
import {
  useCharacterStore,
  CHARACTER_PRESETS,
  VOICE_OPTIONS,
  useCharacterSelection,
} from "../../chatbot/character";
import { useWebSocketStore } from "../../websocket/stores/useWebSocketStore";
import MobileTranslationDialog from "../../../components/MobileTranslationDialog";
import CustomQuestionGenerator from "../../../components/CustomQuestionGenerator";
import KoreanInputDialog from "../../../components/KoreanInputDialog";
import CardForChattingMessageWithTranslation from "../../../components/CardForChattingMessageWithTranslation";
import { MyConversationArchive } from "../../conversation-archive";

import { useAudioSettings } from "../../chatbot/settings";
import ExamResultsSlideDown from "../../../components/ExamResultsSlideDown";
import { useExamMode } from "../../chatbot/exam";
import { useToast } from "../../../components/ui/Toast";

export default function CharacterChatbotMobilePage() {
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

  // 커스텀 질문 생성기 다이얼로그 상태
  const [customQuestionDialogOpen, setCustomQuestionDialogOpen] =
    useState(false);

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
   * 메시지에서 "Total:", "Level:", "Key phrases" 등의 키워드를 찾아 시험 결과인지 판단
   */
  const detectExamCompletion = (message: string): boolean => {
    const examCompletionIndicators = [
      "Total:",
      "Scores by question:",
      "Level:",
      "Key phrases to study",
      "References:",
      /Q[1-3]\s+\d+\/10/, // Q1 8/10 패턴
      /\d+\/30/, // 총점 패턴 (예: 22/30)
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

      // 대화 시작 토스트 (첫 번째 음성 시작 시에만)
      if (messages.length === 0) {
        setToastMessage("🎙️ 대화가 시작되었습니다!");
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

  // 캐릭터 변경 시 기본 음성 동기화는 useCharacterSelection 훅에서 처리

  // 시험 연결 및 준비 함수 (원래 exam 버튼과 동일)
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
  const { examSending, triggerExam } = useExamMode({
    voiceConnection: voiceConn,
    selectedVoice,
    ensureConnectedAndReady,
    onAddAssistantMessage: handleAssistantMessage,
  });

  const openTranslation = (text: string) => {
    setTranslationText(text);
    setTranslationOpen(true);
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Hidden audio sink for AI voice */}
      <audio ref={audioRef} autoPlay style={{ display: "none" }} />

      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-pulse">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
            {toastMessage}
          </div>
        </div>
      )}

      {/* 고정 헤더 */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 sticky top-0 z-50">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {/* 로봇 로고만 */}
              <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                <span className="text-lg">🤖</span>
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
                  console.log("Logout button clicked in CharacterChatbotMobilePage");
                  logout();
                }}
                title="로그아웃"
                aria-label="로그아웃"
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="h-3 w-3" />
                <span className="sr-only">로그아웃</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 챗봇 정보 및 연결 상태 */}
      <div className="bg-card border-b border-border p-4 flex-shrink-0">
        <div className="text-center">
          {/* <p className="text-sm text-gray-600 mb-3">AI 음성 대화 전문 어시스턴트</p> */}

          {/* 상단 배지는 제거하고, 마이크/버튼에 상태 점을 오버레이로 표시 */}
          <div className="mb-2" />

          {/* 음성 시작 버튼 또는 파동 표시 */}
          <div className="flex justify-center items-center space-x-3">
            {voiceEnabled && isRecording ? (
              <>
                {/* 캐릭터 아바타 (역할극용) */}
                <Button
                  onClick={openCharacterDialog}
                  variant="outline"
                  size="sm"
                  className="w-12 h-12 p-0"
                  title={`${personaCharacter.name} (role-play)`}
                >
                  <span className="text-lg">{personaCharacter.emoji}</span>
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
                    disconnect(); // 훅을 사용한 연결 해제
                    // 연결 끊을 때 대화 내용 초기화
                    clearChat();
                  }}
                  variant="destructive"
                  size="sm"
                  className="w-12 h-12 p-0"
                  title="음성 연결 중단"
                >
                  <XMarkIcon className="h-4 w-4" />
                </Button>

                {/* 대화 내용 클리어 버튼 (연결된 상태에서만) */}
                {connected && (
                  <Button
                    onClick={clearChat}
                    variant="outline"
                    size="sm"
                    className="w-12 h-12 p-0"
                    title="대화 내용 지우기"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}

                {/* 시험 버튼 (연결된 상태에서만) */}
                {connected && (
                  <Button
                    onClick={async () => {
                      try {
                        // 기존 대화 내용 지우기
                        clearChat();
                        // 시험 시작
                        await triggerExam();
                      } catch (error) {
                        console.error("시험 시작 실패:", error);
                        alert("시험을 시작할 수 없습니다.");
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="w-12 h-12 p-0 bg-purple-100 hover:bg-purple-200"
                    title="영어 시험 시작"
                    disabled={examSending}
                  >
                    <span className="text-lg">🎓</span>
                  </Button>
                )}
              </>
            ) : (
              <>
                {/* 캐릭터 아바타 */}
                <Button
                  onClick={openCharacterDialog}
                  variant="outline"
                  size="sm"
                  className="w-12 h-12 p-0"
                  title={`${personaCharacter.name} (role-play)`}
                >
                  <span className="text-lg">{personaCharacter.emoji}</span>
                </Button>

                {/* Start Conversation Button */}
                <div className="relative inline-block">
                  <Button
                    onClick={async () => {
                      // WebSocket 연결 확인 (자동으로 useEffect에서 처리됨)
                      if (user && !connected) {
                        connect("general", user.name, user.email, "전체 채팅");
                      }

                      // 음성 시작
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
                    {connecting ? "연결중..." : "대화 시작"}
                  </Button>
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

      {/* 채팅 영역 */}
      <div
        className="h-[calc(100vh-200px)] overflow-y-scroll overscroll-contain p-4 space-y-3"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p className="mb-2">대화를 시작해 보세요!</p>
            <p className="text-sm">
              음성으로 말하거나 아래 입력창을 사용하세요.
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

      {/* 입력 영역 */}
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
                title="AI 제안"
                disabled={suggestLoading}
              >
                <SparklesIcon className="h-3 w-3" />
              </Button>

              <Button
                onClick={() => setCustomQuestionDialogOpen(true)}
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                title="질문 생성"
              >
                <span className="text-xs">🎯</span>
              </Button>
            </div>

            {/* 텍스트 입력 */}
            <textarea
              rows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
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
                suggestLoading ? "AI 응답 생성 중…" : "메시지를 입력하세요..."
              }
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none text-[13px] md:text-sm placeholder:text-muted-foreground"
              style={{ minHeight: "4.5rem" }}
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
        // 캐릭터/목소리 선택 관련
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

      {/* Model Answers Dialog (mobile) */}

      {/* Character/Scenario/Gender Dialog */}
      <MobileCharacterDialog
        open={characterDialogOpen}
        onClose={closeCharacterDialog}
        value={getCurrentDialogValue()}
        onConfirm={(v) => {
          // 캐릭터 설정 적용 (훅에서 처리)
          applyCharacterSettings(v);

          // 세션에 즉시 반영 - 더 확실하게 하기 위해 연결 재시작
          if (voiceConn && isRecording) {
            // 현재 연결을 끊고 새로 시작
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

      {/* Custom Question Generator Dialog */}
      <CustomQuestionGenerator
        open={customQuestionDialogOpen}
        onClose={() => setCustomQuestionDialogOpen(false)}
        onInputText={(text: string) => setNewMessage(text)}
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
