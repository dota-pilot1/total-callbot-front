import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../features/auth";
import { Button } from "../components/ui";
import { chatApi } from "../features/chatbot/messaging/api/chat";
import {
  PaperAirplaneIcon,
  TrashIcon,
  XMarkIcon,
  SparklesIcon,
  Cog6ToothIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
// no solid icons needed currently
import { voiceApi } from "../features/chatbot/voice/api/voice";
import {
  connectRealtimeVoice,
  type VoiceConnection,
} from "../features/chatbot/voice/lib/realtime";
import VoicePulse from "../components/VoicePulse";
import MobileSettingsDropdown from "../components/MobileSettingsDropdown";
import { examApi } from "../features/chatbot/exam/api/exam";

import MobileCharacterDialog from "../components/MobileCharacterDialog";
import { CHARACTER_LIST } from "../features/chatbot/character/characters";
import {
  useCharacterStore,
  CHARACTER_PRESETS,
  VOICE_OPTIONS,
} from "../features/chatbot/character";
import MobileTranslationDialog from "../components/MobileTranslationDialog";
import CardForChattingMessageWithTranslation from "../components/CardForChattingMessageWithTranslation";
import { getRandomExamTopic, buildExamPrompt } from "../features/chatbot/exam";

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

  // zustand store에서 캐릭터 상태 가져오기
  const {
    personaCharacter,
    personaScenario,
    personaGender,
    setCharacterSettings,
  } = useCharacterStore();

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
  const isRespondingRef = useRef(false);

  // 설정 관련 상태
  const [speechLang, setSpeechLang] = useState<"ko" | "en">("en");
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(false);
  const [coalesceDelayMs, setCoalesceDelayMs] = useState(800);
  const [responseDelayMs, setResponseDelayMs] = useState(3000); // 기본값 3초
  const [debugEvents, setDebugEvents] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [examSending, setExamSending] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);

  // Translation dialog state (mobile)
  const [translationOpen, setTranslationOpen] = useState(false);
  const [translationText, setTranslationText] = useState<string>("");

  // 캐릭터/음성 선택 상태
  const [selectedCharacterId, setSelectedCharacterId] = useState<
    (typeof CHARACTER_PRESETS)[number]["id"]
  >(CHARACTER_PRESETS[0].id);
  const [selectedVoice, setSelectedVoice] = useState<string>(
    CHARACTER_PRESETS[0].defaultVoice,
  );

  // 캐릭터 변경 시 기본 음성 동기화
  useEffect(() => {
    const c =
      CHARACTER_PRESETS.find((c) => c.id === selectedCharacterId) ||
      CHARACTER_PRESETS[0];
    setSelectedVoice(c.defaultVoice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCharacterId]);

  const [characterDialogOpen, setCharacterDialogOpen] = useState(false);

  const buildPersonaInstructions = () => {
    // 캐릭터에 따른 대표 상황(설명)
    const meta = CHARACTER_LIST.find((c) => c.id === personaCharacter.id);
    const genderNote =
      personaGender === "male"
        ? "Use a subtly masculine persona. "
        : "Use a subtly feminine persona. ";
    const voiceNote = selectedVoice ? `Voice: ${selectedVoice}. ` : "";
    const persona = meta ? `${meta.personality}\n${meta.background}` : "";

    // 기본적으로 영어로 답변, 한국어 요청 시에만 한국어 사용
    const languageNote =
      "Be direct and straightforward. Keep replies to 1-2 sentences maximum. No unnecessary explanations or elaboration. Start with a brief self-introduction when first greeting. Respond primarily in English. If the user specifically requests Korean (한국어로 답변해줘, 한글로 말해줘, etc.), then respond in Korean using formal, respectful language. ";

    return (
      `I am ${personaCharacter.name} (${personaCharacter.emoji}). ${genderNote}${voiceNote}` +
      languageNote +
      `I stay in character at all times. I avoid meta talk.\n\nMy persona notes:\n${persona}`
    );
  };

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
      if (!s || typeof s !== "string") return "";
      let normalized = s.normalize("NFC");
      normalized = normalized.replace(/[\uFFFD\u0000-\u001F]/g, "");
      normalized = normalized.replace(/\s+/g, " ").trim();
      return normalized;
    } catch (error) {
      console.warn("텍스트 정규화 실패:", error);
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
      id: crypto.randomUUID(), // 완전 고유한 ID 사용
      sender: "user" as const,
      message: normalizeText(messageContent),
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "text" as const,
    };

    // 사용자 메시지를 먼저 추가
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
            response: {
              modalities: ["audio", "text"],
              conversation: "auto",
              voice: selectedVoice,
            },
          }),
        );
        return;
      }
    } catch (e) {
      console.error("Realtime 텍스트 전송 실패:", e);
    }

    // 시뮬레이션 응답 - 간단한 setTimeout으로 처리
    setTimeout(() => {
      const botResponse = {
        id: crypto.randomUUID(),
        sender: "callbot" as const,
        message: `"${messageContent}"에 대해 답변드리겠습니다.`,
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "text" as const,
      };
      setMessages((prev) => [...prev, botResponse]);
    }, responseDelayMs);
  };

  // toggleConnection 함수 제거됨 - 더 이상 사용하지 않음

  // 음성 시작
  const startVoice = async () => {
    if (voiceConn) return;
    try {
      const session = await voiceApi.createSession({
        lang: speechLang,
        voice: selectedVoice,
      });
      let micStream: MediaStream | null = null;
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
          if (t === "output_audio_buffer.started") {
            setIsResponding(true);
            isRespondingRef.current = true;
            try {
              micStream
                ?.getAudioTracks()
                ?.forEach((tr) => (tr.enabled = false));
            } catch {}
          }
          if (t === "response.done" || t === "output_audio_buffer.stopped") {
            setIsResponding(false);
            isRespondingRef.current = false;
            try {
              micStream?.getAudioTracks()?.forEach((tr) => (tr.enabled = true));
            } catch {}
          }
        },
        onUserTranscript: (text, isFinal) => {
          if (isRespondingRef.current) return; // 어시스턴트 발화 중 전사 무시
          if (isFinal) {
            const finalText = normalizeText(text.trim());
            console.log("[음성 디버그] 최종 텍스트:", finalText);
            console.log("[음성 디버그] 이전 텍스트:", lastUserFinalRef.current);

            // 텍스트가 있으면 무조건 추가 (중복 체크 완화)
            if (finalText && finalText.length > 0) {
              console.log("[음성 디버그] 사용자 메시지 추가 중:", finalText);
              // 사용자 메시지를 즉시 추가
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now(),
                  sender: "user" as const,
                  message: finalText,
                  timestamp: new Date().toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  type: "text" as const,
                },
              ]);
              console.log("[음성 디버그] 메시지 배열에 추가 완료");
              lastUserFinalRef.current = finalText;
            } else {
              console.log("[음성 디버그] 텍스트가 비어있어서 스킵");
            }
          }
        },
        onAssistantText: (text, isFinal) => {
          if (isFinal) {
            const finalText = normalizeText(
              assistantPartialRef.current || text,
            );
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
      try {
        micStream = conn.localStream;
      } catch {}
      setIsRecording(true);
      // 세션 기본 퍼소나 업데이트
      try {
        if (conn.dc && conn.dc.readyState === "open") {
          conn.dc.send(
            JSON.stringify({
              type: "session.update",
              session: {
                instructions: buildPersonaInstructions(),
              },
            }),
          );
        } else {
          conn.dc?.addEventListener("open", () => {
            try {
              conn.dc?.send(
                JSON.stringify({
                  type: "session.update",
                  session: { instructions: buildPersonaInstructions() },
                }),
              );
            } catch {}
          });
        }
      } catch {}
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

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const ensureConnectedAndReady = async () => {
    // Ensure chat room joined
    if (!isConnected) {
      setIsConnecting(true);
      try {
        const chatRoomData = await chatApi.getOrCreateChatRoom({
          chatbotId: defaultChatbot.id,
          chatbotName: defaultChatbot.name,
        });
        await chatApi.joinChatRoom(chatRoomData.id);
        setIsConnected(true);
      } catch (e) {
        console.error("방 참여 실패:", e);
        setIsConnecting(false);
        throw e;
      }
      setIsConnecting(false);
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

  const triggerExam = async () => {
    try {
      if (examSending) return;
      setExamSending(true);
      await ensureConnectedAndReady();
    } catch (e) {
      alert(
        "연결에 실패했습니다. 마이크 권한 또는 네트워크 상태를 확인해주세요.",
      );
      return;
    }

    const topic = getRandomExamTopic();
    const prompt = buildExamPrompt(topic);
    try {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "callbot" as const,
          message: `이번 시험 주제: ${topic.ko}\n총 5문항으로 진행됩니다.`,
          timestamp: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "text" as const,
        },
      ]);
    } catch {}
    try {
      // Add user instruction into the conversation for traceability
      voiceConn!.dc.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [{ type: "input_text", text: prompt }],
          },
        }),
      );
      // Ask assistant to respond (audio + text) using current voice
      voiceConn!.dc.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["audio", "text"],
            conversation: "auto",
            voice: selectedVoice,
          },
        }),
      );
    } catch (e) {
      console.error("Exam 트리거 실패:", e);
      alert("Exam 지시를 전송하지 못했습니다. 다시 시도해주세요.");
    } finally {
      setExamSending(false);
    }
  };

  // toggleRecording 함수 제거됨 - 더 이상 사용하지 않음

  // 채팅 지우기
  const handleClearChat = () => {
    setMessages([]);
    lastUserFinalRef.current = "";
    lastAssistantFinalRef.current = "";
    assistantPartialRef.current = "";
    userPartialRef.current = "";
  };
  // AI 제안: 모범답안 엔진을 이용해 1개 제안을 받아 인풋에 채우기
  const handleSuggestReply = async () => {
    if (suggestLoading) return;
    const rev = [...messages].reverse();
    const lastBot = rev.find((m) => m.sender === "callbot")?.message || "";
    const lastUsr = rev.find((m) => m.sender === "user")?.message || "";
    if (!lastBot && !lastUsr) return;
    try {
      setSuggestLoading(true);
      const question = (lastBot || lastUsr || "").trim();
      const tail = messages
        .slice(-5)
        .map((m) => {
          const role = m.sender === "user" ? "USER" : "ASSISTANT";
          const text = String(m.message || "")
            .replace(/\s+/g, " ")
            .trim();
          return `- ${role}: ${text}`;
        })
        .join("\n");

      // 선택된 캐릭터 정보 추가
      const selectedCharacter = selectedCharacterId
        ? CHARACTER_LIST.find((c) => c.id === selectedCharacterId)
        : null;
      const characterInfo = selectedCharacter
        ? `Selected Character: ${selectedCharacter.name} - ${selectedCharacter.personality || selectedCharacter.background || "A historical figure"}`
        : "";

      const enhancedContext = `${characterInfo ? characterInfo + "\n\n" : ""}Recent conversation:
${tail}

Please suggest an appropriate question or response that:
1. Continues the conversation naturally
2. Is relevant to the selected character (if any)
3. Encourages meaningful dialogue
4. Considers the character's historical background, expertise, or personality`;

      const resp = await examApi.getSampleAnswers({
        question,
        topic: "conversation",
        level: "intermediate",
        count: 1,
        englishOnly: true,
        context: enhancedContext,
      });
      const text = (resp.samples?.[0]?.text || "").trim();
      if (text) setNewMessage(text);
    } catch (e) {
      console.error("Suggest reply failed (sample-answers):", e);
    } finally {
      setSuggestLoading(false);
    }
  };

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
                  onClick={() => setCharacterDialogOpen(true)}
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
                    setIsConnected(false);
                    // 연결 끊을 때 대화 내용 초기화
                    handleClearChat();
                  }}
                  className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  title="음성 연결 중단"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>

                {/* 대화 내용 클리어 버튼 (연결된 상태에서만) */}
                {isConnected && (
                  <button
                    onClick={handleClearChat}
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
                  onClick={() => setCharacterDialogOpen(true)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center border border-amber-300 shadow-sm"
                  title={`${personaCharacter.name} (role-play)`}
                >
                  <span className="text-base">{personaCharacter.emoji}</span>
                </button>
                <div className="relative inline-block">
                  <Button
                    onClick={async () => {
                      if (!isConnected) {
                        // 먼저 연결
                        setIsConnecting(true);
                        try {
                          const chatRoomData =
                            await chatApi.getOrCreateChatRoom({
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p className="mb-2">대화를 시작해 보세요!</p>
            <p className="text-sm">
              음성으로 말하거나 아래 입력창을 사용하세요.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <CardForChattingMessageWithTranslation
              key={message.id}
              message={message}
              isUser={message.sender === "user"}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      {isConnected && (
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            {/* 챗봇 제안 버튼 (마이크 대신) */}
            <button
              onClick={handleSuggestReply}
              className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center ${suggestLoading ? "bg-indigo-500 text-white animate-pulse" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
              title="AI가 다음 답변을 제안합니다"
              disabled={suggestLoading}
            >
              <SparklesIcon className="h-5 w-5" />
            </button>

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
                    handleSendMessage();
                  }
                }}
                placeholder={
                  suggestLoading ? "AI 응답 생성 중…" : "메시지를 입력하세요..."
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                style={{ minHeight: "4.5rem" }}
              />
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
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || examSending || suggestLoading}
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
        onClearChat={handleClearChat}
      />

      {/* Model Answers Dialog (mobile) */}

      {/* Character/Scenario/Gender Dialog */}
      <MobileCharacterDialog
        open={characterDialogOpen}
        onClose={() => setCharacterDialogOpen(false)}
        value={{
          characterId: personaCharacter.id,
          scenarioId: personaScenario,
          gender: personaGender,
          voice: selectedVoice as any,
        }}
        onConfirm={(v) => {
          console.log("Setting new character via store:", v);

          // zustand store를 통해 캐릭터 설정 업데이트
          setCharacterSettings({
            characterId: v.characterId,
            scenarioId: v.scenarioId || "",
            gender: v.gender,
            voice: v.voice,
          });

          // 기존 selectedVoice 상태도 업데이트
          setSelectedVoice(v.voice);

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
    </div>
  );
}
