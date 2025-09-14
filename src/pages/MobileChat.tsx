import { useState, useEffect } from "react";
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
  BookOpenIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
// no solid icons needed currently
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
import MobileTranslationDialog from "../components/MobileTranslationDialog";
import CustomQuestionGenerator from "../components/CustomQuestionGenerator";
import CardForChattingMessageWithTranslation from "../components/CardForChattingMessageWithTranslation";
import MyConversationArchive from "../components/MyConversationArchive";
import { useExamMode } from "../features/chatbot/exam";
import { useAudioSettings } from "../features/chatbot/settings";
import { useConnectionState } from "../features/chatbot/connection";

export default function MobileChat() {
  const { logout, getUser } = useAuthStore();
  const navigate = useNavigate();

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

  // zustand store에서 캐릭터 상태 가져오기
  const { personaCharacter, personaGender } = useCharacterStore();

  // 채팅방 연결 상태 훅
  const {
    isConnected,
    isConnecting,
    connectToChatRoom,
    disconnect,
    ensureChatRoomConnected,
  } = useConnectionState({
    chatbotConfig: defaultChatbot,
  });

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
    },
    setSpeechLang,
    setEchoCancellation,
    setNoiseSuppression,
    setAutoGainControl,
    setCoalesceDelayMs,
    setResponseDelayMs,
    setDebugEvents,
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

  // CHARACTER_LIST에서 실제 캐릭터 찾기
  const actualPersonaCharacter =
    CHARACTER_LIST.find((c) => c.id === personaCharacter.id) ||
    CHARACTER_LIST[0];

  // 임시 음성 메시지 상태 (optimistic UI용)
  const [tempVoiceMessage, setTempVoiceMessage] = useState<string | null>(null);

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
    onAssistantMessage: addAssistantMessage,
    onUserSpeechStart: () => {
      // 음성 시작 시 임시 메시지 표시
      console.log("🎤 음성 시작 - 임시 메시지 표시");
      setTempVoiceMessage("🎤 말하는 중...");
    },
    onUserTranscriptUpdate: (text: string, isFinal: boolean) => {
      // 실시간 텍스트 업데이트
      if (!isFinal && text.trim()) {
        console.log("🎤 실시간 업데이트:", text);
        setTempVoiceMessage(text);
      } else if (isFinal) {
        // 음성 인식 완료 시 임시 메시지 제거
        console.log("🎤 음성 인식 완료 - 임시 메시지 제거");
        setTempVoiceMessage(null);
      }
    },
  });

  // 캐릭터 변경 시 기본 음성 동기화는 useCharacterSelection 훅에서 처리

  // 시험 모드 훅 (ensureConnectedAndReady 함수 정의 후 초기화)
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const ensureConnectedAndReady = async () => {
    // Ensure chat room joined (using connection hook)
    await ensureChatRoomConnected();

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
    onAddAssistantMessage: addAssistantMessage,
    ensureConnectedAndReady,
  });

  const openTranslation = (text: string) => {
    setTranslationText(text);
    setTranslationOpen(true);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Hidden audio sink for AI voice */}
      <audio ref={audioRef} autoPlay style={{ display: "none" }} />

      {/* 고정 헤더 */}
      <div className="bg-white shadow-sm border-b flex-shrink-0 sticky top-0 z-40">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {defaultChatbot.name}
                </h1>
                <p className="text-xs text-gray-600">
                  {user?.name
                    ? `${user.name}님`
                    : user?.email
                      ? `${user.email}님`
                      : "로그인된 사용자"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* 연습장 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/practice")}
                title="연습장"
                className="w-9 px-0"
              >
                <BookOpenIcon className="h-4 w-4" />
              </Button>

              {/* 나의 대화 아카이브 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConversationArchiveDialogOpen(true)}
                title="나의 대화 아카이브"
                className="w-9 px-0"
              >
                <ArchiveBoxIcon className="h-4 w-4" />
              </Button>

              {/* 설정 버튼 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSettingsOpen(true)}
                title="설정"
                className="w-9 px-0"
              >
                <Cog6ToothIcon className="h-4 w-4" />
              </Button>

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

          {/* 상단 배지는 제거하고, 마이크/버튼에 상태 점을 오버레이로 표시 */}
          <div className="mb-2" />

          {/* 음성 시작 버튼 또는 파동 표시 */}
          <div className="flex justify-center items-center space-x-3">
            {voiceEnabled && isRecording ? (
              <>
                {/* 캐릭터 아바타 (역할극용) */}
                <button
                  onClick={openCharacterDialog}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center border border-amber-300 shadow-sm"
                  title={`${personaCharacter.name} (role-play)`}
                >
                  <span className="text-base">{personaCharacter.emoji}</span>
                </button>
                {/* 음성 파동 + 상태 점 오버레이 (compact) */}
                <div className="relative">
                  <div className="bg-white rounded-full p-3 shadow-lg border border-gray-200">
                    <VoicePulse
                      active={isListening || isResponding}
                      size={36}
                    />
                  </div>
                  <span
                    className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      isConnecting
                        ? "bg-yellow-500"
                        : isListening
                          ? "bg-red-500 animate-pulse"
                          : isResponding
                            ? "bg-blue-500 animate-pulse"
                            : isConnected
                              ? "bg-green-500"
                              : "bg-gray-400"
                    }`}
                  />
                </div>

                {/* 중단 버튼 */}
                <button
                  onClick={() => {
                    stopVoice();
                    setVoiceEnabled(false);
                    disconnect(); // 훅을 사용한 연결 해제
                    // 연결 끊을 때 대화 내용 초기화
                    clearChat();
                  }}
                  className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  title="음성 연결 중단"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>

                {/* 대화 내용 클리어 버튼 (연결된 상태에서만) */}
                {isConnected && (
                  <button
                    onClick={clearChat}
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex items-center justify-center"
                    title="대화 내용 지우기"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
                {/* Exam 버튼 (제일 오른쪽으로 이동) */}
                <button
                  onClick={triggerExam}
                  className="w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 transition-colors flex items-center justify-center text-xs font-medium"
                  disabled={isConnecting || examSending}
                  title="시험 모드 시작"
                >
                  {examSending ? "..." : "E"}
                </button>
              </>
            ) : (
              <>
                {/* 캐릭터 아바타 + Start 버튼 + 상태 점 오버레이 */}
                <button
                  onClick={openCharacterDialog}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center border border-amber-300 shadow-sm"
                  title={`${personaCharacter.name} (role-play)`}
                >
                  <span className="text-base">{personaCharacter.emoji}</span>
                </button>
                <div className="relative inline-block">
                  <Button
                    onClick={async () => {
                      // 채팅방 연결 (훅 사용)
                      if (!isConnected) {
                        try {
                          await connectToChatRoom();
                        } catch (error) {
                          console.error("채팅방 연결 실패:", error);
                          alert("채팅방 연결에 실패했습니다.");
                          return;
                        }
                      }

                      // 음성 시작
                      if (!voiceEnabled) {
                        setVoiceEnabled(true);
                        await startVoice();
                      }
                    }}
                    variant="default"
                    className="h-10 px-6 text-sm rounded-full"
                    disabled={isConnecting}
                  >
                    {isConnecting ? "연결중..." : "Start"}
                  </Button>
                  <span
                    className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      isConnecting
                        ? "bg-yellow-500"
                        : isListening
                          ? "bg-red-500 animate-pulse"
                          : isResponding
                            ? "bg-blue-500 animate-pulse"
                            : isConnected
                              ? "bg-green-500"
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
      {isConnected && (
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            {/* 버튼 세로 배치 컨테이너 */}
            <div className="flex flex-col space-y-2">
              {/* 챗봇 제안 버튼 (마이크 대신) */}
              <button
                onClick={suggestReply}
                className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${suggestLoading ? "bg-indigo-500 text-white animate-pulse" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
                title="AI가 다음 답변을 제안합니다"
                disabled={suggestLoading}
              >
                <SparklesIcon className="h-5 w-5" />
              </button>
              {/* 커스텀 질문 생성기 버튼 */}
              <button
                onClick={() => setCustomQuestionDialogOpen(true)}
                className="w-10 h-10 rounded-full transition-colors flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600"
                title="커스텀 질문 생성기"
              >
                🎯
              </button>
            </div>

            {/* 텍스트 입력 */}
            <div className="flex-1 flex items-center space-x-2">
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
                    !examSending &&
                    !suggestLoading
                  ) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={
                  suggestLoading ? "AI 응답 생성 중…" : "메시지를 입력하세요..."
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                style={{ minHeight: "4.5rem" }}
              />
              {/* 오른쪽 버튼들 (수직 배치) */}
              <div className="flex flex-col space-y-2">
                {/* 번역 버튼 */}
                <button
                  onClick={() => openTranslation(newMessage)}
                  disabled={!newMessage.trim()}
                  className="p-2 rounded-lg bg-green-100 hover:bg-green-200 text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="입력 텍스트 번역하기"
                >
                  <LanguageIcon className="h-4 w-4" />
                </button>

                {/* 전송 버튼 */}
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || examSending || suggestLoading}
                  size="sm"
                  className="px-3"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                </Button>
              </div>
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
    </div>
  );
}
