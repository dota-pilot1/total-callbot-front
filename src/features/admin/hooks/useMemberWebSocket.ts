import { useState, useEffect, useRef } from "react";
import { Client, type StompHeaders } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "../../auth";

interface MemberStatusUpdate {
  userId: number;
  userName: string;
  isOnline: boolean;
  eventType: string;
  timestamp: string;
}

interface UseMemberWebSocketReturn {
  onlineStatusUpdates: MemberStatusUpdate[];
  isConnected: boolean;
  connectionError: string | null;
  reconnect: () => void;
  disconnect: () => void; // 수동 연결 해제 함수
}

export const useMemberWebSocket = (): UseMemberWebSocketReturn => {
  const [onlineStatusUpdates, setOnlineStatusUpdates] = useState<
    MemberStatusUpdate[]
  >([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const clientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const manualDisconnectRef = useRef(false);

  const connect = () => {
    try {
      // 기존 연결이 있으면 정리
      if (clientRef.current) {
        clientRef.current.deactivate();
      }

      // 수동 해제 상태 해제 (자동 재연결 허용)
      manualDisconnectRef.current = false;

      const client = new Client({
        webSocketFactory: () => {
          const token = useAuthStore.getState().getAccessToken() || "";

          const resolveWebSocketUrl = () => {
            const envUrl = (import.meta as any)?.env?.VITE_WS_BASE_URL as
              | string
              | undefined;
            if (envUrl && envUrl.length > 0) return envUrl;

            const host = window.location.hostname;
            const isLocal = host === "localhost" || host === "127.0.0.1";
            // 모든 환경에서 /ws-stomp (SockJS) 엔드포인트 사용
            return isLocal
              ? `http://localhost:8080/ws-stomp`
              : `https://api.total-callbot.cloud/ws-stomp`;
          };

          const base = resolveWebSocketUrl();
          const wsUrl = `${base}?token=${encodeURIComponent(token)}`;
          // 프록시 업그레이드 문제를 우회하기 위해 XHR 기반 전송만 사용
          return new SockJS(wsUrl, undefined, {
            transports: ["xhr-streaming", "xhr-polling"],
          });
        },
        // STOMP CONNECT 프레임에 Authorization 포함 (서버 ChannelInterceptor용)
        connectHeaders: (() => {
          const token = useAuthStore.getState().getAccessToken();
          const headers: StompHeaders = {};
          if (token) headers["Authorization"] = `Bearer ${token}`;
          return headers;
        })(),
        debug: (str) => {
          console.log("STOMP Debug:", str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = (frame) => {
        console.log("웹소켓 연결 성공:", frame);
        setIsConnected(true);
        setConnectionError(null);

        // 멤버 상태 업데이트 구독
        client.subscribe("/topic/member/status", (message) => {
          try {
            console.log("=== 웹소켓 메시지 수신 ===", message.body);
            const statusUpdate: MemberStatusUpdate = JSON.parse(message.body);
            console.log("파싱된 멤버 상태 업데이트:", statusUpdate);

            setOnlineStatusUpdates((prev) => {
              // 중복 방지: 최근 5초 내 같은 사용자의 같은 상태 업데이트는 무시
              const now = new Date().getTime();
              const recentUpdate = prev.find(
                (update) =>
                  update.userId === statusUpdate.userId &&
                  update.isOnline === statusUpdate.isOnline &&
                  now - new Date(update.timestamp).getTime() < 5000,
              );

              if (recentUpdate) {
                console.log("중복 업데이트 무시:", statusUpdate);
                return prev;
              }

              // 새로운 업데이트를 맨 앞에 추가하고, 최대 50개까지만 유지
              const newUpdates = [statusUpdate, ...prev.slice(0, 49)];
              console.log("상태 업데이트 목록 갱신:", newUpdates);
              return newUpdates;
            });
          } catch (error) {
            console.error("멤버 상태 업데이트 파싱 에러:", error);
          }
        });

        // 멤버 목록 업데이트 구독 (선택적)
        client.subscribe("/topic/member/list-updated", (message) => {
          try {
            const notification = JSON.parse(message.body);
            console.log("멤버 목록 업데이트 알림:", notification);
            // 필요시 목록 새로고침 트리거 가능
          } catch (error) {
            console.error("멤버 목록 업데이트 파싱 에러:", error);
          }
        });
      };

      client.onStompError = (frame) => {
        console.error("STOMP 에러:", frame.headers["message"]);
        console.error("추가 정보:", frame.body);
        setIsConnected(false);
        setConnectionError(frame.headers["message"] || "웹소켓 연결 에러");
      };

      client.onWebSocketError = (event) => {
        console.error("웹소켓 에러:", event);
        setIsConnected(false);
        setConnectionError("웹소켓 연결 실패");
      };

      client.onDisconnect = (frame) => {
        console.log("웹소켓 연결 해제:", frame);
        setIsConnected(false);

        // 수동 해제가 아닌 경우에만 자동 재연결 시도
        if (!manualDisconnectRef.current) {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("웹소켓 자동 재연결 시도...");
            connect();
          }, 5000);
        }
      };

      clientRef.current = client;
      client.activate();
    } catch (error) {
      console.error("웹소켓 연결 설정 에러:", error);
      setConnectionError(
        error instanceof Error ? error.message : "웹소켓 설정 실패",
      );
    }
  };

  const reconnect = () => {
    console.log("수동 웹소켓 재연결 시도...");
    setConnectionError(null);
    connect();
  };

  const disconnect = () => {
    console.log("수동 웹소켓 연결 해제");
    // 수동 해제 플래그 설정하여 자동 재연결 방지
    manualDisconnectRef.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    setIsConnected(false);
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 연결
    connect();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }

      setIsConnected(false);
    };
  }, []);

  return {
    onlineStatusUpdates,
    isConnected,
    connectionError,
    reconnect,
    disconnect,
  };
};
