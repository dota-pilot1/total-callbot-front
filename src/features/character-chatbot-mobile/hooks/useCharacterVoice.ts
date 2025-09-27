import { useState, useRef, useEffect } from "react";
import { voiceApi } from "../../../shared/chatbot-utils/voice/api/voice";
import {
  connectRealtimeVoice,
  type VoiceConnection,
} from "../../../shared/chatbot-utils/voice/lib/realtime";
import type { CharacterSettings } from "./useCharacterState";

export interface UseCharacterVoiceOptions {
  settings: CharacterSettings;
  onUserMessage?: (text: string) => void;
  onAssistantMessage?: (text: string) => void;
  onUserSpeechStart?: () => void;
  onUserTranscriptUpdate?: (text: string, isFinal: boolean) => void;
}

export interface UseCharacterVoiceReturn {
  // 상태들
  isConnected: boolean;
  isListening: boolean;
  isResponding: boolean;

  // 연결 관리
  startConnection: () => Promise<void>;
  stopConnection: () => void;

  // 메시지 전송
  sendTextMessage: (message: string) => void;

  // 오디오 참조
  audioRef: React.RefObject<HTMLAudioElement>;
}

/**
 * 캐릭터 챗봇 전용 음성 연결 훅
 * 기존 useVoiceConnection과 독립적으로 구현
 */
export const useCharacterVoice = (
  options: UseCharacterVoiceOptions,
): UseCharacterVoiceReturn => {
  const {
    settings,
    onUserMessage,
    onAssistantMessage,
    onUserSpeechStart,
    onUserTranscriptUpdate,
  } = options;

  // 상태들
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [voiceConn, setVoiceConn] = useState<VoiceConnection | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastUserFinalRef = useRef<string>("");
  const lastAssistantFinalRef = useRef<string>("");
  const assistantPartialRef = useRef<string>("");

  /**
   * 캐릭터 페르소나 지시사항 생성
   * 현재 설정을 기반으로 OpenAI 지시사항 생성
   */
  const buildCharacterInstructions = (): string => {
    const { character, gender, voice } = settings;

    console.log("🎭 [buildCharacterInstructions] 지시사항 생성:");
    console.log("  - character:", character);
    console.log("  - gender:", gender);
    console.log("  - voice:", voice);

    const genderNote =
      gender === "male"
        ? "Use a masculine persona. "
        : "Use a feminine persona. ";

    const voiceNote = `Voice: ${voice}. `;

    const characterInfo = `${character.personality}\n\n${character.background}`;

    const languageNote =
      "Stay in character and respond naturally in English. " +
      "If the user speaks in another language, understand their intent but respond as your character would, in English. " +
      "Keep responses conversational and direct. Maximum 1-2 sentences. ";

    const firstMessageNote = character.firstMessage
      ? `Your first message must be: "${character.firstMessage}". `
      : "";

    const instructions =
      `You are ${character.name} (${character.emoji}). ${genderNote}${voiceNote}` +
      firstMessageNote +
      `Character details: ${characterInfo}. ` +
      languageNote +
      `Always stay in character as ${character.name}.`;

    console.log("🎭 [buildCharacterInstructions] 생성된 지시사항:");
    console.log(instructions);

    return instructions;
  };

  /**
   * 텍스트 정규화
   */
  const normalizeText = (text: string): string => {
    try {
      if (!text || typeof text !== "string") return "";
      let normalized = text.normalize("NFC");
      normalized = normalized.replace(/[\uFFFD\u0000-\u001F]/g, "");
      normalized = normalized.replace(/\s+/g, " ").trim();
      return normalized;
    } catch (error) {
      console.warn("텍스트 정규화 실패:", error);
      return (text || "").trim();
    }
  };

  /**
   * 캐릭터의 첫 인사 메시지 전송
   */
  const sendFirstMessage = (conn: VoiceConnection) => {
    if (!conn.dc || conn.dc.readyState !== "open") {
      console.warn("🎭 [sendFirstMessage] 데이터 채널이 준비되지 않음");
      return;
    }

    try {
      const instructions = buildCharacterInstructions();

      // 첫 메시지 생성 요청
      conn.dc.send(
        JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["text", "audio"],
            instructions:
              instructions +
              " Start the conversation with your first message as described in your character instructions. Introduce yourself naturally and greet the user warmly.",
          },
        }),
      );

      console.log("🎭 [sendFirstMessage] 캐릭터 첫 인사 메시지 요청 전송");
    } catch (error) {
      console.error("🎭 [sendFirstMessage] 첫 메시지 전송 실패:", error);
    }
  };

  /**
   * 음성 연결 시작
   */
  const startConnection = async () => {
    if (voiceConn) {
      console.log("🎭 [startConnection] 이미 연결되어 있음");
      return;
    }

    console.log("🎭 [startConnection] 음성 연결 시작");

    try {
      // 1. 세션 생성
      const session = await voiceApi.createSession({
        lang: "en", // 영어 고정
        voice: settings.voice,
      });

      console.log("🎭 [startConnection] 세션 생성 완료:", session);

      // 2. Realtime 연결
      const conn = await connectRealtimeVoice({
        token: session.token,
        model: session.model,
        audioElement: audioRef.current,
        voice: settings.voice,
        audioConstraints: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
        onEvent: (evt) => {
          const e: any = evt as any;
          const eventType = e?.type as string | undefined;

          if (eventType === "input_audio_buffer.speech_started") {
            setIsListening(true);
            onUserSpeechStart?.();
          }
          if (eventType === "input_audio_buffer.speech_stopped") {
            setIsListening(false);
          }
          if (
            eventType === "response.audio_transcript.started" ||
            eventType === "response.started"
          ) {
            setIsResponding(true);
          }
          if (
            eventType === "response.done" ||
            eventType === "response.audio_transcript.done"
          ) {
            setIsResponding(false);
          }
        },
        onUserTranscript: (text, isFinal) => {
          onUserTranscriptUpdate?.(text, isFinal);

          if (isFinal) {
            const finalText = normalizeText(text.trim());
            console.log("[음성 디버그] 최종 텍스트:", finalText);

            if (
              finalText &&
              finalText.length > 0 &&
              finalText !== lastUserFinalRef.current
            ) {
              console.log("[음성 디버그] 사용자 메시지 추가:", finalText);
              onUserMessage?.(finalText);
              lastUserFinalRef.current = finalText;

              // 응답 생성 요청
              setTimeout(() => {
                try {
                  conn?.dc?.send(
                    JSON.stringify({
                      type: "response.create",
                      response: {
                        modalities: ["text", "audio"],
                        instructions: buildCharacterInstructions(),
                      },
                    }),
                  );
                  console.log("[음성 디버그] 응답 생성 요청 전송");
                } catch (e) {
                  console.error("[음성 디버그] 응답 생성 요청 실패:", e);
                }
              }, 1000);
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
      setIsConnected(true);

      console.log("🎭 [startConnection] Realtime 연결 완료");

      // 3. 캐릭터 지시사항 설정
      const setupCharacter = () => {
        if (conn.dc && conn.dc.readyState === "open") {
          const instructions = buildCharacterInstructions();
          const sessionConfig = {
            type: "session.update",
            session: {
              instructions: instructions,
              turn_detection: {
                type: "server_vad",
                threshold: 0.6,
                prefix_padding_ms: 300,
                silence_duration_ms: 800,
                create_response: false,
              },
            },
          };

          console.log("🎭 [startConnection] 캐릭터 설정 전송:");
          console.log(JSON.stringify(sessionConfig, null, 2));

          conn.dc.send(JSON.stringify(sessionConfig));
          console.log("🎭 [startConnection] 캐릭터 설정 전송 완료");

          // 캐릭터 설정 후 첫 인사 메시지 전송 (약간의 지연)
          setTimeout(() => {
            sendFirstMessage(conn);
          }, 1000);
        }
      };

      // 데이터 채널이 열리면 캐릭터 설정
      if (conn.dc && conn.dc.readyState === "open") {
        setupCharacter();
      } else {
        conn.dc?.addEventListener("open", setupCharacter);
      }
    } catch (error) {
      console.error("🎭 [startConnection] 연결 실패:", error);
      setIsConnected(false);
    }
  };

  /**
   * 음성 연결 종료
   */
  const stopConnection = () => {
    console.log("🎭 [stopConnection] 연결 종료");

    try {
      voiceConn?.stop();
    } catch (error) {
      console.error("연결 종료 실패:", error);
    }

    setVoiceConn(null);
    setIsConnected(false);
    setIsListening(false);
    setIsResponding(false);
  };

  /**
   * 텍스트 메시지 전송
   */
  const sendTextMessage = (message: string) => {
    if (!voiceConn?.dc || voiceConn.dc.readyState !== "open") {
      console.error("🎭 [sendTextMessage] 연결이 준비되지 않음");
      return;
    }

    try {
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
            instructions: buildCharacterInstructions(),
          },
        }),
      );

      console.log("🎭 [sendTextMessage] 텍스트 메시지 전송:", message);
    } catch (error) {
      console.error("🎭 [sendTextMessage] 전송 실패:", error);
    }
  };

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      stopConnection();
    };
  }, []);

  return {
    // 상태들
    isConnected,
    isListening,
    isResponding,

    // 연결 관리
    startConnection,
    stopConnection,

    // 메시지 전송
    sendTextMessage,

    // 오디오 참조
    audioRef,
  };
};
