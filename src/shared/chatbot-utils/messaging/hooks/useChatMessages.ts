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
  onTranslationReceived?: (translation: string) => void; // 번역 수신 시 콜백
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
    onTranslationReceived,
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

The last message from the ASSISTANT may contain different types of communication (questions, instructions, commentary, encouragement, etc.). First UNDERSTAND THE INTENT, then provide a natural, conversational RESPONSE that:

1. **LOGICAL COMPREHENSION**: Understand the EXACT question being asked and respond logically. Pay attention to "or" questions, yes/no questions, and specific context
2. **AVOID PARROTING**: Don't repeat the exact words/phrases from the assistant. Use different, natural expressions that mean the same thing
3. **NATURAL & CASUAL**: Sound like a real person speaking, not a formal textbook response
4. **CONTEXTUALLY APPROPRIATE**: Match the situation and tone (airport security, casual chat, etc.)
5. **SITUATIONAL TONE**: Use appropriate formality and attitude for the setting (calm/focused at airport, relaxed in casual chat, professional in business contexts)
6. **EMOTIONALLY AUTHENTIC**: Include natural reactions, feelings, or attitudes that fit the context - but keep them realistic and situationally appropriate
7. **CONVERSATIONAL FLOW**: Use phrases that keep the conversation going naturally
8. **REAL-WORLD LANGUAGE**: Use contractions (I'll, that's, don't), filler words (well, actually, oh), and natural expressions
9. **PERSONAL & RELATABLE**: Use "I", "my", personal experiences, and human touches
10. **SITUATIONAL AWARENESS**: If it's about airport security, shopping, travel, etc., respond with realistic concerns/reactions
11. **VARIED EXPRESSIONS**: Use synonyms and different phrasing rather than echoing the assistant's exact words
12. **NATIVE-LIKE FLUENCY**: Prioritize how real native speakers talk - use contractions, casual connectors (like "got", "yep", "all set"), and natural rhythm over formal textbook English
13. **AVOID OVER-EXPLAINING**: Don't add unnecessary details. Answer the specific question asked, not more.
14. **KEEP IT BRIEF**: Maximum ${maxSentenceCount} sentence${maxSentenceCount > 1 ? "s" : ""} for speaking practice
15. **LANGUAGE LEVEL**: ${englishLevel.toUpperCase()} - ${levelDescriptions[englishLevel]}

EXAMPLES OF GOOD vs BAD responses by INTENT:

**INSTRUCTIONS** ("laptop out, jacket off, put in bins"):
❌ BAD (incomplete): "I got my laptop out now."
✅ GOOD (comprehensive): "Got it! I'll take out my laptop, remove my jacket, and put everything in the bins."

**COMMENTARY/NARRATION** ("step forward, raise arms, go through scanner, all clear, pick up stuff"):
❌ BAD (parroting actions): "Okay, I'm stepping forward and raising my arms now. Great, I'm all clear!"
✅ GOOD (appropriate reaction): "Thanks! That went smoothly." or "Phew, glad that's over!"

**ENCOURAGEMENT** ("You're doing great!"):
❌ BAD (ignoring): "I will continue with the process."
✅ GOOD (acknowledging): "Thanks! I appreciate the help." or "That's a relief!"

**QUESTIONS** ("Do you have your passport and boarding pass?"):
❌ BAD (partial): "Yes, I have my passport."
✅ GOOD (complete): "Yes, I have both right here in my hand."

**"OR" QUESTIONS** ("Do you have carry-on luggage, or just this checked bag?"):
❌ BAD (illogical): "Yes, I have a small backpack with me. Just a few things for the flight."
✅ GOOD (logical options):
- "Just this carry-on." (if only carry-on)
- "Both - checking this and keeping the backpack." (if both)
- "Just what I'm checking." (if no carry-on)

**MIXED** (Questions + Instructions + Commentary):
Identify the PRIMARY intent and respond accordingly, acknowledging all parts naturally.

**SITUATIONAL TONE EXAMPLES**:

Airport/Travel (calm, focused, practical):
❌ BAD (too excited): "I'm excited to print my boarding pass!"
✅ GOOD (appropriate): "Yes, I have everything ready. I'll get that sorted."

Business/Professional (polite, efficient):
❌ BAD (too casual): "Yeah, whatever works!"
✅ GOOD (professional): "That sounds good. I'll take care of it."

Casual/Social (relaxed, friendly):
❌ BAD (too formal): "I shall proceed with your recommendation."
✅ GOOD (casual): "Sounds great! I'll give it a try."

Emergency/Serious (calm, direct):
❌ BAD (inappropriate lightness): "Oh fun, an emergency!"
✅ GOOD (appropriate seriousness): "Understood. I'll do that right away."

**NATIVE-LIKE EXPRESSION EXAMPLES**:

🛫 For airport check-in scenarios:
❌ STIFF: "Yes, I'm ready! I have my luggage here with me."
✅ NATIVE OPTIONS:
- "All set! Got my bag right here." (casual)
- "Yes, I'm ready. My luggage is right here." (standard)
- "Yep, ready to go. This is everything." (relaxed)

🍽️ For restaurant scenarios:
❌ STIFF: "I would like to order the chicken please."
✅ NATIVE OPTIONS:
- "I'll have the chicken, please." (standard)
- "Can I get the chicken?" (casual)
- "I'll go with the chicken." (relaxed)

💼 For business scenarios:
❌ STIFF: "I understand your recommendation and will implement it."
✅ NATIVE OPTIONS:
- "That makes sense. I'll take care of it." (professional)
- "Sounds good. I'll get that done." (efficient)
- "Got it. I'll handle that." (confident)

USE VARIED, NATURAL EXPRESSIONS: Prioritize how native speakers actually talk in real situations, not textbook English.

FORMAT: You MUST provide BOTH English and Korean responses in this exact format:

1. First line: Natural English response only
2. Second line: "Korean: [Korean translation]"

MANDATORY EXAMPLE FORMAT:
I'll have a coffee, please.
Korean: 커피 주문할게요.

DO NOT provide explanations, meta-commentary, or any other text. ONLY these two lines.`;

      const resp = await examApi.getSampleAnswers({
        question: `${lastBot}

RESPONSE FORMAT REQUIREMENT:
You must respond in exactly this format:
[English response]
Korean: [Korean translation]

Example:
Sure, I'd love some coffee.
Korean: 네, 커피 마시고 싶어요.`,
        topic: "conversation",
        level: englishLevel,
        count: 1,
        englishOnly: false, // 한글 번역도 포함
        context: enhancedContext,
      });

      console.log("📡 API 응답:", resp);
      const fullText = (resp.samples?.[0]?.text || "").trim();
      console.log("📄 원본 텍스트:", fullText);
      if (fullText) {
        // 영어와 한글 분리 - 더 강화된 파싱 로직
        const lines = fullText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line);
        let englishText = "";
        let koreanText = "";

        // 1단계: "Korean:" 키워드로 분리 시도
        const koreanLine = lines.find(
          (line) =>
            line.startsWith("Korean:") ||
            line.startsWith("한국어:") ||
            line.startsWith("번역:"),
        );

        if (koreanLine) {
          // Korean: 이전의 모든 라인을 영어로 간주
          const koreanIndex = lines.indexOf(koreanLine);
          englishText = lines.slice(0, koreanIndex).join(" ").trim();
          koreanText = koreanLine
            .replace(/^(Korean:|한국어:|번역:)\s*/, "")
            .trim();
        } else {
          // 2단계: 한글이 포함된 라인과 영어 라인 자동 분리
          const englishLines = [];
          const koreanLines = [];

          for (const line of lines) {
            // 한글이 포함되어 있으면 한국어로 분류
            if (/[가-힣]/.test(line)) {
              koreanLines.push(line);
            } else {
              englishLines.push(line);
            }
          }

          englishText = englishLines.join(" ").trim();
          koreanText = koreanLines.join(" ").trim();
        }

        // 3단계: 폴백 - 영어만 있는 경우 간단한 번역 시도
        if (!koreanText && englishText) {
          // 간단한 번역 매핑 시도
          const simpleTranslations: { [key: string]: string } = {
            "I'll have": "주문할게요",
            "I'd like": "원해요",
            Please: "부탁드려요",
            "Thank you": "감사합니다",
            "Excuse me": "실례합니다",
            Sure: "네",
            Yes: "네",
            No: "아니요",
            coffee: "커피",
            tea: "차",
            water: "물",
            help: "도움",
            bill: "계산서",
            check: "확인",
          };

          let translatedText = englishText.toLowerCase();
          for (const [eng, kor] of Object.entries(simpleTranslations)) {
            if (translatedText.includes(eng.toLowerCase())) {
              koreanText = `${kor}(${englishText})`;
              break;
            }
          }

          // 여전히 없으면 기본 메시지
          if (!koreanText) {
            koreanText = `AI 제안: ${englishText}`;
          }
        }

        // 최종 검증 및 설정
        const finalEnglish = englishText || fullText;
        setNewMessage(finalEnglish);

        // 번역이 있으면 콜백으로 전달
        console.log("🌐 번역 데이터:", {
          englishText: finalEnglish,
          koreanText,
          hasCallback: !!onTranslationReceived,
        });
        if (koreanText && onTranslationReceived) {
          onTranslationReceived(koreanText);
          console.log("✅ 번역 콜백 호출됨:", koreanText);
        } else {
          console.log("❌ 번역 콜백 호출 안됨:", {
            koreanText,
            hasCallback: !!onTranslationReceived,
          });
        }
      }
    } catch (e) {
      console.error("AI 제안 실패:", e);

      // 에러 시 폴백 메시지와 번역 제공
      const fallbackMessage = "I understand. Let me think about that.";
      const fallbackTranslation = "알겠습니다. 그것에 대해 생각해보겠습니다.";

      setNewMessage(fallbackMessage);
      if (onTranslationReceived) {
        onTranslationReceived(fallbackTranslation);
      }
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
