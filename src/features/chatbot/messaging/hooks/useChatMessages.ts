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
  maxSentenceCount?: number; // 최대 응답 문장 수 (기본값: 3)
  englishLevel?: "beginner" | "intermediate" | "advanced"; // 영어 수준 (기본값: beginner)
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
    maxSentenceCount = 3,
    englishLevel = "beginner",
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
      id: Date.now() + Math.random() * 1000,
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
      id: Date.now() + Math.random() * 1000,
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

    // 지연 시간 후 실제 전송 처리 (음성 연결이든 시뮬레이션이든)
    setTimeout(() => {
      if (onSendMessage) {
        try {
          onSendMessage(messageContent);
        } catch (e) {
          console.error("메시지 전송 실패:", e);
          // 실패 시 시뮬레이션 응답
          addAssistantMessage("죄송합니다. 메시지 전송에 실패했습니다.");
        }
      } else {
        // 콜백이 없으면 시뮬레이션 응답
        addAssistantMessage(`"${messageContent}"에 대해 답변드리겠습니다.`);
      }
    }, responseDelayMs);
  };

  // 채팅 초기화
  const clearChat = () => {
    setMessages([]);
  };

  // AI 제안: 질문에 대한 자연스러운 답변 제안
  const suggestReply = async () => {
    if (suggestLoading) return;

    const rev = [...messages].reverse();
    const lastBot = rev.find((m) => m.sender === "callbot")?.message || "";

    // 마지막 질문이 없으면 실행하지 않음
    if (!lastBot) return;

    try {
      setSuggestLoading(true);

      // 마지막 5개 대화를 컨텍스트로 사용
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

      const levelDescriptions = {
        beginner:
          "Use simple words, basic grammar, and common everyday expressions. Avoid complex vocabulary or advanced grammar structures.",
        intermediate:
          "Use moderate vocabulary and grammar. Include some less common words but keep sentences clear and understandable.",
        advanced:
          "Use sophisticated vocabulary and complex grammar structures. Feel free to use idiomatic expressions and advanced concepts.",
      };

      const enhancedContext = `Recent conversation:
${tail}

The last message from the ASSISTANT is a question. Please provide a natural, helpful ANSWER to that question that:
1. Directly addresses the question being asked
2. Is appropriate for English conversation practice
3. Sounds natural and conversational
4. Provides a good example response that the user can learn from
5. IMPORTANT: Keep your answer to MAXIMUM ${maxSentenceCount} sentence${maxSentenceCount > 1 ? "s" : ""} for speaking practice
6. LANGUAGE LEVEL: ${englishLevel.toUpperCase()} - ${levelDescriptions[englishLevel]}
7. FORMAT: Provide only the answer the user should give, without explanations or additional text
8. Make it personal and relatable (use "I", "my", etc. as appropriate)`;

      const resp = await examApi.getSampleAnswers({
        question: lastBot,
        topic: "conversation",
        level: englishLevel,
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

  // 자동 스크롤 효과 (메시지 추가 시) - CSS 기반으로 단순화
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
