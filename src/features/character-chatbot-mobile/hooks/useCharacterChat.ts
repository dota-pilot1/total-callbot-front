import { useState, useRef, useEffect } from "react";

export interface ChatMessage {
  id: number;
  message: string;
  sender: string;
  timestamp: string;
  type: string;
}

/**
 * 캐릭터 챗봇 전용 채팅 메시지 관리 훅
 */
export const useCharacterChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tempVoiceMessage, setTempVoiceMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * 메시지 추가
   */
  const addMessage = (text: string, sender: "user" | "assistant") => {
    const message: ChatMessage = {
      id: Date.now(),
      message: text,
      sender,
      timestamp: new Date().toISOString(),
      type: "chat",
    };

    console.log(`💬 [useCharacterChat] ${sender} 메시지 추가:`, text);
    setMessages((prev) => [...prev, message]);
  };

  /**
   * 사용자 메시지 추가
   */
  const addUserMessage = (text: string) => {
    addMessage(text, "user");
  };

  /**
   * 어시스턴트 메시지 추가
   */
  const addAssistantMessage = (text: string) => {
    addMessage(text, "assistant");
  };

  /**
   * 임시 음성 메시지 설정 (실시간 전사용)
   */
  const setTempMessage = (text: string | null) => {
    setTempVoiceMessage(text);
  };

  /**
   * 채팅 내용 지우기
   */
  const clearMessages = () => {
    console.log("💬 [useCharacterChat] 메시지 모두 지우기");
    setMessages([]);
    setTempVoiceMessage(null);
  };

  /**
   * 자동 스크롤
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 메시지 추가시 자동 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return {
    // 상태
    messages,
    tempVoiceMessage,
    messagesEndRef,

    // 액션
    addUserMessage,
    addAssistantMessage,
    setTempMessage,
    clearMessages,
    scrollToBottom,
  };
};
