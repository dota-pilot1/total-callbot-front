import { useState, useEffect, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth";
import { Button } from "../components/ui";
import Sidebar from "../components/Sidebar";
import ChatSettingsPanel from "../components/ChatSettingsPanel";
import { chatApi } from "../features/chat/api/chat";
import type { ChatRoom } from "../shared/api/chat-types";
import {
  MicrophoneIcon,
  PaperAirplaneIcon,
  CogIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  CircleStackIcon,
  CommandLineIcon,
  CpuChipIcon,
  PhoneIcon,
  ShoppingBagIcon,
  TableCellsIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  LanguageIcon,
  BuildingLibraryIcon,
  ClipboardDocumentListIcon,
  PuzzlePieceIcon,
  CalendarIcon,
  NewspaperIcon,
  DevicePhoneMobileIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import {
  MicrophoneIcon as MicrophoneIconSolid,
  SpeakerWaveIcon as SpeakerWaveIconSolid,
} from "@heroicons/react/24/solid";
import { voiceApi } from "../features/voice/api/voice";
import {
  connectRealtimeVoice,
  type VoiceConnection,
} from "../features/voice/lib/realtime";
import VoicePulse from "../components/VoicePulse";

// 아이콘 매핑 함수
const getIconComponent = (chatbotId: string) => {
  const iconMap: { [key: string]: any } = {
    backend: CommandLineIcon,
    "backend-framework": CommandLineIcon,
    frontend: PaintBrushIcon,
    "frontend-framework": PaintBrushIcon,
    devops: CpuChipIcon,
    sql: CircleStackIcon,
    ai: CpuChipIcon,
    orm: TableCellsIcon,
    "component-manager": PuzzlePieceIcon,
    "figma-expert": SwatchIcon,
    "app-developer": DevicePhoneMobileIcon,
    english: LanguageIcon,
    academy: BuildingLibraryIcon,
    interview: UserGroupIcon,
    memo: DocumentTextIcon,
    "pilot-pm": ClipboardDocumentListIcon,
    "schedule-manager": CalendarIcon,
    assistant: ComputerDesktopIcon,
    callcenter: PhoneIcon,
    wishket: BriefcaseIcon,
    ecommerce: ShoppingBagIcon,
    "tech-news": NewspaperIcon,
    "startup-news": NewspaperIcon,
  };

  return iconMap[chatbotId] || CodeBracketIcon;
};

// 임시 채팅 메시지 데이터
const mockMessages = [
  {
    id: 1,
    sender: "callbot",
    message: "안녕하세요! 콜봇입니다. 무엇을 도와드릴까요?",
    timestamp: "오후 2:30",
    type: "text",
  },
  {
    id: 2,
    sender: "user",
    message: "안녕하세요. 오늘 날씨가 어떤가요?",
    timestamp: "오후 2:31",
    type: "text",
  },
  {
    id: 3,
    sender: "callbot",
    message:
      "오늘은 맑은 날씨입니다. 기온은 22도로 따뜻하네요. 외출하기 좋은 날씨입니다!",
    timestamp: "오후 2:31",
    type: "text",
  },
];

export default function CallbotChat() {
  const { logout } = useAuthStore();
  const location = useLocation();
  const params = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // localStorage에서 직접 사용자 정보 가져오기
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

  // URL 파라미터에서 botId 가져오기
  const botId = params.botId;

  // 선택된 챗봇 데이터 가져오기 (state가 있으면 우선, 없으면 botId로 기본값 설정)
  const chatbot =
    location.state?.chatbot ||
    (botId
      ? {
          id: botId,
          name: "챗봇",
          greeting: "안녕하세요! 무엇을 도와드릴까요?",
          description: "전문 AI 어시스턴트",
          color: "from-indigo-500 to-purple-600",
        }
      : null);

  // 챗봇별 초기 메시지 설정
  const getInitialMessages = (greeting: string) => [
    {
      id: 1,
      sender: "callbot",
      message: greeting,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "text",
    },
  ];

  const [messages, setMessages] = useState(
    chatbot ? getInitialMessages(chatbot.greeting) : mockMessages,
  );
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(true);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [chatRoomDetails, setChatRoomDetails] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [voiceConn, setVoiceConn] = useState<VoiceConnection | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [speechLang, setSpeechLang] = useState<"auto" | "ko" | "en">("auto");
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(false);
  const [coalesceDelayMs, setCoalesceDelayMs] = useState(800);
  const [debugEvents, setDebugEvents] = useState(false);

  // 한글 조합/스트리밍 파편으로 인한 깨짐 완화용 정규화 (개선된 버전)
  const normalizeText = (s: string) => {
    try {
      if (!s || typeof s !== 'string') return '';
      
      // NFC 정규화 (한글 조합 문자 정규화)
      let normalized = s.normalize("NFC");

      // 완전히 깨진 문자나 제어 문자만 제거 (한글 자모는 보존)
      // \uFFFD는 replacement character (깨진 문자)
      // \u0000-\u001F는 제어 문자
      normalized = normalized.replace(/[\uFFFD\u0000-\u001F]/g, "");

      // 연속된 공백만 정리 (탭, 줄바꿈 등도 공백으로 통일)
      normalized = normalized.replace(/\s+/g, " ").trim();

      return normalized;
    } catch (error) {
      console.warn('텍스트 정규화 실패:', error);
      return (s || "").trim();
    }
  };
  const userPartialRef = useRef<string>("");
  const assistantPartialRef = useRef<string>("");
  const lastUserFinalRef = useRef<string>("");
  const lastAssistantFinalRef = useRef<string>("");
  const processedAssistantKeysRef = useRef<Set<string>>(new Set());
  const userAggRef = useRef<
    Map<string, { buffer: string; completed: boolean }>
  >(new Map());
  const userCoalesceRef = useRef<{ buffer: string; timer: any }>({
    buffer: "",
    timer: null,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 새 메시지 도착 시 자동 스크롤
  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {}
  }, [messages]);

  // 챗봇이 로드되면 채팅방 목록 불러오기
  useEffect(() => {
    if (chatbot && !isConnected) {
      loadBotChatRooms();
    }
  }, [chatbot, isConnected]);

  const loadBotChatRooms = async () => {
    if (!chatbot) return;

    try {
      setLoadingRooms(true);
      const allRooms = await chatApi.getChatRooms();
      // 선택한 챗봇과 관련된 채팅방만 필터링
      const botRooms = allRooms.filter(
        (room) =>
          (room as any).botType === chatbot.id ||
          (room as any).botId === chatbot.id,
      );
      setChatRooms(botRooms);
    } catch (err) {
      console.error("Error loading bot chat rooms:", err);
    } finally {
      setLoadingRooms(false);
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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    // 로컬 시뮬레이션 (채팅방이 없는 경우)
    const userMessage = {
      id: messages.length + 1,
      sender: "user" as const,
      message: messageContent,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "text" as const,
    };

    setMessages([...messages, userMessage]);

    // 선택된 챗봇별 맞춤 응답 시뮬레이션
    setTimeout(() => {
      const getBotResponse = (message: string, botId: string) => {
        const responses: { [key: string]: string } = {
          backend: `백엔드 관점에서 "${message}"에 대해 설명드리겠습니다. API 설계나 데이터베이스 구조를 고려하면...`,
          "backend-framework": `백엔드 프레임워크 관점에서 "${message}"에 대해 분석해드리겠습니다. Express나 Spring Boot를 사용한다면...`,
          frontend: `사용자 경험 측면에서 "${message}"를 살펴보겠습니다. React나 Vue.js로 구현한다면...`,
          "frontend-framework": `프론트엔드 프레임워크 관점에서 "${message}"에 대해 설명드립니다. React와 Next.js의 차이점을 고려하면...`,
          devops: `인프라와 배포 관점에서 "${message}"를 분석해보겠습니다. Docker나 Kubernetes를 활용하면...`,
          sql: `데이터베이스 최적화 관점에서 "${message}"에 대해 답변드립니다. 쿼리 성능을 고려하면...`,
          ai: `머신러닝 관점에서 "${message}"를 해석해보겠습니다. 알고리즘 선택과 데이터 전처리가 중요한데...`,
          orm: `ORM 최적화 관점에서 "${message}"에 답변드립니다. Sequelize나 Prisma를 사용한다면...`,
          "component-manager": `컴포넌트 재사용성 관점에서 "${message}"에 답변드립니다. Design System과 Storybook을 활용하면...`,
          "figma-expert": `UI/UX 디자인 관점에서 "${message}"에 대해 도움드리겠습니다. Figma로 프로토타입을 제작한다면...`,
          "app-developer": `모바일 앱 개발 관점에서 "${message}"를 분석해보겠습니다. React Native와 Flutter를 비교하면...`,
          english: `개발자 영어 관점에서 "${message}"에 대해 설명드립니다. 기술 용어를 영어로 표현하면...`,
          academy: `교육 과정 관점에서 "${message}"에 대해 안내드립니다. 단계별 학습 로드맵을 제시하면...`,
          interview: `면접 전략 관점에서 "${message}"에 답변드립니다. 기술 면접에서는 이런 점을 강조하세요...`,
          memo: `문서화 관점에서 "${message}"를 체계적으로 정리해보겠습니다. Markdown 형식으로...`,
          "pilot-pm": `파일럿 프로젝트 관점에서 "${message}"를 분석해보겠습니다. MVP 범위 설정과 위험 요소를 고려하면...`,
          "schedule-manager": `프로젝트 일정 관점에서 "${message}"를 계획해보겠습니다. 스프린트와 마일스톤을 고려하면...`,
          assistant: `업무 효율성 관점에서 "${message}"를 정리해드리겠습니다. 시간 관리와 우선순위 설정이...`,
          callcenter: `고객 서비스 관점에서 "${message}"에 대해 조언드립니다. 고객 만족도를 높이려면...`,
          wishket: `프리랜싱 프로젝트 관점에서 "${message}"에 대해 조언드립니다. 클라이언트와의 소통에서...`,
          ecommerce: `이커머스 전략 관점에서 "${message}"를 분석해보겠습니다. 사용자 구매 여정을 고려하면...`,
          "tech-news": `최신 기술 동향 관점에서 "${message}"에 대해 분석해드리겠습니다. 최근 트렌드를 보면...`,
          "startup-news": `스타트업 생태계 관점에서 "${message}"에 대해 설명드립니다. 최근 투자 동향과 창업 트렌드를 고려하면...`,
        };

        return (
          responses[botId] ||
          `"${message}"에 대해 답변드리겠습니다. 더 자세한 정보가 필요하시면 말씀해 주세요!`
        );
      };

      const botResponse = {
        id: messages.length + 2,
        sender: "callbot" as const,
        message: getBotResponse(newMessage, chatbot?.id || "default"),
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "text" as const,
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1500);
  };

  const toggleConnection = async () => {
    if (isConnected) {
      // 연결 해제: 웹소켓 닫기 (향후 추가)
      setIsConnected(false);
      setChatRoomId(null);
      setChatRoomDetails(null);
      // 음성 연결 해제
      try {
        voiceConn?.stop();
      } catch {}
      setVoiceConn(null);
      setIsRecording(false);
      // 연결 아님: 음성 인식 모드 자동 해제
      setVoiceEnabled(false);
    } else {
      // 연결 시작: 방 참여
      setIsConnecting(true);

      try {
        // 1. 채팅방 생성 또는 조회
        const chatRoomData = await chatApi.getOrCreateChatRoom({
          chatbotId: chatbot?.id || "default",
          chatbotName: chatbot?.name || "챗봇",
        });

        // 2. 방 참여
        await chatApi.joinChatRoom(chatRoomData.id);

        // 3. 방 세부정보 조회
        const roomDetails = await chatApi.getChatRoomDetails(chatRoomData.id);

        // 4. 상태 업데이트
        setChatRoomId(chatRoomData.id);
        setChatRoomDetails(roomDetails);
        setIsConnected(true);

        console.log("방 참여 성공:", chatRoomData.id, roomDetails);

        // 음성 사용 설정 시, 연결 직후 음성 연결 시도
        if (voiceEnabled) {
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
                // 디버그: "내가 말한(사용자 입력)" 이벤트만 로깅
                const e: any = evt as any;
                const t = e?.type as string | undefined;
                const isUserEvt =
                  !!t &&
                  (t.startsWith("input_audio_buffer") ||
                    t.startsWith(
                      "conversation.item.input_audio_transcription",
                    ));
                if (
                  debugEvents &&
                  (t === "input_audio_buffer.transcript.completed" ||
                    t ===
                      "conversation.item.input_audio_transcription.completed")
                ) {
                  const tx = e?.transcript ?? "";
                  if (tx) console.debug("[voice:user:final]", tx);
                }
                // 듣는 중 / 응답 중 상태 갱신
                if (t === "input_audio_buffer.speech_started")
                  setIsListening(true);
                if (t === "input_audio_buffer.speech_stopped")
                  setIsListening(false);
                if (t === "output_audio_buffer.started") setIsResponding(true);
                if (
                  t === "response.done" ||
                  t === "output_audio_buffer.stopped"
                )
                  setIsResponding(false);
                // 일부 모델은 사용자 전사 최종본을 별도 done 없이 버퍼 정지 시그널로 마무리합니다.
                try {
                  if (
                    (e?.type === "input_audio_buffer.stopped" ||
                      e?.type === "response.input_audio_buffer.stopped") &&
                    e?.item_id
                  ) {
                    const key = e.item_id as string;
                    const agg = userAggRef.current.get(key);
                    const finalText = (agg?.buffer || "").trim();
                    if (
                      finalText &&
                      !agg?.completed &&
                      finalText !== lastUserFinalRef.current.trim()
                    ) {
                      // 코얼레스: 짧게 분할된 문장을 하나로 합쳐 일정 시간 후 확정
                      const agg2 = userCoalesceRef.current;
                      agg2.buffer =
                        (agg2.buffer ? agg2.buffer + " " : "") + finalText;
                      if (agg2.timer) clearTimeout(agg2.timer);
                      agg2.timer = setTimeout(() => {
                        const merged = normalizeText(
                          userCoalesceRef.current.buffer,
                        );
                        const lastNormalized = normalizeText(
                          lastUserFinalRef.current,
                        );
                        if (
                          merged &&
                          merged.length > 0 &&
                          merged !== lastNormalized
                        ) {
                          setMessages((prev) => [
                            ...prev,
                            {
                              id: prev.length + 1,
                              sender: "user" as const,
                              message: merged,
                              timestamp: new Date().toLocaleTimeString(
                                "ko-KR",
                                { hour: "2-digit", minute: "2-digit" },
                              ),
                              type: "text" as const,
                            },
                          ]);
                          lastUserFinalRef.current = merged;
                        }
                        userCoalesceRef.current = { buffer: "", timer: null };
                      }, coalesceDelayMs);
                    }
                    userAggRef.current.delete(key);
                  }
                } catch {}
              },
              onUserTranscript: (text, isFinal, meta) => {
                const key = meta?.itemId || "default";
                const agg = userAggRef.current.get(key) || {
                  buffer: "",
                  completed: false,
                };
                if (!isFinal) {
                  agg.buffer += text;
                  userAggRef.current.set(key, agg);
                } else {
                  agg.buffer = agg.buffer || text;
                  agg.completed = true;
                  userAggRef.current.set(key, agg);
                  const finalText = normalizeText(agg.buffer.trim());
                  if (debugEvents && finalText)
                    console.debug("[voice:user:final]", finalText);
                  if (finalText) {
                    const agg2 = userCoalesceRef.current;
                    agg2.buffer =
                      (agg2.buffer ? agg2.buffer + " " : "") + finalText;
                    if (agg2.timer) clearTimeout(agg2.timer);
                    agg2.timer = setTimeout(() => {
                      const merged = normalizeText(
                        userCoalesceRef.current.buffer,
                      );
                      const lastNormalized = normalizeText(
                        lastUserFinalRef.current,
                      );
                      if (
                        merged &&
                        merged.length > 0 &&
                        merged !== lastNormalized
                      ) {
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: prev.length + 1,
                            sender: "user" as const,
                            message: merged,
                            timestamp: new Date().toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }),
                            type: "text" as const,
                          },
                        ]);
                        lastUserFinalRef.current = merged;
                      }
                      userCoalesceRef.current = { buffer: "", timer: null };
                    }, coalesceDelayMs);
                  }
                  userAggRef.current.delete(key);
                }
              },
              onAssistantText: (text, isFinal, meta) => {
                if (!isFinal) {
                  assistantPartialRef.current += text;
                } else {
                  const finalText = normalizeText(
                    assistantPartialRef.current || text,
                  );
                  const key = `${meta?.responseId || "noresp"}:${meta?.outputIndex ?? -1}`;
                  if (
                    meta?.responseId &&
                    processedAssistantKeysRef.current.has(key)
                  ) {
                    assistantPartialRef.current = "";
                    return;
                  }
                  const normalizedFinal = normalizeText(finalText);
                  const normalizedLast = normalizeText(
                    lastAssistantFinalRef.current,
                  );
                  if (normalizedFinal === normalizedLast) {
                    assistantPartialRef.current = "";
                    return;
                  }
                  if (normalizedFinal) {
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
                    if (meta?.responseId)
                      processedAssistantKeysRef.current.add(key);
                  }
                  assistantPartialRef.current = "";
                }
              },
            });
            setVoiceConn(conn);
            setIsRecording(true);
          } catch (e) {
            console.error("음성 연결 실패:", e);
          }
        }
      } catch (error) {
        console.error("방 참여 실패:", error);
        alert("채팅방 참여에 실패했습니다.");
      } finally {
        setIsConnecting(false);
      }
    }
  };

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
          const isUserEvt =
            !!t &&
            (t.startsWith("input_audio_buffer") ||
              t.startsWith("conversation.item.input_audio_transcription"));
          if (
            debugEvents &&
            (t === "input_audio_buffer.transcript.completed" ||
              t === "conversation.item.input_audio_transcription.completed")
          ) {
            const tx = e?.transcript ?? "";
            if (tx) console.debug("[voice:user:final]", tx);
          }
          if (t === "input_audio_buffer.speech_started") setIsListening(true);
          if (t === "input_audio_buffer.speech_stopped") setIsListening(false);
          if (t === "output_audio_buffer.started") setIsResponding(true);
          if (t === "response.done" || t === "output_audio_buffer.stopped")
            setIsResponding(false);
          try {
            if (
              (e?.type === "input_audio_buffer.stopped" ||
                e?.type === "response.input_audio_buffer.stopped") &&
              e?.item_id
            ) {
              const key = e.item_id as string;
              const agg = userAggRef.current.get(key);
              const finalText = (agg?.buffer || "").trim();
              if (
                finalText &&
                !agg?.completed &&
                finalText !== lastUserFinalRef.current.trim()
              ) {
                const agg2 = userCoalesceRef.current;
                agg2.buffer =
                  (agg2.buffer ? agg2.buffer + " " : "") + finalText;
                if (agg2.timer) clearTimeout(agg2.timer);
                agg2.timer = setTimeout(() => {
                  const merged = normalizeText(userCoalesceRef.current.buffer);
                  const lastNormalized = normalizeText(
                    lastUserFinalRef.current,
                  );
                  if (
                    merged &&
                    merged.length > 0 &&
                    merged !== lastNormalized
                  ) {
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: prev.length + 1,
                        sender: "user" as const,
                        message: merged,
                        timestamp: new Date().toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        type: "text" as const,
                      },
                    ]);
                    lastUserFinalRef.current = merged;
                  }
                  userCoalesceRef.current = { buffer: "", timer: null };
                }, coalesceDelayMs);
              }
              userAggRef.current.delete(key);
            }
          } catch {}
        },
        onUserTranscript: (text, isFinal, meta) => {
          const key = meta?.itemId || "default";
          const agg = userAggRef.current.get(key) || {
            buffer: "",
            completed: false,
          };
          if (!isFinal) {
            agg.buffer += text;
            userAggRef.current.set(key, agg);
          } else {
            agg.buffer = agg.buffer || text;
            agg.completed = true;
            userAggRef.current.set(key, agg);
            const finalText = normalizeText(agg.buffer.trim());
            if (debugEvents && finalText)
              console.debug("[voice:user:final]", finalText);
            if (finalText) {
              const agg2 = userCoalesceRef.current;
              agg2.buffer = (agg2.buffer ? agg2.buffer + " " : "") + finalText;
              if (agg2.timer) clearTimeout(agg2.timer);
              agg2.timer = setTimeout(() => {
                const merged = normalizeText(userCoalesceRef.current.buffer);
                const lastNormalized = normalizeText(lastUserFinalRef.current);
                if (merged && merged.length > 0 && merged !== lastNormalized) {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: prev.length + 1,
                      sender: "user" as const,
                      message: merged,
                      timestamp: new Date().toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      type: "text" as const,
                    },
                  ]);
                  lastUserFinalRef.current = merged;
                }
                userCoalesceRef.current = { buffer: "", timer: null };
              }, coalesceDelayMs);
            }
            userAggRef.current.delete(key);
          }
        },
        onAssistantText: (text, isFinal, meta) => {
          if (!isFinal) {
            assistantPartialRef.current += text;
          } else {
            const finalText = normalizeText(
              assistantPartialRef.current || text,
            );
            const key = `${meta?.responseId || "noresp"}:${meta?.outputIndex ?? -1}`;
            if (
              meta?.responseId &&
              processedAssistantKeysRef.current.has(key)
            ) {
              assistantPartialRef.current = "";
              return;
            }
            const normalizedFinal = normalizeText(finalText);
            const normalizedLast = normalizeText(lastAssistantFinalRef.current);
            if (normalizedFinal === normalizedLast) {
              assistantPartialRef.current = "";
              return;
            }
            if (normalizedFinal) {
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
              if (meta?.responseId) processedAssistantKeysRef.current.add(key);
            }
            assistantPartialRef.current = "";
          }
        },
      });
      setVoiceConn(conn);
      setIsRecording(true);
    } catch (e) {
      console.error("음성 연결 실패:", e);
    }
  };

  const stopVoice = () => {
    try {
      voiceConn?.stop();
    } catch {}
    setVoiceConn(null);
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (!isConnected || !voiceEnabled) return;
    if (isRecording) {
      stopVoice();
    } else {
      startVoice();
    }
  };

  // 대화 지우기: 초기 인삿말만 남기고 상태/버퍼 초기화
  const handleClearChat = () => {
    const greeting = chatbot?.greeting || "안녕하세요! 무엇을 도와드릴까요?";
    setMessages(getInitialMessages(greeting));
    lastUserFinalRef.current = "";
    lastAssistantFinalRef.current = "";
    assistantPartialRef.current = "";
    userPartialRef.current = "";
    processedAssistantKeysRef.current.clear();
    userAggRef.current.clear();
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Hidden audio sink for AI voice */}
      <audio ref={audioRef} autoPlay style={{ display: "none" }} />
      {/* 헤더 */}
      <nav className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {chatbot?.name.slice(0, 2) || "콜"}
                </span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                {chatbot?.name || "콜봇"} 채팅
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name || user?.email || "게스트"}님
              </span>
              <Button
                variant="outline"
                onClick={() => {
                  console.log("Logout button clicked in CallbotChat");
                  logout();
                }}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 사이드바 */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col">
          {/* 메인 콘텐츠 */}
          <main className="flex flex-1 overflow-hidden">
            {/* 왼쪽: 콜봇 아바타 및 연결 */}
            <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
              <div className="text-center mb-6">
                <div
                  className={`w-24 h-24 mx-auto mb-3 bg-gradient-to-br ${chatbot?.color || "from-indigo-500 to-purple-600"} rounded-full flex items-center justify-center`}
                >
                  {chatbot?.id ? (
                    (() => {
                      const IconComponent = getIconComponent(chatbot.id);
                      return <IconComponent className="h-12 w-12 text-white" />;
                    })()
                  ) : (
                    <span className="text-white text-2xl font-bold">콜봇</span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {chatbot?.name || "AI 콜봇"}
                </h3>
                {chatbot && (
                  <p className="text-sm text-gray-600 mb-2 text-center">
                    {chatbot.description}
                  </p>
                )}
                <div className="flex items-center justify-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400" : isConnecting ? "bg-yellow-400" : "bg-gray-400"}`}
                  ></div>
                  <span
                    className={`text-sm ${isConnected ? "text-green-600" : isConnecting ? "text-yellow-600" : "text-gray-500"}`}
                  >
                    {isConnecting
                      ? "연결중..."
                      : isConnected
                        ? "연결됨"
                        : "연결 대기중"}
                  </span>
                </div>

                {/* 방 정보 표시 */}
                {isConnected && chatRoomId && (
                  <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs text-green-800 space-y-1">
                      <div>
                        <span className="font-medium">방 ID:</span> {chatRoomId}
                      </div>
                      {chatRoomDetails?.participantCount && (
                        <div>
                          <span className="font-medium">참여자:</span>{" "}
                          {chatRoomDetails.participantCount}명
                        </div>
                      )}
                      {chatRoomDetails?.createdAt && (
                        <div>
                          <span className="font-medium">생성:</span>{" "}
                          {new Date(chatRoomDetails.createdAt).toLocaleString(
                            "ko-KR",
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Button
                  onClick={toggleConnection}
                  variant={isConnected ? "destructive" : "default"}
                  className="w-full"
                  disabled={isConnecting}
                >
                  {isConnecting
                    ? "연결중..."
                    : isConnected
                      ? "연결 해제"
                      : "콜봇 연결하기"}
                </Button>

                <Button variant="outline" className="w-full">
                  콜봇 소개
                </Button>

                {/* 음성 인식 모드 토글 (콜봇 소개 아래) */}
                <div
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 ${isConnected ? "border-gray-200" : "border-gray-100 bg-gray-50"}`}
                >
                  <span className="text-sm text-gray-700">음성 인식 모드</span>
                  <button
                    onClick={() => {
                      const next = !voiceEnabled;
                      setVoiceEnabled(next);
                      if (isConnected) {
                        if (next && !isRecording) {
                          // enable and start voice
                          startVoice();
                        } else if (!next && isRecording) {
                          // disable and stop voice
                          stopVoice();
                        }
                      }
                    }}
                    disabled={!isConnected}
                    title={isConnected ? "" : "연결 후 사용 가능"}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${voiceEnabled ? "bg-indigo-600" : "bg-gray-200"} ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        voiceEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  음성 설정
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">음성 인식</span>
                    <button
                      onClick={() => setVoiceEnabled(!voiceEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        voiceEnabled ? "bg-indigo-600" : "bg-gray-200"
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
              </div>
            </div>

            {/* 오른쪽: 메인 콘텐츠 (채팅방 목록 또는 채팅창) */}
            <div className="flex-1 flex flex-col min-h-0">
              {isConnected ? (
                /* 연결됨: 채팅 메시지 + 입력창 */
                <>
                  <div className="relative flex-1 overflow-y-auto p-6 space-y-4 keep-korean">
                    {/* 음성 인식 시 상단 우측에 파동 표시 */}
                    {isRecording && (
                      <div className="absolute right-6 top-4 z-10">
                        <VoicePulse active={true} size={56} />
                      </div>
                    )}
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender === "user"
                              ? "bg-indigo-500 text-white"
                              : "bg-white border border-gray-200 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
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
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* 메시지 입력 */}
                  <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={toggleRecording}
                        className={`p-3 rounded-full transition-colors ${
                          isRecording
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                        }`}
                        disabled={!isConnected || !voiceEnabled || isConnecting}
                      >
                        {isRecording ? (
                          <MicrophoneIconSolid className="h-5 w-5" />
                        ) : (
                          <MicrophoneIcon className="h-5 w-5" />
                        )}
                      </button>

                      <div className="flex-1 flex items-center space-x-2">
                        {isRecording && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${isListening ? "bg-red-100 text-red-700" : isResponding ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}
                          >
                            {isListening
                              ? "듣는 중…"
                              : isResponding
                                ? "응답 중…"
                                : "대기 중"}
                          </span>
                        )}
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            !e.shiftKey &&
                            handleSendMessage()
                          }
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
                        <Button
                          onClick={handleClearChat}
                          variant="outline"
                          size="sm"
                          className="px-3"
                        >
                          지우기
                        </Button>

                        {/* 설정 패널 토글 버튼 - 연결된 상태에서만 표시 */}
                        <Button
                          onClick={() =>
                            setSettingsPanelOpen(!settingsPanelOpen)
                          }
                          variant="outline"
                          size="sm"
                          className="px-3"
                        >
                          <CogIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* 연결 전: 채팅방 목록 */
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200 p-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        채팅방 목록
                      </h3>
                    </div>

                    {loadingRooms ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                          대화 목록을 불러오는 중...
                        </p>
                      </div>
                    ) : chatRooms.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="text-gray-400 mb-4">
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
                        <p className="text-gray-500">
                          아직 개설된 채팅방이 없습니다.
                          <br />
                          왼쪽의 "콜봇 연결하기" 버튼을 눌러 새 채팅방을
                          만들어보세요!
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {chatRooms.map((room) => (
                          <div
                            key={room.id}
                            onClick={() => handleRoomSelect(room)}
                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {(room as any).name ||
                                    `${chatbot?.name}와의 대화`}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  {(room as any).lastMessageAt &&
                                    `마지막 활동: ${new Date((room as any).lastMessageAt).toLocaleDateString()}`}
                                </p>
                              </div>
                              <div className="flex items-center text-gray-400">
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
              )}
            </div>

            {/* 오른쪽: 설정 패널 (연결된 상태에서만) */}
            {isConnected && (
              <ChatSettingsPanel
                isOpen={settingsPanelOpen}
                onClose={() => setSettingsPanelOpen(false)}
                voiceEnabled={voiceEnabled}
                onVoiceEnabledChange={setVoiceEnabled}
                lang={speechLang}
                onLangChange={setSpeechLang}
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
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
