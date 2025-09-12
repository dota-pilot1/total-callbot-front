import { useState, useRef, useEffect } from "react";
import { examApi } from "../../exam/api/exam";

export interface Message {
  id: number;
  sender: "user" | "callbot";
  message: string;
  timestamp: string;
  type: "text";
}

export interface UseChatMessagesOptions {
  onSendMessage?: (text: string) => void; // 메시지 전송 시 콜백 (음성 연결 등)
  responseDelayMs?: number; // 시뮬레이션 응답 지연 (기본값: 3초)
  selectedCharacterId?: string; // AI 제안 시 캐릭터 컨텍스트
}

export interface UseChatMessagesReturn {
  // 상태들
  messages: Message[];
  newMessage: string;
  isIMEComposing: boolean;
  suggestLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;

  // 액션들
  setNewMessage: (text: string) => void;
  setIsIMEComposing: (composing: boolean) => void;
  addUserMessage: (text: string) => void;
  addAssistantMessage: (text: string) => void;
  sendMessage: () => void;
  clearChat: () => void;
  suggestReply: () => Promise<void>;
}

/**
 * 채팅 메시지 상태 관리 및 텍스트 기반 대화 처리 훅
 *
 * 텍스트 입력 → 사용자 메시지 추가 → 전송 → AI 응답 → 자동 스크롤
 * 전체 채팅 인터페이스의 핵심 로직을 관리
 */
export const useChatMessages = (
  options: UseChatMessagesOptions = {},
): UseChatMessagesReturn => {
  const {
    onSendMessage,
    responseDelayMs = 3000,
    selectedCharacterId,
  } = options;

  // 채팅 메시지 상태들
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isIMEComposing, setIsIMEComposing] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);

  // 자동 스크롤용 ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 타임스탬프 생성 헬퍼
  const createTimestamp = () => {
    return new Date().toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 사용자 메시지 추가
  const addUserMessage = (text: string) => {
    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      message: text.trim(),
      timestamp: createTimestamp(),
      type: "text",
    };
    setMessages((prev) => [...prev, userMessage]);
  };

  // AI 응답 메시지 추가
  const addAssistantMessage = (text: string) => {
    const assistantMessage: Message = {
      id: Date.now() + Math.random(),
      sender: "callbot",
      message: text,
      timestamp: createTimestamp(),
      type: "text",
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  // 메시지 전송
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    // 사용자 메시지를 먼저 추가
    addUserMessage(messageContent);

    // 외부 콜백으로 전송 처리 (음성 연결 등)
    if (onSendMessage) {
      try {
        onSendMessage(messageContent);
        return;
      } catch (e) {
        console.error("메시지 전송 실패:", e);
      }
    }

    // 콜백이 없으면 시뮬레이션 응답
    setTimeout(() => {
      addAssistantMessage(`"${messageContent}"에 대해 답변드리겠습니다.`);
    }, responseDelayMs);
  };

  // 채팅 초기화
  const clearChat = () => {
    setMessages([]);
  };

  // AI 제안: 모범답안 엔진을 이용해 제안 받기
  const suggestReply = async () => {
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
      const characterInfo = selectedCharacterId
        ? `Selected Character: ${selectedCharacterId}`
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
      if (text) {
        setNewMessage(text);
      }
    } catch (e) {
      console.error("AI 제안 실패:", e);
    } finally {
      setSuggestLoading(false);
    }
  };

  // 자동 스크롤 효과
  useEffect(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {}
  }, [messages]);

  return {
    // 상태들
    messages,
    newMessage,
    isIMEComposing,
    suggestLoading,
    messagesEndRef,

    // 액션들
    setNewMessage,
    setIsIMEComposing,
    addUserMessage,
    addAssistantMessage,
    sendMessage,
    clearChat,
    suggestReply,
  };
};
