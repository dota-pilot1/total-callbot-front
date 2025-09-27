import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../auth";
import { Button } from "../../../components/ui";
import FullScreenSlideDialog from "../../../components/ui/FullScreenSlideDialog";

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
  AcademicCapIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { useVoiceConnection } from "../../../shared/chatbot-utils/voice";
import { useChatMessages } from "../../../shared/chatbot-utils/messaging";
import { examApi } from "../../../shared/chatbot-utils/exam/api/exam";
import VoicePulse from "../../../components/VoicePulse";
import MobileSettingsDropdown from "../../../components/MobileSettingsDropdown";

import { VOICE_OPTIONS } from "../../../shared/chatbot-utils/character";
import { useWebSocketStore } from "../../websocket/stores/useWebSocketStore";
import MobileTranslationDialog from "../../../components/MobileTranslationDialog";
import KoreanInputDialog from "../../../components/KoreanInputDialog";
import { MyConversationArchive } from "../../conversation-archive";

import { useAudioSettings } from "../../../shared/chatbot-utils/settings";
import ExamResultsSlideDown from "../../../components/ExamResultsSlideDown";
import { useExamMode } from "../../../shared/chatbot-utils/exam";
import { useToast } from "../../../components/ui/Toast";
import CardForChattingMessageWithTranslation from "@/components/CardForChattingMessageWithTranslation";
import ExamCharacterDialog from "../../../components/ExamCharacterDialog";
import {
  EXAM_CHARACTERS,
  type ExamCharacter,
} from "../../../shared/chatbot-utils/exam/examCharacters";

const FALLBACK_EXAM_CHARACTER: ExamCharacter = {
  id: "airline-reservation-customer",
  name: "고객1",
  emoji: "",
  description: "항공권 예약 문의",
  questionStyle: "reservation_call",
  prompt: "",
};

type DailyScenario = {
  id: string;
  title: string;
  description: string;
  category: string;
};

export default function RolePlayChat() {
  const { logout, getUser } = useAuthStore();
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { ToastContainer } = useToast();

  const isDailyExamRoute = location.pathname.startsWith("/daily-english-exam");

  const initialDailyScenarioRef = useRef<DailyScenario | null>(null);

  useEffect(() => {
    if (!isDailyExamRoute) return;
    const stateScenario = (location.state as { scenario?: DailyScenario })
      ?.scenario;
    if (stateScenario) {
      sessionStorage.setItem(
        "dailyExamScenario",
        JSON.stringify(stateScenario),
      );
      initialDailyScenarioRef.current = stateScenario;
      setDailyExamStatus("idle");
      navigate(location.pathname, { replace: true, state: undefined });
    }
  }, [isDailyExamRoute, location.state, location.pathname, navigate]);

  const dailyScenario = useMemo<DailyScenario | null>(() => {
    if (!isDailyExamRoute) return null;
    if (initialDailyScenarioRef.current) {
      return initialDailyScenarioRef.current;
    }
    const stored = sessionStorage.getItem("dailyExamScenario");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as DailyScenario;
        initialDailyScenarioRef.current = parsed;
        return parsed;
      } catch (error) {
        console.warn("Failed to restore daily exam scenario", error);
      }
    }
    return null;
  }, [isDailyExamRoute]);

  const [dailyExamStatus, setDailyExamStatus] = useState<
    "idle" | "ready" | "started" | "failed"
  >("idle");

  // WebSocket Store 사용 (중복 연결 제거)
  const {
    participantCount,
    connected,
    connecting,
    connect,
    disconnect,
    examMode,
    setExamMode,
    clearExamMode,
  } = useWebSocketStore();

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (connected) {
        disconnect();
      }
      clearExamMode();
    };
  }, [connected, disconnect, clearExamMode]);

  const defaultExamCharacter: ExamCharacter =
    EXAM_CHARACTERS[0] ?? FALLBACK_EXAM_CHARACTER;

  const [examCharacterDialogOpen, setExamCharacterDialogOpen] = useState(false);
  const [selectedExamCharacterId, setSelectedExamCharacterId] =
    useState<string>(() => {
      if (typeof window === "undefined") {
        return defaultExamCharacter.id;
      }

      const storedId = localStorage.getItem("selectedExamCharacter");
      return storedId ?? defaultExamCharacter.id;
    });

  const selectedExamCharacter: ExamCharacter = useMemo(() => {
    return (
      EXAM_CHARACTERS.find(
        (character) => character.id === selectedExamCharacterId,
      ) ?? defaultExamCharacter
    );
  }, [selectedExamCharacterId, defaultExamCharacter]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!selectedExamCharacterId) return;

    localStorage.setItem("selectedExamCharacter", selectedExamCharacterId);
  }, [selectedExamCharacterId]);

  const [selectedVoice, setSelectedVoice] = useState<string>("alloy");

  // 현재 선택된 캐릭터 (기본값 처리) - EXAM_CHARACTERS 사용
  const currentCharacter = selectedExamCharacter;

  const getCharacterSymbol = (character: ExamCharacter) => {
    return character.emoji && character.emoji.trim().length > 0
      ? character.emoji
      : character.name;
  };

  const selectedCharacterSymbol = getCharacterSymbol(selectedExamCharacter);
  const currentCharacterSymbol = getCharacterSymbol(currentCharacter);

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
  const [conversationArchiveDialogOpen, setConversationArchiveDialogOpen] =
    useState(false);

  // 한국어 입력 다이얼로그 상태
  const [koreanInputDialogOpen, setKoreanInputDialogOpen] = useState(false);

  // 시험 결과 슬라이드 다운 상태
  const [examResultsVisible, setExamResultsVisible] = useState(false);
  const [examResultsText] = useState("");

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
  } = useChatMessages({
    responseDelayMs,
    selectedCharacterId: currentCharacter.id,
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

  // 어시스턴트 메시지 핸들러 (자동 평가 제거)
  const handleAssistantMessage = (message: string) => {
    addAssistantMessage(message);
    // 자동 평가 로직 제거 - 사용자 요청 시에만 평가
  };

  // 간단한 페르소나 캐릭터 변환
  const actualPersonaCharacter = {
    id: currentCharacter.id,
    name: currentCharacter.name,
    emoji: currentCharacterSymbol,
    persona: "", // 복잡한 지침 없음
    scenario: "", // 시나리오 없음
    firstMessage: "", // 첫 메시지 없음
    personality: currentCharacter.description,
    background: `Role-playing as ${currentCharacter.name}: ${currentCharacter.description}`,
    defaultGender: "female" as const,
  };

  // 자동 평가 함수 제거됨 - 사용자 요청 시에만 평가

  // 임시 음성 메시지 상태 (optimistic UI용)
  const [tempVoiceMessage, setTempVoiceMessage] = useState<string | null>(null);

  // 토스트 메시지 상태
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // TTS 관련 상태
  const [playingInputText, setPlayingInputText] = useState(false);
  const inputAudioRef = useRef<HTMLAudioElement | null>(null);

  // 자동 완성 관련 상태
  const [autoCompleteLoading, setAutoCompleteLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>("");

  // 문장별 분석 상태
  const [showSentenceAnalysis, setShowSentenceAnalysis] = useState(false);
  const [sentences, setSentences] = useState<string[]>([]);
  const [translations, setTranslations] = useState<{ [key: number]: string }>(
    {},
  );
  const [translatingIndexes, setTranslatingIndexes] = useState<Set<number>>(
    new Set(),
  );
  const [playingIndexes, setPlayingIndexes] = useState<Set<number>>(new Set());
  const sentenceAudioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>(
    {},
  );

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
    personaGender: "female", // 시험에서는 기본값 사용
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
        setToastMessage("🎭 역할극이 시작되었습니다!");
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

  // 시험 모드 자동 음성 시작 설정 (기존 코드 유지)
  useEffect(() => {
    if (examMode && !voiceEnabled) {
      const voiceStartCallback = async () => {
        console.log("ExamChat: 시험 모드 콜백 - 음성 연결 시작");
        setVoiceEnabled(true);
        await startVoice();
      };

      // 이미 연결되어 있으면 바로 실행, 아니면 연결 완료 시 실행되도록 콜백 설정
      if (connected) {
        setTimeout(voiceStartCallback, 500);
      } else {
        setExamMode(true, voiceStartCallback);
      }
    }
  }, [
    examMode,
    connected,
    voiceEnabled,
    setVoiceEnabled,
    startVoice,
    setExamMode,
  ]);

  // 시험 연결 및 준비 함수
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const ensureConnectedAndReady = useCallback(async () => {
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

    // Wait for data channel open with longer timeout
    for (let i = 0; i < 30; i++) {
      if (voiceConn?.dc && voiceConn.dc.readyState === "open") {
        console.log("Voice data channel ready");
        return;
      }
      console.log(`Waiting for voice connection... ${i + 1}/30`);
      await sleep(300);
    }
    // last attempt if state lagged
    if (!(voiceConn?.dc && voiceConn.dc.readyState === "open")) {
      console.error("Voice connection state:", voiceConn?.dc?.readyState);
      throw new Error("음성 연결이 준비되지 않았습니다. 다시 시도해주세요.");
    }
  }, [
    user,
    connected,
    connect,
    voiceEnabled,
    voiceConn,
    setVoiceEnabled,
    startVoice,
  ]);

  // 역할극 모드 훅
  const { examSending, triggerSingleExamWithCharacter } = useExamMode({
    voiceConnection: voiceConn,
    selectedVoice,
    ensureConnectedAndReady,
    onAddAssistantMessage: handleAssistantMessage,
  });

  useEffect(() => {
    if (!isDailyExamRoute) {
      if (dailyExamStatus !== "idle") {
        setDailyExamStatus("idle");
      }
      return;
    }

    if (!dailyScenario) {
      return;
    }

    if (dailyExamStatus !== "idle") {
      return;
    }

    setDailyExamStatus("ready");
  }, [isDailyExamRoute, dailyScenario, dailyExamStatus]);

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
      const token = useAuthStore.getState().getAccessToken();

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

  // 문장 분리 유틸리티
  const splitIntoSentences = (text: string): string[] => {
    const sentenceEnders = /[.!?。！？]/;
    const sentences = text
      .split(sentenceEnders)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return sentences;
  };

  // 언어 감지 유틸리티
  const detectLanguage = (text: string): "ko" | "en" => {
    const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    return koreanRegex.test(text) ? "ko" : "en";
  };

  // 문장 번역 함수
  const translateSentence = async (sentence: string, index: number) => {
    if (translations[index] || translatingIndexes.has(index)) return;

    setTranslatingIndexes((prev) => new Set([...prev, index]));

    try {
      const response = await examApi.translate(sentence.trim());

      if (response.translation) {
        setTranslations((prev) => ({ ...prev, [index]: response.translation }));
      } else {
        throw new Error("No translation received");
      }
    } catch (error) {
      console.error("번역 실패:", error);
      const sourceLanguage = detectLanguage(sentence);
      const fallbackTranslation =
        sourceLanguage === "ko"
          ? `[영어 번역] ${sentence}`
          : `[한국어 번역] ${sentence}`;
      setTranslations((prev) => ({ ...prev, [index]: fallbackTranslation }));
    } finally {
      setTranslatingIndexes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  // TTS 재생 함수
  const playText = async (text: string, index: number) => {
    try {
      if (sentenceAudioRefs.current[index]) {
        sentenceAudioRefs.current[index]?.pause();
        sentenceAudioRefs.current[index] = null;
      }

      setPlayingIndexes((prev) => new Set([...prev, index]));

      const token = useAuthStore.getState().getAccessToken();
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
      const isKorean = detectLanguage(text) === "ko";

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
            voice: isKorean ? "nova" : "alloy",
            speed: 1.0,
          }),
        },
      );

      if (ttsResponse.ok) {
        const audioBlob = await ttsResponse.blob();
        const reader = new FileReader();
        reader.onload = async () => {
          const audio = new Audio(reader.result as string);
          sentenceAudioRefs.current[index] = audio;

          audio.onended = () => {
            setPlayingIndexes((prev) => {
              const newSet = new Set(prev);
              newSet.delete(index);
              return newSet;
            });
            sentenceAudioRefs.current[index] = null;
          };

          audio.onerror = () => {
            setPlayingIndexes((prev) => {
              const newSet = new Set(prev);
              newSet.delete(index);
              return newSet;
            });
            sentenceAudioRefs.current[index] = null;
            console.error("Audio playback failed");
          };

          await audio.play();
        };

        reader.onerror = () => {
          console.error("FileReader error");
          setPlayingIndexes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
          });
        };

        reader.readAsDataURL(audioBlob);
      } else {
        throw new Error(`TTS API request failed: ${ttsResponse.status}`);
      }
    } catch (error) {
      console.error("TTS API failed:", error);
      setPlayingIndexes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  // 오디오 중지 함수
  const stopAudio = (index: number) => {
    if (sentenceAudioRefs.current[index]) {
      sentenceAudioRefs.current[index]?.pause();
      sentenceAudioRefs.current[index] = null;
    }
    setPlayingIndexes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  // 문장별 분석 핸들러
  const handleSentenceAnalysisClick = () => {
    if (!showSentenceAnalysis) {
      const splitSentences = splitIntoSentences(newMessage);
      setSentences(splitSentences);
      setTranslations({});
      setTranslatingIndexes(new Set());
    }
    setShowSentenceAnalysis(!showSentenceAnalysis);
  };

  // 문장별 분석 다이얼로그 닫기
  const handleCloseSentenceAnalysis = () => {
    setShowSentenceAnalysis(false);
    setSentences([]);
    setTranslations({});
    setTranslatingIndexes(new Set());
    setPlayingIndexes(new Set());
    // 모든 오디오 중지
    Object.values(sentenceAudioRefs.current).forEach((audio) => {
      if (audio) {
        audio.pause();
      }
    });
    sentenceAudioRefs.current = {};
  };

  // 번역 기능
  const handleTranslateText = async (text: string = newMessage) => {
    if (!text.trim()) return;

    try {
      const response = await examApi.translate(text.trim());
      if (response.translation) {
        setTranslatedText(response.translation);
        setShowTranslation(true);
      }
    } catch (error) {
      console.error("번역 실패:", error);
      setTranslatedText("번역에 실패했습니다");
      setShowTranslation(true);
    }
  };

  // 자동 완성 기능
  const handleAutoComplete = async () => {
    console.log("자동 완성 버튼 클릭됨");
    console.log("newMessage:", newMessage);
    console.log("autoCompleteLoading:", autoCompleteLoading);

    if (autoCompleteLoading) {
      console.log("자동 완성 중단 - 이미 로딩 중");
      return;
    }

    console.log("자동 완성 시작");
    setAutoCompleteLoading(true);
    try {
      // 대화 내용을 직접 GPT에게 보내서 자연스러운 응답 받기
      const cleanMessage = (text: string) => {
        // [KO] 해석 부분 제거하고 영어 부분만 사용
        return text.split(/\[KO\]|\[ko\]/i)[0].trim();
      };

      // 선택된 캐릭터에 따른 역할 매핑
      const getRoleMapping = (characterId: string) => {
        if (characterId.startsWith("airline-")) {
          return { userRole: "Airline Staff", aiRole: "Customer" };
        } else if (characterId === "it-interviewer") {
          return { userRole: "Job Candidate", aiRole: "IT Interviewer" };
        } else if (characterId === "mcdonalds-staff") {
          return { userRole: "Customer", aiRole: "McDonald's Staff" };
        } else if (characterId === "close-friend") {
          return { userRole: "Friend", aiRole: "Friend" };
        } else if (characterId === "philosopher") {
          return { userRole: "Discussant", aiRole: "Philosopher" };
        } else if (characterId === "counselor") {
          return { userRole: "Client", aiRole: "Counselor" };
        } else if (characterId === "current-affairs-talk") {
          return { userRole: "Guest", aiRole: "Talk Show Host" };
        } else if (characterId === "food-talk") {
          return { userRole: "Guest", aiRole: "Food Talk Host" };
        } else if (characterId === "travel-talk") {
          return { userRole: "Guest", aiRole: "Travel Talk Host" };
        }
        return { userRole: "User", aiRole: "Assistant" };
      };

      const { userRole, aiRole } = getRoleMapping(selectedExamCharacter.id);

      // 전체 대화 내역을 체계적으로 구성 (맥락 이해를 위해)
      const fullConversationHistory = messages
        .map(
          (msg, index) =>
            `[Message ${index + 1}] ${msg.sender === "user" ? userRole : aiRole}: ${cleanMessage(msg.message)}`,
        )
        .join("\n");

      // 최근 대화 요약 (중요한 정보 추출)
      // 입력 중인 텍스트가 있으면 포함
      const currentInput = newMessage.trim();

      // GPT에게 전달할 체계적인 대화 맥락 구성
      let conversationForGPT;
      if (messages.length > 0) {
        // 기존 대화가 있는 경우 - 전체 맥락과 현재 상황을 명확히 제공
        conversationForGPT = `
FULL CONVERSATION HISTORY:
${fullConversationHistory}

CURRENT SITUATION:
- Customer issue: Please analyze the above conversation to understand the specific customer need
- Current input: ${currentInput || "[Customer is waiting for response]"}
- Next step: Provide appropriate response based on the conversation flow

IMPORTANT: Read the ENTIRE conversation above to understand what the customer is asking for. Don't ignore previous context.`;
      } else {
        // 대화 시작
        conversationForGPT = `
CONVERSATION START:
${userRole}: ${currentInput || "Hello!"}

SITUATION: This is the beginning of a ${selectedExamCharacter.description} conversation.`;
      }

      console.log("대화 내용:", conversationForGPT);

      // 캐릭터별 맞춤 프롬프트 생성
      const response = await examApi.autoComplete({
        conversationContext: fullConversationHistory,
        characterType: selectedExamCharacter.id,
        userRole: userRole,
        aiRole: aiRole,
      });

      console.log("API 응답:", response);

      if (response.response) {
        const completion = response.response.trim();
        console.log("자동 완성 결과:", completion);
        setNewMessage(completion);

        // 자동 완성 후 즉시 번역 실행
        await handleTranslateText(completion);
      } else {
        console.log("응답 데이터 없음");
      }
    } catch (error) {
      console.error("자동 완성 실패:", error);
      setToastMessage("자동 완성에 실패했습니다");
      setTimeout(() => setToastMessage(null), 2000);
    } finally {
      setAutoCompleteLoading(false);
    }
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
        <div className="px-3 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">역할극</div>
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
      {/* 시험 정보 및 연결 상태 */}
      <div className="bg-card border-b border-border p-4 flex-shrink-0">
        <div className="text-center">
          <div className="mb-2" />

          {/* 음성 시작 버튼 또는 파동 표시 */}
          <div className="flex justify-center items-center space-x-3">
            {voiceEnabled && isRecording ? (
              <>
                {/* 시험 출제자 선택 버튼 */}
                <Button
                  onClick={() => setExamCharacterDialogOpen(true)}
                  variant="outline"
                  size="sm"
                  className="w-12 h-12 p-0"
                  title={selectedExamCharacter.name}
                >
                  <span className="text-lg font-semibold">
                    {selectedCharacterSymbol}
                  </span>
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

                {/* 역할극 시작 버튼 (연결된 상태에서만) */}
                {connected && (
                  <Button
                    onClick={async () => {
                      try {
                        // 기존 대화 내용 지우기
                        clearChat();
                        // 1문제 빠른 시험 시작
                        await triggerSingleExamWithCharacter(
                          selectedExamCharacter,
                        );
                        if (isDailyExamRoute) {
                          setDailyExamStatus("started");
                        }
                      } catch (error) {
                        console.error("역할극 시작 실패:", error);
                        console.error("역할극을 시작할 수 없습니다:", error);
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="h-12 px-3 bg-green-100 hover:bg-green-200 text-xs font-semibold"
                    title="역할극 시작"
                    disabled={examSending}
                  >
                    역할극 시작
                  </Button>
                )}
              </>
            ) : (
              <>
                {isDailyExamRoute ? (
                  <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-left">
                    <span className="text-lg font-semibold">
                      {selectedCharacterSymbol}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-muted-foreground">
                        데일리 시나리오
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {selectedExamCharacter.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setExamCharacterDialogOpen(true)}
                    variant="outline"
                    size="sm"
                    className="w-12 h-12 p-0"
                    title={selectedExamCharacter.name}
                  >
                    <span className="text-lg font-semibold">
                      {selectedCharacterSymbol}
                    </span>
                  </Button>
                )}

                {/* Connection and Exam Buttons */}
                {!isDailyExamRoute && (
                  <div className="relative inline-block">
                    <Button
                      onClick={async () => {
                        try {
                          // 연결되지 않은 상태라면 먼저 연결
                          if (!connected && !connecting && user) {
                            console.log("시험 버튼: WebSocket 연결 시작");
                            connect(
                              "general",
                              user.name,
                              user.email,
                              "전체 채팅",
                            );

                            // 연결 완료까지 대기 (최대 4초)
                            for (let i = 0; i < 20; i++) {
                              await sleep(200);
                              if (connected) break;
                            }
                          }

                          // 음성 연결이 없다면 시작
                          if (!voiceEnabled) {
                            console.log("시험 버튼: 음성 연결 시작");
                            setVoiceEnabled(true);
                            await startVoice();
                          }

                          // 연결 완료 후 시험 시작
                          if (connected) {
                            console.log("시험 버튼: 역할극 시작");
                            clearChat();
                            await triggerSingleExamWithCharacter(
                              selectedExamCharacter,
                            );
                            if (isDailyExamRoute) {
                              setDailyExamStatus("started");
                            }
                          } else {
                            throw new Error("연결에 실패했습니다");
                          }
                        } catch (error) {
                          console.error("시험 시작 실패:", error);
                          console.error("시험을 시작할 수 없습니다:", error);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="h-12 px-4 text-sm bg-green-100 hover:bg-green-200"
                      disabled={connecting || examSending}
                    >
                      {connecting
                        ? "연결중..."
                        : examSending
                          ? "준비중..."
                          : connected
                            ? "연결 중"
                            : "연결 하기"}
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
                )}

                {isDailyExamRoute && (
                  <div className="text-xs text-muted-foreground text-center">
                    {dailyExamStatus === "ready"
                      ? "빠른 테스트(⚡) 버튼을 누르면 선택한 시나리오로 회화 시험이 시작됩니다."
                      : dailyExamStatus === "started"
                        ? "시험이 진행 중입니다. 필요하면 ⚡ 버튼으로 문제를 다시 요청할 수 있습니다."
                        : dailyExamStatus === "failed"
                          ? "시험을 시작하지 못했습니다. 새로고침한 뒤 다시 시도해 주세요."
                          : "잠시만 기다리세요. 선택한 시나리오를 불러오고 있습니다."}
                  </div>
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
      {isDailyExamRoute && dailyScenario && (
        <div className="px-4 pt-4">
          <div className="rounded-xl border border-border bg-blue-50/40 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold">
                {selectedCharacterSymbol}
              </span>
              <div>
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                  오늘의 시나리오
                </p>
                <h2 className="text-base font-semibold text-foreground">
                  {dailyScenario.title}
                </h2>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {dailyScenario.description}
            </p>
            <p className="mt-2 text-xs text-blue-500">
              이 상황에 맞게 역할극 형태로 대화를 이어가며 영어로 답변해 주세요.
            </p>
          </div>
        </div>
      )}
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
                isExamMode={true}
                examCharacterId={selectedExamCharacterId}
                relatedMessages={messages}
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
          {/* 번역 표시 영역 - 자동 완성 위로 이동 */}
          {showTranslation && translatedText && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    한국어 번역
                  </p>
                  <p className="text-sm text-blue-800">{translatedText}</p>
                </div>
                <button
                  onClick={() => {
                    setShowTranslation(false);
                    setTranslatedText("");
                  }}
                  className="ml-2 p-1 text-blue-400 hover:text-blue-600 transition-colors"
                  title="번역 닫기"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            {/* 왼쪽 미니 버튼들 */}
            <div className="flex flex-col space-y-1">
              <Button
                onClick={handleAutoComplete}
                variant="outline"
                size="sm"
                className={`w-8 h-8 p-0 ${autoCompleteLoading ? "animate-pulse" : ""}`}
                title={autoCompleteLoading ? "자동 완성 중..." : "AI 자동 완성"}
                disabled={autoCompleteLoading}
              >
                <SparklesIcon
                  className={`h-3 w-3 ${autoCompleteLoading ? "animate-spin" : "text-orange-500"}`}
                />
              </Button>

              <Button
                onClick={() => handleTranslateText(newMessage)}
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                title="번역"
                disabled={!newMessage.trim()}
              >
                <LanguageIcon className="h-3 w-3 text-green-500" />
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
              rows={6}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                // 자동 높이 조절 (최대 5줄)
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                const lineHeight = parseInt(
                  getComputedStyle(target).lineHeight,
                );
                const maxHeight = lineHeight * 10; // 10줄 최대
                const newHeight = Math.min(target.scrollHeight, maxHeight);
                target.style.height = `${newHeight}px`;
              }}
              onCompositionStart={() => setIsIMEComposing(true)}
              onCompositionEnd={() => setIsIMEComposing(false)}
              onKeyDown={(e) => {
                const nativeEvent = e.nativeEvent;
                const keyCodeIsComposition =
                  "keyCode" in nativeEvent && nativeEvent.keyCode === 229;
                const composing =
                  isIMEComposing ||
                  nativeEvent.isComposing ||
                  keyCodeIsComposition;
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
                minHeight: "8rem",
                maxHeight: "18rem", // 13줄 정도의 최대 높이
              }}
            />

            {/* 오른쪽 미니 버튼들 */}
            <div className="flex flex-col space-y-1">
              <Button
                onClick={handleSentenceAnalysisClick}
                disabled={!newMessage.trim()}
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                title="문장별 분석"
              >
                <AcademicCapIcon className="h-3 w-3" />
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
        characterOptions={EXAM_CHARACTERS.map((c) => ({
          id: c.id,
          name: c.name,
          emoji: c.emoji,
        }))}
        selectedCharacterId={selectedExamCharacterId}
        onSelectCharacter={(id: string) => setSelectedExamCharacterId(id)}
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
      {/* Exam Character Dialog */}
      <ExamCharacterDialog
        open={examCharacterDialogOpen}
        onClose={() => setExamCharacterDialogOpen(false)}
        selectedCharacterId={selectedExamCharacterId}
        onConfirm={(characterId) => {
          setSelectedExamCharacterId(characterId);

          // 음성 연결이 활성화되어 있으면 재시작 (새 캐릭터 설정 적용)
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
        text={newMessage}
        onInsertText={(text: string) => setNewMessage(text)}
      />{" "}
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
      {/* 문장별 분석 모달 다이얼로그 - FullScreenSlideDialog 사용 */}
      <FullScreenSlideDialog
        isOpen={showSentenceAnalysis}
        onClose={handleCloseSentenceAnalysis}
        title="문장별 번역"
      >
        <div className="p-4">
          <div className="space-y-4">
            {sentences.map((sentence, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                {/* 원본 문장 */}
                <div className="mb-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-foreground leading-relaxed flex-1">
                      {sentence}
                    </p>
                    <Button
                      onClick={() => {
                        if (playingIndexes.has(index)) {
                          stopAudio(index);
                        } else {
                          playText(sentence, index);
                        }
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 w-8 h-8 p-0"
                      title="원본 음성 재생"
                    >
                      {playingIndexes.has(index) ? (
                        <PauseIcon className="h-4 w-4" />
                      ) : (
                        <PlayIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 번역 섹션 */}
                <div className="border-t border-border pt-3">
                  {translations[index] ? (
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-green-700 bg-green-50 p-2 rounded leading-relaxed flex-1">
                        {translations[index]}
                      </p>
                      <Button
                        onClick={() => {
                          const translationKey = index + 1000; // 번역용 인덱스

                          if (playingIndexes.has(translationKey)) {
                            stopAudio(translationKey);
                          } else {
                            playText(translations[index], translationKey);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0 w-8 h-8 p-0"
                        title="번역 음성 재생"
                      >
                        {playingIndexes.has(index + 1000) ? (
                          <PauseIcon className="h-4 w-4" />
                        ) : (
                          <PlayIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => translateSentence(sentence, index)}
                      disabled={translatingIndexes.has(index)}
                      className="w-full"
                      variant="default"
                    >
                      <LanguageIcon className="h-4 w-4 mr-2" />
                      {translatingIndexes.has(index)
                        ? "번역 중..."
                        : "번역하기"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </FullScreenSlideDialog>
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
