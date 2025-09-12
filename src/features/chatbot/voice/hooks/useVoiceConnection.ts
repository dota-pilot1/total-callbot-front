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

    // 기본적으로 영어로 답변, 한국어 요청 시에만 한국어 사용
    const languageNote =
      "Be direct and straightforward. Keep replies to 1-2 sentences maximum. No unnecessary explanations or elaboration. Start with a brief self-introduction when first greeting. Respond primarily in English. If the user specifically requests Korean (한국어로 답변해줘, 한글로 말해줘, etc.), then respond in Korean using formal, respectful language. ";

    return (
      `I am ${personaCharacter.name} (${personaCharacter.emoji}). ${genderNote}${voiceNote}` +
      languageNote +
      `I stay in character at all times. I avoid meta talk.\n\nMy persona notes:\n${persona}`
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
          if (t === "input_audio_buffer.speech_started") setIsListening(true);
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
              },
            }),
          );
        } else {
          conn.dc?.addEventListener("open", () => {
            try {
              conn.dc?.send(
                JSON.stringify({
                  type: "session.update",
                  session: { instructions: buildPersonaInstructions() },
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
