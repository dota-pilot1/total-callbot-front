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

  // 시험 모드
  examMode: boolean;
  examModeCallback: (() => void) | null;

  // 메시지
  messages: ChatMessage[];

  // 현재 룸
  currentRoomId: string;
  currentRoomName: string;

  // 참여자 정보
  participantCount: number;
  participants: string[];
  showParticipantList: boolean;

  // 액션들
  connect: (
    roomId: string,
    userName: string,
    userEmail: string,
    roomName?: string,
  ) => void;
  disconnect: () => void;
  sendMessage: (content: string, userName: string, userEmail: string) => void;
  addMessage: (message: ChatMessage) => void;
  addSystemMessage: (content: string) => void;
  setCurrentRoom: (roomId: string, roomName?: string) => void;
  clearMessages: () => void;
  toggleParticipantList: () => void;
  requestParticipantCount: () => void;

  // 시험 모드 관련
  setExamMode: (enabled: boolean, callback?: () => void) => void;
  clearExamMode: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  // 초기 상태
  connected: false,
  connecting: false,
  stompClient: null,
  examMode: false,
  examModeCallback: null,
  messages: [],
  currentRoomId: "general",
  currentRoomName: "전체 채팅",
  participantCount: 0,
  participants: [],
  showParticipantList: false,

  // 현재 룸 설정
  setCurrentRoom: (roomId: string, roomName?: string) => {
    set({
      currentRoomId: roomId,
      currentRoomName:
        roomName || (roomId === "general" ? "전체 채팅" : `채팅방 ${roomId}`),
    });
    // 룸 변경시 메시지 초기화
    set({ messages: [] });
  },

  // 웹소켓 연결
  connect: (
    roomId: string,
    userName: string,
    userEmail: string,
    roomName?: string,
  ) => {
    const { connected, connecting, stompClient } = get();

    // 기존 연결이 있으면 먼저 완전히 정리
    if (stompClient || connected || connecting) {
      console.log("WebSocket: 기존 연결 강제 정리 중...");

      // 즉시 상태 초기화
      set({
        connected: false,
        connecting: false,
        stompClient: null,
        examMode: false,
        examModeCallback: null,
      });

      // 기존 연결 강제 종료
      if (stompClient) {
        try {
          if (stompClient.ws) {
            stompClient.ws.close();
          }
          stompClient.disconnect();
        } catch (error) {
          console.log("WebSocket: 기존 연결 정리 중 오류 (무시됨):", error);
        }
      }

      // 충분한 대기 후 재연결
      setTimeout(() => {
        console.log("WebSocket: 재연결 시도");
        get().connect(roomId, userName, userEmail, roomName);
      }, 300);
      return;
    }

    console.log("WebSocket: 새 연결 시작");
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
          currentRoomName:
            roomName ||
            (roomId === "general" ? "전체 채팅" : `채팅방 ${roomId}`),
        });

        // 시험 모드이면 연결 완료 후 콜백 실행
        const { examMode, examModeCallback } = get();
        if (examMode && examModeCallback) {
          console.log("WebSocket: 시험 모드 콜백 실행");
          setTimeout(() => {
            examModeCallback();
          }, 500);
        }

        // 채팅방별 메시지 구독
        const messageSubscription =
          roomId === "general" ? "/topic/chat" : `/topic/chat/${roomId}`;

        const subscription = client.subscribe(
          messageSubscription,
          (message: any) => {
            console.log("📨 Raw message received:", message);

            try {
              const receivedMessage = JSON.parse(message.body);
              console.log("📨 Parsed message:", receivedMessage);

              const formattedMessage: ChatMessage = {
                id: Date.now() + Math.random(),
                content: receivedMessage.content,
                sender:
                  receivedMessage.senderName === userName ? "user" : "other",
                timestamp: new Date().toLocaleTimeString(),
                senderName: receivedMessage.senderName,
              };

              console.log("📨 Adding formatted message:", formattedMessage);
              get().addMessage(formattedMessage);
            } catch (error) {
              console.error(
                "❌ Error parsing received message:",
                error,
                message,
              );
            }
          },
        );

        console.log("📨 Subscription created:", subscription);

        // 참여자 수 구독
        client.subscribe(
          roomId === "general"
            ? "/topic/participant-count"
            : `/topic/participant-count/${roomId}`,
          (message: any) => {
            try {
              const participantData = JSON.parse(message.body);
              console.log("👥 Participant data received:", participantData);
              set({
                participantCount: participantData.count || 0,
                participants: participantData.participants || [],
              });
            } catch (error) {
              console.error("❌ Error parsing participant data:", error);
            }
          },
        );

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

        // 참여자 수 요청
        const participantCountEndpoint =
          roomId === "general"
            ? "/app/chat/participant-count"
            : `/app/chat/${roomId}/participant-count`;

        client.publish({
          destination: participantCountEndpoint,
          body: JSON.stringify({}),
        });
      },
      (error: any) => {
        console.log("WebSocket 연결 오류 (로그만 출력):", error);
        set({
          connected: false,
          connecting: false,
          stompClient: null,
          examMode: false,
          examModeCallback: null,
        });

        // 자동 재연결 제거 - 사용자가 수동으로 연결하도록 함
      },
    );
  },

  // 웹소켓 연결 해제
  disconnect: () => {
    const { stompClient, connected } = get();

    console.log("WebSocket: 연결 해제 시작");

    try {
      if (stompClient) {
        if (connected) {
          stompClient.disconnect(() => {
            console.log("WebSocket: 정상적으로 연결 해제됨");
          });
        } else {
          // 강제 연결 해제
          if (stompClient.ws) {
            stompClient.ws.close();
          }
        }
      }
    } catch (error) {
      console.log("WebSocket: 연결 해제 중 오류 (무시됨):", error);
    }

    // 상태 초기화
    set({
      connected: false,
      connecting: false,
      stompClient: null,
      examMode: false,
      examModeCallback: null,
    });

    console.log("WebSocket: 연결 해제 완료");
  },

  // 메시지 전송
  sendMessage: (content: string, userName: string, userEmail: string) => {
    const { stompClient, connected, currentRoomId } = get();

    console.log("🟡 sendMessage called", {
      content,
      userName,
      connected,
      currentRoomId,
      hasStompClient: !!stompClient,
    });

    if (!content.trim()) {
      console.log("🔴 Empty content, returning");
      return;
    }

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

      console.log("🟢 Publishing message", { messageEndpoint, chatMessage });

      try {
        stompClient.publish({
          destination: messageEndpoint,
          body: JSON.stringify(chatMessage),
        });

        console.log("✅ Message published successfully");
      } catch (error) {
        console.error("❌ Error publishing message:", error);
      }
    } else {
      console.log("🔴 Cannot send message - not connected or no stomp client", {
        connected,
        hasStompClient: !!stompClient,
      });
    }
  },

  // 메시지 추가
  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  // 시스템 메시지 추가 (중복 방지)
  addSystemMessage: (content: string) => {
    const { messages } = get();

    // 최근 5초 이내의 동일한 시스템 메시지가 있는지 확인
    // const fiveSecondsAgo = Date.now() - 5000;
    const recentDuplicate = messages.find(
      (msg) =>
        msg.senderName === "시스템" &&
        msg.content === content &&
        Date.now() - msg.id < 5000,
    );

    if (!recentDuplicate) {
      const systemMessage: ChatMessage = {
        id: Date.now() + Math.random(),
        content,
        sender: "other",
        timestamp: new Date().toLocaleTimeString(),
        senderName: "시스템",
      };

      get().addMessage(systemMessage);

      // 1.5초 후에 시스템 메시지 제거
      setTimeout(() => {
        const currentMessages = get().messages;
        const updatedMessages = currentMessages.filter(
          (msg) => msg.id !== systemMessage.id,
        );
        set({ messages: updatedMessages });
      }, 1500);
    }
  },

  // 메시지 초기화
  clearMessages: () => {
    set({ messages: [] });
  },

  // 참여자 목록 토글
  toggleParticipantList: () => {
    set((state) => ({ showParticipantList: !state.showParticipantList }));
  },

  // 참여자 수 요청
  requestParticipantCount: () => {
    const { stompClient, connected, currentRoomId } = get();

    if (stompClient && connected) {
      const participantCountEndpoint =
        currentRoomId === "general"
          ? "/app/chat/participant-count"
          : `/app/chat/${currentRoomId}/participant-count`;

      stompClient.publish({
        destination: participantCountEndpoint,
        body: JSON.stringify({}),
      });
    }
  },

  // 시험 모드 설정
  setExamMode: (enabled: boolean, callback?: () => void) => {
    console.log("Store: 시험 모드 설정", { enabled, hasCallback: !!callback });
    set({
      examMode: enabled,
      examModeCallback: callback || null,
    });
  },

  // 시험 모드 클리어
  clearExamMode: () => {
    console.log("Store: 시험 모드 클리어");
    set({
      examMode: false,
      examModeCallback: null,
    });
  },
}));
