import { create } from "zustand";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

export interface ChatMessage {
  id: number;
  content: string;
  sender: "user" | "other";
  timestamp: string;
  senderName: string;
}

interface WebSocketState {
  // 연결 상태
  connected: boolean;
  connecting: boolean;
  stompClient: any;

  // 메시지
  messages: ChatMessage[];

  // 현재 룸
  currentRoomId: string;

  // 액션들
  connect: (roomId: string, userName: string, userEmail: string) => void;
  disconnect: () => void;
  sendMessage: (content: string, userName: string, userEmail: string) => void;
  addMessage: (message: ChatMessage) => void;
  addSystemMessage: (content: string) => void;
  setCurrentRoom: (roomId: string) => void;
  clearMessages: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  // 초기 상태
  connected: false,
  connecting: false,
  stompClient: null,
  messages: [],
  currentRoomId: "general",

  // 현재 룸 설정
  setCurrentRoom: (roomId: string) => {
    set({ currentRoomId: roomId });
    // 룸 변경시 메시지 초기화
    set({ messages: [] });
  },

  // 웹소켓 연결
  connect: (roomId: string, userName: string, userEmail: string) => {
    const { connected, connecting } = get();

    // 이미 연결되어 있거나 연결 중이면 리턴
    if (connected || connecting) return;

    set({ connecting: true });

    // API 클라이언트와 동일한 베이스 URL 로직 사용
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1";
    const wsUrl = isLocal
      ? "http://localhost:8080/ws-stomp"
      : "https://api.total-callbot.cloud/ws-stomp";

    const socket = new SockJS(wsUrl);
    const client = Stomp.over(socket);

    client.connect(
      {},
      (frame: any) => {
        console.log("WebSocket Connected: " + frame);
        set({
          connected: true,
          connecting: false,
          stompClient: client,
          currentRoomId: roomId,
        });

        // 채팅방별 메시지 구독
        const messageSubscription =
          roomId === "general" ? "/topic/public" : `/topic/chatroom/${roomId}`;

        client.subscribe(messageSubscription, (message: any) => {
          const receivedMessage = JSON.parse(message.body);
          console.log("Received message:", receivedMessage);

          const formattedMessage: ChatMessage = {
            id: Date.now() + Math.random(),
            content: receivedMessage.content,
            sender: receivedMessage.senderName === userName ? "user" : "other",
            timestamp: new Date().toLocaleTimeString(),
            senderName: receivedMessage.senderName,
          };

          get().addMessage(formattedMessage);
        });

        // 입장 메시지 전송
        const joinInfo = {
          senderName: userName,
          senderEmail: userEmail,
        };

        const joinEndpoint =
          roomId === "general" ? "/app/chat/join" : `/app/chat/${roomId}/join`;

        client.publish({
          destination: joinEndpoint,
          body: JSON.stringify(joinInfo),
        });

        get().addSystemMessage(`${userName}님이 채팅방에 입장했습니다.`);
      },
      (error: any) => {
        console.log("Connection error: " + error);
        set({ connected: false, connecting: false });

        // 5초 후 재연결 시도
        setTimeout(() => {
          const { connected: isConnected } = get();
          if (!isConnected) {
            console.log("Attempting to reconnect...");
            get().connect(roomId, userName, userEmail);
          }
        }, 5000);
      },
    );
  },

  // 웹소켓 연결 해제
  disconnect: () => {
    const { stompClient, connected } = get();

    if (stompClient && connected) {
      stompClient.disconnect();
    }

    set({
      connected: false,
      connecting: false,
      stompClient: null,
    });
  },

  // 메시지 전송
  sendMessage: (content: string, userName: string, userEmail: string) => {
    const { stompClient, connected, currentRoomId } = get();

    if (!content.trim()) return;

    if (stompClient && connected) {
      const chatMessage = {
        content: content.trim(),
        senderName: userName,
        senderEmail: userEmail,
      };

      const messageEndpoint =
        currentRoomId === "general"
          ? "/app/chat/message"
          : `/app/chat/${currentRoomId}/message`;

      stompClient.publish({
        destination: messageEndpoint,
        body: JSON.stringify(chatMessage),
      });
    }
  },

  // 메시지 추가
  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  // 시스템 메시지 추가
  addSystemMessage: (content: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now() + Math.random(),
      content,
      sender: "other",
      timestamp: new Date().toLocaleTimeString(),
      senderName: "시스템",
    };

    get().addMessage(systemMessage);
  },

  // 메시지 초기화
  clearMessages: () => {
    set({ messages: [] });
  },
}));
