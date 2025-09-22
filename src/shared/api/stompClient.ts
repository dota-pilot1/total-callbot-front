import { Client, type StompHeaders } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "../../features/auth";

const createStompClient = () => {
  return new Client({
    webSocketFactory: () => {
      const token = useAuthStore.getState().getAccessToken() || "";
      const resolveWebSocketUrl = () => {
        const envUrl = (import.meta as any)?.env?.VITE_WS_BASE_URL as
          | string
          | undefined;
        if (envUrl && envUrl.length > 0) return envUrl;
        const host = window.location.hostname;
        const isLocal = host === "localhost" || host === "127.0.0.1";
        return isLocal
          ? `http://localhost:8080/ws-stomp`
          : `https://api.total-callbot.cloud/ws-stomp`;
      };
      const base = resolveWebSocketUrl();
      const wsUrl = `${base}?token=${encodeURIComponent(token)}`;
      return new SockJS(wsUrl, undefined, { transports: ["websocket"] });
    },
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
};

export const stompClient = createStompClient();
