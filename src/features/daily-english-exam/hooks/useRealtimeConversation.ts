import { useState, useRef, useCallback, useEffect } from "react";
import { realtimeApi } from "../api/realtimeApi";

interface UseRealtimeConversationProps {
  scenario: string;
  instructions?: string;
}

export function useRealtimeConversation({
  scenario,
  instructions,
}: UseRealtimeConversationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");

  const sessionIdRef = useRef<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 세션 생성
  const createSession = useCallback(async () => {
    try {
      setConnectionStatus("connecting");
      setError(null);

      const response = await realtimeApi.createSession({
        scenario,
        instructions: instructions || "",
      });

      sessionIdRef.current = response.sessionId;
      return response.sessionId;
    } catch (error) {
      console.error("Failed to create session:", error);
      setError("세션 생성에 실패했습니다.");
      setConnectionStatus("disconnected");
      throw error;
    }
  }, [scenario, instructions]);

  // 토큰 가져오기
  const getSessionToken = useCallback(async (sessionId: string) => {
    try {
      const response = await realtimeApi.getSessionToken(sessionId);
      return response.token;
    } catch (error) {
      console.error("Failed to get session token:", error);
      setError("토큰 가져오기에 실패했습니다.");
      throw error;
    }
  }, []);

  // 오디오 컨텍스트 초기화
  const initializeAudioContext = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
    } catch (error) {
      console.error("Failed to initialize audio context:", error);
      setError("오디오 초기화에 실패했습니다.");
    }
  }, []);

  // 마이크 녹음 시작
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 24000,
        },
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm;codecs=opus",
        });
        sendAudioToAPI(audioBlob);

        // 스트림 정리
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start(250); // 250ms 간격으로 데이터 수집
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      setError("녹음 시작에 실패했습니다. 마이크 권한을 확인해주세요.");
    }
  }, []);

  // 마이크 녹음 중지
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // 오디오 데이터를 API로 전송 (실제 구현에서는 WebSocket 사용)
  const sendAudioToAPI = useCallback(async (audioBlob: Blob) => {
    try {
      // 실제로는 OpenAI Realtime API의 WebSocket으로 오디오 스트림 전송
      // 여기서는 간단한 구현으로 대체
      console.log("Sending audio to API:", audioBlob.size, "bytes");

      // 모의 응답 생성 (실제로는 API 응답을 받아야 함)
      setTimeout(() => {
        playMockResponse();
      }, 1000);
    } catch (error) {
      console.error("Failed to send audio:", error);
      setError("오디오 전송에 실패했습니다.");
    }
  }, []);

  // 모의 응답 재생 (실제로는 API에서 받은 오디오 재생)
  const playMockResponse = useCallback(async () => {
    try {
      setIsPlaying(true);

      // 브라우저 TTS로 모의 응답
      const utterance = new SpeechSynthesisUtterance(
        "That's a great response! Please continue with the conversation.",
      );
      utterance.lang = "en-US";
      utterance.rate = 0.9;

      utterance.onend = () => {
        setIsPlaying(false);
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Failed to play response:", error);
      setError("응답 재생에 실패했습니다.");
      setIsPlaying(false);
    }
  }, []);

  // 연결 시작
  const connect = useCallback(async () => {
    try {
      await initializeAudioContext();
      const sessionId = await createSession();
      await getSessionToken(sessionId);

      setIsConnected(true);
      setConnectionStatus("connected");
    } catch (error) {
      console.error("Failed to connect:", error);
      setConnectionStatus("disconnected");
    }
  }, [initializeAudioContext, createSession, getSessionToken]);

  // 연결 종료
  const disconnect = useCallback(async () => {
    try {
      // 녹음 중지
      if (isRecording) {
        stopRecording();
      }

      // WebSocket 연결 종료
      if (websocketRef.current) {
        websocketRef.current.close();
      }

      // 세션 종료
      if (sessionIdRef.current) {
        await realtimeApi.endSession(sessionIdRef.current);
      }

      // 오디오 컨텍스트 정리
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setIsConnected(false);
      setConnectionStatus("disconnected");
      sessionIdRef.current = null;
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }, [isRecording, stopRecording]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isRecording,
    isPlaying,
    error,
    connectionStatus,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    clearError: () => setError(null),
  };
}
