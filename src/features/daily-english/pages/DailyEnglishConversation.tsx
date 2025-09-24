import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../auth";
import { Button } from "../../../components/ui";

import {
  TrashIcon,
  XMarkIcon,
  Cog6ToothIcon,
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
import { useVoiceConnection } from "../../chatbot/voice";
import { useChatMessages } from "../../chatbot/messaging";
import { useConversationStore } from "../../chatbot/messaging/stores/conversationStore";
import VoicePulse from "../../../components/VoicePulse";
import MobileSettingsDropdown from "../../../components/MobileSettingsDropdown";

import { VOICE_OPTIONS } from "../../chatbot/character";
import { useWebSocketStore } from "../../websocket/stores/useWebSocketStore";
import KoreanInputDialog from "../../../components/KoreanInputDialog";
import CardForChattingMessageWithTranslation from "../../../components/CardForChattingMessageWithTranslation";
import { MyConversationArchive } from "../../conversation-archive";

import { useAudioSettings } from "../../chatbot/settings";
import ExamResultsSlideDown from "../../../components/ExamResultsSlideDown";
import { useToast } from "../../../components/ui/Toast";
import ConversationEvaluationDialog from "../../../components/ConversationEvaluationDialog";
import ConversationInputArea from "../components/ConversationInputArea";
import { useTranslationStore } from "../stores/useTranslationStore";
import { translateToKorean } from "../utils/translationApi";

interface DailyScenario {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface ExamCharacter {
  id: string;
  name: string;
  emoji: string;
  description: string;
  questionStyle: string;
  prompt: string;
}

export default function DailyEnglishConversation() {
  const { logout, getUser } = useAuthStore();
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { ToastContainer } = useToast();

  // Zustand 대화 스토어
  const {
    addMessage,
    clearMessages: clearStoreMessages,
    startNewConversation,
    getUserMessages,
    getFullConversation,
  } = useConversationStore();

  // 세션에서 시나리오 복원
  const dailyScenario = useMemo<DailyScenario | null>(() => {
    const stateScenario = (location.state as { scenario?: DailyScenario })
      ?.scenario;
    if (stateScenario) {
      sessionStorage.setItem(
        "dailyExamScenario",
        JSON.stringify(stateScenario),
      );
      return stateScenario;
    }

    const stored = sessionStorage.getItem("dailyExamScenario");
    if (stored) {
      try {
        return JSON.parse(stored) as DailyScenario;
      } catch (error) {
        console.error("Failed to parse stored scenario", error);
      }
    }
    return null;
  }, [location.state]);

  // DB에서 온 전체 시나리오 데이터 가져오기
  const fullScenario = useMemo(() => {
    return (location.state as { fullScenario?: any })?.fullScenario || null;
  }, [location.state]);

  // 시나리오가 없으면 메인으로 리다이렉트
  useEffect(() => {
    if (!dailyScenario) {
      navigate("/daily-english", { replace: true });
    }
  }, [dailyScenario, navigate]);

  // WebSocket Store 사용
  const {
    participantCount,
    connected,
    connecting,
    connect,
    disconnect,
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

  // 일일 영어를 위한 ExamCharacter 생성
  const dailyExamCharacter = useMemo<ExamCharacter>(() => {
    // DB 데이터 우선 사용
    if (fullScenario) {
      return {
        id: `scenario-${fullScenario.id}`,
        name: fullScenario.aiRole || fullScenario.title,
        emoji: "🎯",
        description: fullScenario.description,
        questionStyle: fullScenario.conversationStyle?.toLowerCase() || "mixed",
        prompt: fullScenario.systemInstructions,
      };
    }

    if (!dailyScenario) {
      return {
        id: "daily-default",
        name: "일일 영어",
        emoji: "🎯",
        description: "일일 영어 회화 연습",
        questionStyle: "daily_scenario",
        prompt:
          "You are an English conversation partner helping the user practice daily English conversation.",
      };
    }

    return {
      id: dailyScenario.id,
      name: dailyScenario.title,
      emoji: "🎯",
      description: dailyScenario.description,
      questionStyle: "daily_scenario",
      prompt: `You are role-playing the situation: "${dailyScenario.title}".

SITUATION: ${dailyScenario.description}

ROLE-SPECIFIC INSTRUCTIONS:
- If you're an AIRPORT STAFF member: Be professional but friendly, efficient, and helpful. Use clear, direct language. Don't be overly enthusiastic - maintain appropriate workplace demeanor.
- If you're a CUSTOMER SERVICE person: Be polite, solution-focused, and patient.
- If you're a CASUAL ACQUAINTANCE: Be friendly and relaxed, use everyday conversational language.

LANGUAGE STYLE:
- Use realistic, workplace-appropriate English for the context
- Keep responses brief and natural (1-2 sentences typically)
- Avoid overly positive expressions like "Perfect!" or "Amazing!" unless truly appropriate
- Match the formality level of the situation (professional at airport, casual with friends)
- Ask practical questions that would naturally arise in this situation
- SPEAK LIKE A REAL NATIVE: Use contractions, casual connectors, and natural rhythm
- Airport staff examples: "Next!" / "ID please?" / "Any bags to check?" (not "Great, let me help you!")
- Use everyday expressions: "got it", "all set", "you're good", "just need to..." instead of formal language

CONVERSATION FLOW:
- Start immediately in the role-play scenario without explanation
- Guide the user through realistic steps of the situation
- Be encouraging but maintain character authenticity
- If the user makes mistakes, gently guide them with natural corrections
- Stay in character for this specific situation throughout the conversation

REALISTIC DIALOGUE EXAMPLES:
❌ AVOID: "Great, let me help you. Let's put it on the scale over here. Do you have your passport and boarding pass handy?"
✅ USE: "Hi there, ready to check in your luggage?" OR "Any bags to check today?"

❌ AVOID: "Perfect! Now just step forward, raise your arms for a second as you go through the scanner..."
✅ USE: "Arms up, step through." OR "Just walk through slowly."

❌ AVOID: "That sounds wonderful! I'm excited to help you with that process!"
✅ USE: "Sure, I can help with that." OR "No problem."

REMEMBER: Always start the conversation immediately when prompted, don't wait for the user to speak first. Begin with a natural greeting or comment that fits this exact situation.`,
    };
  }, [dailyScenario, fullScenario]);

  const [selectedVoice, setSelectedVoice] = useState<string>("alloy");

  const characterOptions = useMemo(
    () => [
      {
        id: dailyExamCharacter.id,
        name: dailyExamCharacter.name,
        emoji: dailyExamCharacter.emoji,
      },
    ],
    [dailyExamCharacter],
  );

  const [selectedCharacterId, setSelectedCharacterId] = useState<string>(
    dailyExamCharacter.id,
  );

  useEffect(() => {
    setSelectedCharacterId(dailyExamCharacter.id);
  }, [dailyExamCharacter.id]);

  // 오디오 설정 훅
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

  // 나의 대화 아카이브 다이얼로그 상태
  const [conversationArchiveDialogOpen, setConversationArchiveDialogOpen] =
    useState(false);

  // 한국어 입력 다이얼로그 상태
  const [koreanInputDialogOpen, setKoreanInputDialogOpen] = useState(false);

  // 시험 결과 슬라이드 다운 상태
  const [examResultsVisible, setExamResultsVisible] = useState(false);
  const [examResultsText, setExamResultsText] = useState("");

  // 대화 시작 상태
  const [conversationStarted, setConversationStarted] = useState(false);
  const [rolePlayStarted, setRolePlayStarted] = useState(false);

  // 평가 다이얼로그 상태
  const [evaluationOpen, setEvaluationOpen] = useState(false);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [evaluationData, setEvaluationData] = useState<any>(null);

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

  // 번역 처리 함수
  const handleTranslation = async (message: string) => {
    const currentVisible = useTranslationStore.getState().isVisible;
    console.log("🔍 번역 처리 시도:", {
      currentVisible,
      message: message.substring(0, 50) + "...",
    });

    if (currentVisible) {
      console.log("🌐 번역 시작:", message);
      setTranslationLoading(true);
      setTranslation(message, ""); // 원문 설정

      try {
        const translation = await translateToKorean(message);
        console.log("✅ 번역 결과:", translation);

        if (translation) {
          setTranslation(message, translation); // 번역 결과 업데이트
        } else {
          console.warn("⚠️ 번역 결과가 비어있음");
          setTranslation(message, "번역에 실패했습니다");
        }
      } catch (error) {
        console.error("❌ 번역 에러:", error);
        setTranslation(message, "번역 중 오류가 발생했습니다");
      } finally {
        setTranslationLoading(false);
      }
    }
  };

  // 가장 최근 AI 응답 추적
  const [latestAIResponse, setLatestAIResponse] = useState<string>("");

  // 번역 관련 상태 (Zustand store 사용) - useEffect보다 먼저 선언
  const {
    isVisible: translationVisible,
    isLoading: translationLoading,
    originalText: translationOriginal,
    translatedText: translationText,
    toggleVisible: toggleTranslation,
    setTranslation,
    setLoading: setTranslationLoading,
  } = useTranslationStore();

  // 번역 상태가 변경될 때마다 가장 최근 메시지 번역
  useEffect(() => {
    if (translationVisible && latestAIResponse) {
      console.log(
        "🔄 useEffect 번역 상태 변경됨, 최근 응답 번역:",
        latestAIResponse.substring(0, 50) + "...",
      );
      handleTranslation(latestAIResponse);
    } else if (!translationVisible) {
      // 번역 모드가 꺼지면 번역 정보 초기화
      console.log("🔄 번역 모드 꺼짐, 번역 정보 초기화");
      setTranslation("", "");
    }
  }, [translationVisible, latestAIResponse]);

  // 어시스턴트 메시지 핸들러
  const handleAssistantMessage = async (message: string) => {
    console.log(
      "📨 handleAssistantMessage 호출됨:",
      message.substring(0, 50) + "...",
    );

    addAssistantMessage(message);
    // Zustand store에도 저장
    addMessage({ sender: "callbot", text: message, type: "text" });

    // 가장 최근 AI 응답 저장
    setLatestAIResponse(message);

    // 시험 완료 감지 (옵션)
    if (detectExamCompletion(message)) {
      setExamResultsText(message);
      setTimeout(() => {
        setExamResultsVisible(true);
      }, 1000);
    }
  };

  // 시험 캐릭터를 일반 캐릭터 형식으로 변환
  const actualPersonaCharacter = {
    id: dailyExamCharacter.id,
    name: dailyExamCharacter.name,
    emoji: dailyExamCharacter.emoji,
    persona: dailyExamCharacter.prompt,
    scenario:
      fullScenario?.scenarioBackground ||
      `${dailyExamCharacter.description} 상황에서 영어 대화를 진행합니다.`,
    firstMessage:
      fullScenario?.aiStarts && fullScenario?.openingMessage
        ? fullScenario.openingMessage
        : `안녕하세요! ${dailyExamCharacter.description} 상황으로 영어 회화를 연습해보겠습니다.`,
    personality: fullScenario?.learningGoals || dailyExamCharacter.description,
    background:
      fullScenario?.aiKnowledge ||
      `${dailyExamCharacter.name} 역할을 맡아 ${dailyExamCharacter.description} 상황에서 대화를 진행합니다.`,
    defaultGender: "female" as const,
  };

  /**
   * 시험 완료 여부를 감지하는 함수 (옵션)
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
    personaGender: "female",
    onUserMessage: (text: string) => {
      // 최종 메시지가 오면 임시 메시지 제거하고 정식 메시지 추가
      setTempVoiceMessage(null);
      addUserMessage(text);
      // Zustand store에도 저장
      addMessage({ sender: "user", text: text, type: "text" });
    },
    onAssistantMessage: handleAssistantMessage,
    onUserSpeechStart: () => {
      // 음성 시작 시 임시 메시지 표시 및 대화 시작 토스트
      console.log("🎤 음성 시작 - 임시 메시지 표시");
      setTempVoiceMessage("🎤 말하는 중...");

      // 대화 시작 토스트 (첫 번째 음성 시작 시에만)
      if (messages.length === 0) {
        setToastMessage("🎯 일일 영어 대화가 시작되었습니다!");
        setTimeout(() => setToastMessage(null), 2000);
      }
    },
    onUserTranscriptUpdate: (text: string, isFinal: boolean) => {
      // 실시간 텍스트 업데이트만 처리
      if (!isFinal && text.trim()) {
        console.log("🎤 실시간 업데이트:", text);
        setTempVoiceMessage(text);
      } else if (isFinal) {
        // 음성 인식 완료 시 임시 메시지만 제거
        console.log("🎤 음성 인식 완료 - 임시 메시지 제거");
        setTempVoiceMessage(null);
      }
    },
  });

  // 연결 및 준비 함수
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // 상황극 시작 함수
  const startRolePlay = () => {
    if (
      !dailyScenario ||
      !voiceConn?.dc ||
      voiceConn.dc.readyState !== "open"
    ) {
      setToastMessage("❌ 음성 연결을 확인해주세요.");
      setTimeout(() => setToastMessage(null), 2000);
      return;
    }

    // 새로운 대화 시작 (Zustand store)
    startNewConversation(dailyScenario);

    const rolePlayStartMessage = `START ROLE-PLAY NOW!

You are in this exact situation: "${dailyScenario.title}"
Context: ${dailyScenario.description}

INSTRUCTIONS:
- Begin the conversation immediately with a natural greeting or comment that fits this situation
- Act as if you are really there in this situation with me
- Use realistic everyday English
- Don't explain the situation, just start talking naturally
- Keep it conversational and engaging

Start speaking now!`;

    console.log("상황극 시작 명령 전송:", rolePlayStartMessage);
    sendVoiceMessage(rolePlayStartMessage);
    setRolePlayStarted(true);
    setToastMessage("🎭 상황극이 시작되었습니다!");
    setTimeout(() => setToastMessage(null), 2000);
  };

  // 회화 평가 함수
  const evaluateConversation = async () => {
    // Zustand store에서 메시지 가져오기
    const storeUserMessages = getUserMessages();
    const storeFullConversation = getFullConversation();

    if (storeUserMessages.length === 0) {
      setToastMessage("❌ 평가할 대화가 없습니다.");
      setTimeout(() => setToastMessage(null), 2000);
      return;
    }

    setEvaluationLoading(true);
    setEvaluationOpen(true);

    try {
      console.log("📊 평가 시작 - 사용자 메시지 수:", storeUserMessages.length);
      console.log("📊 사용자 메시지들:", storeUserMessages);

      // 사용자 메시지만 추출 (실제 영어 학습자가 말한 내용)
      const userMessages = storeUserMessages.join("\n");

      // 전체 대화 흐름 (AI 응답 포함)
      const fullConversation = storeFullConversation;

      console.log("🎤 사용자 영어 발화:", userMessages);
      console.log("💬 전체 대화:", fullConversation);

      if (!userMessages.trim()) {
        setToastMessage("❌ 평가할 사용자 발화가 없습니다.");
        setTimeout(() => setToastMessage(null), 2000);
        setEvaluationOpen(false);
        return;
      }

      const evaluationPrompt = `한국 영어 학습자의 회화를 평가해주세요. JSON 형식으로만 답변하세요.

대화 상황: "${dailyScenario?.title}"
사용자 발화: "${userMessages}"

다음 JSON 형식으로만 응답하세요:
{
  "scores": {"fluency": 7, "grammar": 8, "comprehension": 7},
  "goodExpressions": ["잘 사용한 표현 → 한국어 설명"],
  "weakPoints": ["개선할 점"],
  "recommendations": ["학습 제안"],
  "mainMessages": ["주요 메시지"],
  "keyExpressions": ["핵심 표현"],
  "overallComment": "한국어로 총평 (2-3문장)"
}`;

      console.log("📤 평가 프롬프트 전송:", evaluationPrompt);

      // examApi를 사용해서 평가 요청
      const { examApi } = await import("../../chatbot/exam/api/exam");

      let response;
      try {
        // 첫 번째 시도: 상세 평가
        response = await examApi.getSampleAnswers({
          question: evaluationPrompt,
          topic: "conversation_evaluation",
          level: "intermediate",
          count: 1,
          englishOnly: false,
        });
      } catch (apiError) {
        console.log("⚠️ 첫 번째 API 호출 실패, 간단한 프롬프트로 재시도");

        // Fallback: 간단한 프롬프트로 재시도
        const simplePrompt = `"${userMessages}" 영어 평가. JSON만 반환: {"scores":{"fluency":5,"grammar":5,"comprehension":5},"goodExpressions":["연습중"],"weakPoints":["더 연습 필요"],"recommendations":["꾸준히 연습"],"mainMessages":["기본 의사소통"],"keyExpressions":["기본 표현"],"overallComment":"오늘도 영어로 대화하려고 노력하신 점이 훌륭합니다. 꾸준히 연습하시면 분명 늘어요!"}`;

        response = await examApi.getSampleAnswers({
          question: simplePrompt,
          topic: "simple",
          level: "beginner",
          count: 1,
          englishOnly: false,
        });
      }

      console.log("📥 API 응답 구조:", response);
      console.log("📥 첫 번째 샘플:", response.samples?.[0]);

      if (!response.samples || response.samples.length === 0) {
        throw new Error("API에서 응답을 받지 못했습니다.");
      }

      const firstSample = response.samples[0];
      console.log("📥 첫 번째 샘플 전체:", firstSample);

      const evaluationResult = firstSample?.text;
      console.log("📥 추출된 텍스트:", evaluationResult);

      if (!evaluationResult || evaluationResult.trim() === "") {
        console.log("📥 샘플 객체 키들:", Object.keys(firstSample || {}));
        throw new Error(
          `비어있는 응답을 받았습니다. 샘플 구조: ${JSON.stringify(firstSample)}`,
        );
      }

      console.log("📥 GPT 응답 전체:", evaluationResult);

      // 안전한 JSON 파싱 로직
      try {
        console.log("🔍 원본 응답:", evaluationResult);

        // JSON 추출 함수
        const extractJSON = (text: string): string => {
          // 1단계: ```json 블록 추출
          let match = text.match(/```json\s*(\{[\s\S]*?\})\s*```/);
          if (match) return match[1].trim();

          // 2단계: ``` 일반 블록 추출
          match = text.match(/```\s*(\{[\s\S]*?\})\s*```/);
          if (match) return match[1].trim();

          // 3단계: 첫 번째 { 부터 마지막 } 까지 추출
          const startIdx = text.indexOf("{");
          const endIdx = text.lastIndexOf("}");
          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            return text.substring(startIdx, endIdx + 1);
          }

          return text.trim();
        };

        const jsonString = extractJSON(evaluationResult);
        console.log("🔍 추출된 JSON:", jsonString);

        // JSON 파싱 시도
        const evaluationData = JSON.parse(jsonString);

        // 데이터 유효성 검사
        if (
          !evaluationData.scores ||
          !evaluationData.goodExpressions ||
          !evaluationData.weakPoints
        ) {
          throw new Error("필수 평가 항목이 누락되었습니다");
        }

        console.log("✅ 평가 데이터 파싱 성공:", evaluationData);
        setEvaluationData(evaluationData);
      } catch (parseError) {
        console.error("❌ JSON 파싱 실패:", parseError);
        console.log("❌ 원본 응답:", evaluationResult);

        // 파싱 실패 시 기본 평가 데이터 생성
        const fallbackData = {
          scores: {
            fluency: 5,
            grammar: 5,
            comprehension: 5,
          },
          goodExpressions: ["평가 처리 중 오류가 발생했습니다"],
          weakPoints: ["정확한 평가를 위해 다시 시도해주세요"],
          recommendations: ["나중에 다시 평가해보시기 바랍니다"],
          mainMessages: ["의사소통 시도"],
          keyExpressions: ["기본 표현 연습"],
          overallComment:
            "시스템 오류로 정확한 평가가 어렵지만, 영어로 대화를 시도하신 것만으로도 훌륭합니다. 다음에 다시 도전해보세요!",
        };

        setEvaluationData(fallbackData);
        setToastMessage(
          "⚠️ 평가 처리 중 문제가 발생했지만 기본 결과를 표시합니다.",
        );
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (error) {
      console.error("❌ 평가 요청 실패:", error);
      const message =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      setToastMessage(`❌ 평가 실패: ${message}`);
      setTimeout(() => setToastMessage(null), 3000);
      setEvaluationOpen(false);
    } finally {
      setEvaluationLoading(false);
    }
  };

  // 대화 자동 시작
  useEffect(() => {
    if (!conversationStarted && dailyScenario && user) {
      setConversationStarted(true);

      const startConversation = async () => {
        try {
          console.log("일일 영어 대화 자동 시작");

          // WebSocket 연결
          if (!connected && !connecting) {
            connect("general", user.name, user.email, "전체 채팅");

            // 연결 완료까지 대기
            for (let i = 0; i < 30; i++) {
              await sleep(200);
              if (connected) break;
            }
          }

          // 음성 연결 시작
          if (!voiceEnabled) {
            setVoiceEnabled(true);
            await startVoice();

            // 음성 연결 완료까지 대기
            for (let i = 0; i < 50; i++) {
              await sleep(200);
              if (voiceConn?.dc && voiceConn.dc.readyState === "open") {
                break;
              }
            }
          }

          setToastMessage(
            "🎯 연결이 완료되었습니다! 상황극 시작 버튼을 눌러주세요.",
          );
          setTimeout(() => setToastMessage(null), 4000);
        } catch (error) {
          console.error("대화 시작 실패:", error);
          setToastMessage("❌ 대화 시작에 실패했습니다. 다시 시도해주세요.");
          setTimeout(() => setToastMessage(null), 3000);
        }
      };

      // 약간의 지연 후 시작
      setTimeout(startConversation, 1000);
    }
  }, [
    conversationStarted,
    dailyScenario,
    user,
    connected,
    connecting,
    voiceEnabled,
    voiceConn,
    connect,
    setVoiceEnabled,
    startVoice,
    sendVoiceMessage,
  ]);

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

  if (!dailyScenario) {
    return null;
  }

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
        <div className="px-3 py-2 md:p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* 뒤로가기 버튼 */}
              <Button
                variant="outline"
                size="sm"
                className="w-7 h-7 p-0 md:w-8 md:h-8"
                onClick={() => navigate("/daily-english")}
              >
                <ArrowLeftIcon className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              {/* 일일 영어 로고 - 모바일에서 간소화 */}
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-base md:text-lg">🎯</span>
                <span className="font-semibold text-xs md:text-sm">
                  일일 영어
                </span>
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

              {/* 번역 토글 버튼 */}
              <Button
                variant={translationVisible ? "default" : "outline"}
                size="sm"
                onClick={toggleTranslation}
                title="실시간 번역"
                className="h-7 w-7 p-0"
              >
                <LanguageIcon className="h-3 w-3" />
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
                  console.log(
                    "Logout button clicked in DailyEnglishConversation",
                  );
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

      {/* 시나리오 정보 및 번역 정보 */}
      <div className="bg-card border-b border-border p-3 flex-shrink-0">
        <div className="rounded-lg border border-border bg-blue-50/40 p-3 shadow-sm mb-3">
          {!rolePlayStarted ? (
            /* 시작 전 레이아웃 */
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xl">{dailyExamCharacter.emoji}</span>
                <div className="flex-1 min-w-0">
                  {translationVisible ? (
                    /* 번역 모드일 때 */
                    <div className="space-y-2">
                      {translationLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                          <span className="text-xs text-blue-700 font-medium">
                            번역 중...
                          </span>
                        </div>
                      ) : translationOriginal ? (
                        <>
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-medium text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded flex-shrink-0">
                              영어
                            </span>
                            <p className="text-xs text-gray-800 leading-relaxed">
                              {translationOriginal}
                            </p>
                          </div>
                          {translationText && (
                            <div className="flex items-start gap-2">
                              <span className="text-[10px] font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                한글
                              </span>
                              <p className="text-xs text-gray-800 leading-relaxed font-medium">
                                {translationText}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-2">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <p className="text-xs text-blue-600 font-medium">
                              번역 모드 활성화됨 - AI 응답을 기다리는 중...
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* 기본 시나리오 정보 */
                    <>
                      <h2 className="text-sm font-semibold text-foreground">
                        {dailyScenario.title}
                      </h2>
                      <p className="text-xs text-blue-500 mt-0.5">
                        영어로 자연스럽게 대화해 주세요
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* 상황극 시작 버튼 - 오른쪽 배치 */}
              {connected && (
                <Button
                  onClick={startRolePlay}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-1.5 rounded-lg shadow-lg text-xs flex-shrink-0"
                >
                  🎭 시작
                </Button>
              )}
            </div>
          ) : (
            /* 진행 중 레이아웃 - 5:1 비율 분할 */
            <div className="grid grid-cols-[5fr_1fr] items-center gap-4 w-full">
              {/* 좌측 영역: 번역 정보 또는 시나리오 정보 */}
              <div className="flex justify-start">
                <div className="text-left">
                  {translationVisible ? (
                    /* 번역 모드일 때 */
                    <div className="space-y-2">
                      {translationLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                          <span className="text-xs text-blue-700 font-medium">
                            번역 중...
                          </span>
                        </div>
                      ) : translationOriginal ? (
                        /* 영어/한글 수직 정렬 */
                        <div className="space-y-2">
                          <div>
                            <span className="text-[10px] font-medium text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                              영어
                            </span>
                            <p className="text-xs text-gray-800 leading-relaxed mt-1">
                              {translationOriginal}
                            </p>
                          </div>
                          {translationText && (
                            <div>
                              <span className="text-[10px] font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                                한글
                              </span>
                              <p className="text-xs text-gray-800 leading-relaxed font-medium mt-1">
                                {translationText}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-2">
                          <p className="text-xs text-gray-500">
                            번역 대기 중...
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* 기본 시나리오 정보 */
                    <>
                      <h2 className="text-sm font-semibold text-foreground">
                        {dailyScenario.title}
                      </h2>
                      <p className="text-xs text-blue-500 mt-0.5">
                        영어로 자연스럽게 대화해 주세요
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* 우측 영역: 진행 중 상태와 번역 토글 버튼 */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-green-600 font-medium text-center">
                  진행 중
                </p>
                <Button
                  variant={translationVisible ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    console.log(
                      "🔘 번역 버튼 클릭, 현재 상태:",
                      translationVisible,
                    );
                    toggleTranslation();
                    console.log("🔘 번역 버튼 클릭 후:", !translationVisible);
                  }}
                  title="실시간 번역"
                  className={`h-6 w-8 px-1 text-[10px] ${
                    translationVisible
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "hover:bg-blue-50 hover:border-blue-300"
                  }`}
                >
                  번역
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          {/* 음성 시작 버튼 또는 파동 표시 */}
          <div className="flex justify-center items-center space-x-2 md:space-x-3">
            {voiceEnabled && isRecording ? (
              <>
                {/* 음성 파동 + 상태 점 오버레이 (compact) */}
                <div className="relative">
                  <div className="bg-card rounded-lg p-2 md:p-3 shadow-lg border border-border">
                    <VoicePulse
                      active={isListening || isResponding}
                      size={28}
                      className="md:w-9 md:h-9"
                    />
                  </div>
                  <span
                    className={`absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 rounded-full ring-2 ring-card ${
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

                {/* 대화 종료 버튼 */}
                <Button
                  onClick={() => {
                    stopVoice();
                    setVoiceEnabled(false);
                    disconnect();
                    clearChat();
                    navigate("/daily-english");
                  }}
                  variant="destructive"
                  size="sm"
                  className="w-10 h-10 md:w-12 md:h-12 p-0"
                  title="대화 종료"
                >
                  <XMarkIcon className="h-3 w-3 md:h-4 md:w-4" />
                </Button>

                {/* 대화 내용 클리어 버튼 (연결된 상태에서만) */}
                {connected && (
                  <Button
                    onClick={() => {
                      clearChat();
                      clearStoreMessages();
                    }}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 md:w-12 md:h-12 p-0"
                    title="대화 내용 지우기"
                  >
                    <TrashIcon className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                )}

                {/* 평가 버튼 (대화가 있을 때만) */}
                {connected && getUserMessages().length > 0 && (
                  <Button
                    onClick={evaluateConversation}
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 md:w-12 md:h-12 p-0 bg-blue-50 hover:bg-blue-100"
                    title="회화 평가"
                    disabled={evaluationLoading}
                  >
                    <ChartBarIcon className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                  </Button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connecting
                      ? "bg-yellow-500 animate-pulse"
                      : connected
                        ? "bg-green-500"
                        : "bg-red-500"
                  }`}
                />
                <span>
                  {connecting
                    ? "연결 중..."
                    : connected
                      ? "대화 연결중"
                      : "연결 끊김"}
                </span>
              </div>
            )}
          </div>

          {/* 음성 상태 표시: 활성 상태에서만 노출 */}
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

      {/* 대화 채팅 영역 */}
      <div
        className="h-[calc(100vh-280px)] overflow-y-scroll overscroll-contain p-4 space-y-3"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p className="mb-2">🎯 일일 영어 대화가 곧 시작됩니다!</p>
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
                isExamMode={false}
                examCharacterId={dailyExamCharacter.id}
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

      {/* 입력 영역 */}
      {connected && (
        <ConversationInputArea
          newMessage={newMessage}
          isIMEComposing={isIMEComposing}
          suggestLoading={suggestLoading}
          onMessageChange={setNewMessage}
          onIMEComposingChange={setIsIMEComposing}
          onSendMessage={sendMessage}
          onSuggestReply={suggestReply}
          onPlayText={playInputText}
          onStopText={stopInputSpeech}
          isPlaying={playingInputText}
          disabled={false}
        />
      )}

      {/* 설정 다이얼로그 */}
      <MobileSettingsDropdown
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        characterOptions={characterOptions}
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
      {/* 한국어 입력 다이얼로그 */}
      <KoreanInputDialog
        isOpen={koreanInputDialogOpen}
        onClose={() => setKoreanInputDialogOpen(false)}
        onInsertText={(translatedText: string) => {
          setNewMessage(translatedText);
          setKoreanInputDialogOpen(false);
        }}
      />

      {/* 나의 대화 아카이브 */}
      <MyConversationArchive
        open={conversationArchiveDialogOpen}
        onClose={() => setConversationArchiveDialogOpen(false)}
      />

      {/* 시험 결과 슬라이드 다운 (옵션) */}
      <ExamResultsSlideDown
        isVisible={examResultsVisible}
        onClose={() => setExamResultsVisible(false)}
        examResultText={examResultsText}
      />

      {/* 회화 평가 다이얼로그 */}
      <ConversationEvaluationDialog
        open={evaluationOpen}
        onClose={() => {
          setEvaluationOpen(false);
          setEvaluationData(null);
        }}
        loading={evaluationLoading}
        evaluationData={evaluationData}
      />

      {/* 토스트 컨테이너 */}
      <ToastContainer />
    </div>
  );
}
