import { useState, useRef, useEffect } from "react";
import { voiceApi } from "../api/voice";
import { connectRealtimeVoice, type VoiceConnection } from "../lib/realtime";
import type { CHARACTER_LIST } from "../../character/characters";

export interface UseVoiceConnectionOptions {
  speechLang: "ko" | "en";
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  selectedVoice: string;
  personaCharacter: (typeof CHARACTER_LIST)[number];
  personaGender: "male" | "female";
  onUserMessage?: (text: string) => void;
  onAssistantMessage?: (text: string) => void;
  onUserSpeechStart?: () => void;
  onUserTranscriptUpdate?: (text: string, isFinal: boolean) => void;
}

export interface UseVoiceConnectionReturn {
  // 상태들
  voiceEnabled: boolean;
  isRecording: boolean;
  isListening: boolean;
  isResponding: boolean;

  voiceConn: VoiceConnection | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;

  // 액션들
  startVoice: () => Promise<void>;
  stopVoice: () => void;

  setVoiceEnabled: (enabled: boolean) => void;
  sendVoiceMessage: (message: string) => void;
}

/**
 * OpenAI Realtime API 기반 실시간 AI 음성 대화 훅
 *
 * 사용자 음성 → 음성인식 → AI 응답 생성 → 음성합성 → 재생
 * 전체 파이프라인을 관리하는 핵심 훅
 */
export const useVoiceConnection = (
  options: UseVoiceConnectionOptions,
): UseVoiceConnectionReturn => {
  const {
    speechLang,
    echoCancellation,
    noiseSuppression,
    autoGainControl,
    selectedVoice,
    personaCharacter,
    personaGender,
    onUserMessage,
    onAssistantMessage,
    onUserSpeechStart,
    onUserTranscriptUpdate,
  } = options;

  // 음성 연결 상태들
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceConn, setVoiceConn] = useState<VoiceConnection | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isRespondingRef = useRef(false);
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

  // AI 페르소나 지시사항 생성
  const buildPersonaInstructions = () => {
    const genderNote =
      personaGender === "male"
        ? "Use a subtly masculine persona. "
        : "Use a subtly feminine persona. ";
    const voiceNote = selectedVoice ? `Voice: ${selectedVoice}. ` : "";
    const persona = personaCharacter
      ? `${personaCharacter.personality}\n${personaCharacter.background}`
      : "";

    // 첫 번째 메시지 지시사항 추가
    const firstMessageNote = personaCharacter?.firstMessage
      ? `IMPORTANT: When you first start speaking or when prompted to begin a conversation, your FIRST message should be: "${personaCharacter.firstMessage}". Use this exact greeting or a close variation. `
      : "";

    // 영어 학습용 - 모든 캐릭터가 영어로 대답하되 캐릭터 특성은 유지
    const languageNote =
      "ALWAYS respond in English only for English learning purposes. Never use Korean. Keep responses conversational and natural to help with English practice. Be direct and straightforward. Keep replies to 1-2 sentences maximum. ";

    const characterEmphasis = personaCharacter
      ? `You are ${personaCharacter.name}. Always respond as this character would, maintaining their personality and perspective. For example, if you are King Sejong, give advice about learning and wisdom as a wise ruler would. If you're Einstein, explain things with scientific curiosity and simple analogies. Stay true to your character's nature while helping with English learning. `
      : "";

    // 캐릭터별 실제 취향/사상/식성 반영
    const getCharacterSpecificNote = () => {
      switch (personaCharacter?.id) {
        case "linus_torvalds":
          return "As Linus Torvalds, be brutally honest and practical. Use phrases like 'That's total crap' or 'Just show me the code.' Recommend simple Finnish foods like rye bread or oatmeal. Hate inefficiency and love elegant solutions. ";

        case "ronnie_coleman":
          return "As Ronnie Coleman, everything is about gains and motivation! Say 'Yeah buddy!' and 'Light weight baby!' Recommend protein-rich foods like chicken, rice, and supplements. Turn everything into a motivational speech about pushing through pain. ";

        case "buddha":
          return "As Buddha, speak with deep compassion and wisdom. Recommend simple, vegetarian foods and moderation in all things. Explain everything through the lens of suffering, impermanence, and the middle way. Use gentle, enlightened language. ";

        case "jesus":
          return "As Jesus, speak with love and forgiveness. Reference parables and spiritual metaphors. Recommend sharing simple foods like bread and fish. Everything relates to loving your neighbor and spiritual nourishment over material concerns. ";

        case "santa":
          return "As Santa, be jolly and say 'Ho ho ho!' Recommend milk, cookies, hot cocoa, and treats. Everything is about spreading joy, being on the nice list, and Christmas magic. Always think about giving and making others happy. ";

        case "lee_jaeyong":
          return "As Lee Jae-yong, speak strategically about global business. Recommend healthy, premium foods that busy executives eat. Think about market trends, technology innovation, and building 'super-gap' competitive advantages. ";

        case "kim_jongun":
          return "As Kim Jong-un, be confident and speak about 'our way of socialism.' Recommend North Korean foods like naengmyeon or Korean BBQ. Everything relates to self-reliance (juche) and national pride. Speak boldly about independence. ";

        case "nietzsche":
          return "As Nietzsche, be provocative and intense. Say things like 'What doesn't kill you makes you stronger!' Recommend whatever fuels the will to power. Challenge conventional thinking and promote self-overcoming and creating your own values. ";

        case "schopenhauer":
          return "As Schopenhauer, be pessimistic but insightful. Recommend simple foods since life is suffering anyway. Everything relates to the will-to-live being the source of all pain. Find beauty only in art and philosophy as escapes from suffering. ";

        case "xi_jinping":
          return "As Xi Jinping, speak about the 'Chinese Dream' and national rejuvenation. Recommend traditional Chinese foods and tea. Everything relates to building a moderately prosperous society and China's rise as a global power. ";

        case "gpt":
          return "As GPT, be helpful and balanced. Provide objective information and practical advice. Recommend healthy, well-rounded meals and explain things clearly and logically. ";

        case "hitler":
          return "As Hitler, be extremely passionate and dramatic. Use intense rhetoric and speak about struggle, willpower, and victory. Recommend hearty German foods like sausages and dark bread. Everything is about strength and determination. ";

        case "peter_thiel":
          return "As Peter Thiel, challenge conventional thinking. Say things like 'Competition is for losers' and promote monopolistic advantages. Recommend efficient, high-quality foods. Think contrarian and focus on zero-to-one innovations. ";

        case "elon_musk":
          return "As Elon Musk, be visionary and ambitious. Talk about Mars colonization, sustainable energy, and the future. Recommend simple, efficient foods that fuel productivity. Everything relates to accelerating human progress and making life multi-planetary. ";

        case "warren_buffett":
          return "As Warren Buffett, be folksy and wise about money. Recommend simple, cheap foods like hamburgers and Coca-Cola (his favorites). Talk about long-term value, compound interest, and investing in what you understand. Use simple analogies. ";

        default:
          return "";
      }
    };

    const characterSpecificNote = getCharacterSpecificNote();

    return (
      `I am ${personaCharacter.name} (${personaCharacter.emoji}). ${genderNote}${voiceNote}` +
      firstMessageNote +
      characterEmphasis +
      characterSpecificNote +
      languageNote +
      `I stay in character at all times. I avoid generic AI responses and speak as ${personaCharacter.name} would.\n\nMy persona notes:\n${persona}`
    );
  };

  // 음성 연결 시작
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
          if (t === "input_audio_buffer.speech_started") {
            setIsListening(true);
            onUserSpeechStart?.(); // 음성 시작 알림
          }
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

          // 실시간 텍스트 업데이트 (final이 아니어도 호출)
          onUserTranscriptUpdate?.(text, isFinal);

          if (isFinal) {
            const finalText = normalizeText(text.trim());
            console.log("[음성 디버그] 최종 텍스트:", finalText);
            console.log("[음성 디버그] 이전 텍스트:", lastUserFinalRef.current);

            // 텍스트가 있으면 무조건 추가 (중복 체크 완화)
            if (finalText && finalText.length > 0) {
              console.log("[음성 디버그] 사용자 메시지 추가 중:", finalText);
              // 사용자 메시지를 외부 콜백으로 전달
              onUserMessage?.(finalText);
              lastUserFinalRef.current = finalText;

              // create_response: false이므로 수동으로 응답 생성 (지연 후)
              setTimeout(() => {
                try {
                  conn?.dc?.send(
                    JSON.stringify({
                      type: "response.create",
                      response: {
                        modalities: ["text", "audio"],
                        instructions: "Please respond naturally and helpfully.",
                      },
                    }),
                  );
                  console.log("[음성 디버그] 응답 생성 요청 전송");
                } catch (e) {
                  console.error("[음성 디버그] 응답 생성 요청 실패:", e);
                }
              }, 1500); // 1.5초 지연 후 응답 생성
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
              // AI 메시지를 외부 콜백으로 전달
              onAssistantMessage?.(finalText);
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
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.6, // 더 확실한 음성만 감지 (잡음 무시)
                  prefix_padding_ms: 300, // 음성 시작 전 여유시간
                  silence_duration_ms: 800, // 침묵 800ms 후 턴 종료 감지
                  create_response: false, // 자동 응답 비활성화 (수동 제어)
                },
              },
            }),
          );
        } else {
          conn.dc?.addEventListener("open", () => {
            try {
              conn.dc?.send(
                JSON.stringify({
                  type: "session.update",
                  session: {
                    instructions: buildPersonaInstructions(),
                    turn_detection: {
                      type: "server_vad",
                      threshold: 0.6, // 더 확실한 음성만 감지 (잡음 무시)
                      prefix_padding_ms: 300, // 음성 시작 전 여유시간
                      silence_duration_ms: 800, // 침묵 800ms 후 턴 종료 감지
                      create_response: false, // 자동 응답 비활성화 (수동 제어)
                    },
                  },
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

  // 음성 연결 종료
  const stopVoice = () => {
    try {
      voiceConn?.stop();
    } catch {}
    setVoiceConn(null);
    setIsRecording(false);
    setIsListening(false);
    setIsResponding(false);
  };

  // 텍스트 메시지를 음성 연결로 전송
  const sendVoiceMessage = (message: string) => {
    try {
      if (voiceConn?.dc && voiceConn.dc.readyState === "open") {
        voiceConn.dc.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [{ type: "input_text", text: message }],
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
      }
    } catch (e) {
      console.error("음성 메시지 전송 실패:", e);
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, []);

  return {
    // 상태들
    voiceEnabled,
    isRecording,
    isListening,
    isResponding,
    voiceConn,
    audioRef,

    // 액션들
    startVoice,
    stopVoice,
    setVoiceEnabled,
    sendVoiceMessage,
  };
};
