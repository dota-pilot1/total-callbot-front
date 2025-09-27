import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ConversationMessage {
  id: number;
  sender: "user" | "callbot";
  text: string;
  timestamp: string;
  type: "text";
}

// useChatMessages와 호환을 위한 Message 형식
export interface ChatMessage {
  id: number;
  sender: "user" | "callbot";
  message: string; // text 대신 message
  timestamp: string;
  type: "text";
}

interface ConversationState {
  // 현재 활성 대화 메시지들
  messages: ConversationMessage[];

  // 대화 평가용 데이터
  evaluationData: {
    scenario?: {
      id: string;
      title: string;
      description: string;
    };
    startTime?: string;
    endTime?: string;
  } | null;

  // 액션들
  addMessage: (message: Omit<ConversationMessage, "id" | "timestamp">) => void;
  updateMessage: (id: number, updates: Partial<ConversationMessage>) => void;
  clearMessages: () => void;

  // 평가 관련
  setEvaluationData: (data: ConversationState["evaluationData"]) => void;
  clearEvaluationData: () => void;

  // 대화 세션 관리
  startNewConversation: (scenario?: {
    id: string;
    title: string;
    description: string;
  }) => void;
  endCurrentConversation: () => void;

  // 평가용 메시지 추출
  getUserMessages: () => string[];
  getFullConversation: () => string;

  // UI 표시용 메시지 (useChatMessages 호환)
  getChatMessages: () => ChatMessage[];
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      messages: [],
      evaluationData: null,

      addMessage: (messageData) => {
        const message: ConversationMessage = {
          ...messageData,
          id: Date.now() + Math.random() * 1000,
          timestamp: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      updateMessage: (id, updates) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg,
          ),
        }));
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      setEvaluationData: (data) => {
        set({ evaluationData: data });
      },

      clearEvaluationData: () => {
        set({ evaluationData: null });
      },

      startNewConversation: (scenario) => {
        set({
          messages: [],
          evaluationData: {
            scenario,
            startTime: new Date().toISOString(),
            endTime: undefined,
          },
        });
      },

      endCurrentConversation: () => {
        set((state) => ({
          evaluationData: state.evaluationData
            ? {
                ...state.evaluationData,
                endTime: new Date().toISOString(),
              }
            : null,
        }));
      },

      getUserMessages: () => {
        const { messages } = get();
        return messages
          .filter((msg) => msg.sender === "user")
          .map((msg) => msg.text);
      },

      getFullConversation: () => {
        const { messages } = get();
        return messages
          .map(
            (msg) => `${msg.sender === "user" ? "사용자" : "AI"}: ${msg.text}`,
          )
          .join("\n");
      },

      getChatMessages: () => {
        const { messages } = get();
        return messages.map((msg) => ({
          id: msg.id,
          sender: msg.sender,
          message: msg.text, // text를 message로 변환
          timestamp: msg.timestamp,
          type: msg.type,
        }));
      },
    }),
    {
      name: "conversation-store",
      partialize: (state) => ({
        // 현재 대화만 persist하지 않고 평가 데이터만 유지
        evaluationData: state.evaluationData,
      }),
    },
  ),
);
