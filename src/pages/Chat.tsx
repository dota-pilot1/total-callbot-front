import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth";
import { Button } from "../components/ui";
import { ArrowLeftIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

// STOMP와 SockJS 라이브러리 임포트
declare global {
  interface Window {
    SockJS: any;
    Stomp: any;
  }
}

interface ChatMessage {
  id: number;
  content: string;
  sender: "user" | "server" | "system";
  timestamp: string;
  senderName?: string;
}

// 메시지 컴포넌트
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === "user";
  const isSystem = message.sender === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
          ✅ {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-end space-x-2 mb-4 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}
    >
      {/* 아바타 */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          isUser ? "bg-blue-500 text-white" : "bg-green-500 text-white"
        }`}
      >
        {isUser ? "👤" : "🤖"}
      </div>

      {/* 메시지 버블 */}
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isUser
            ? "bg-blue-500 text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
        }`}
      >
        <div className="text-sm">{message.content}</div>
        <div
          className={`text-xs mt-1 ${
            isUser ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {message.timestamp}
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const navigate = useNavigate();
  const { getUser } = useAuthStore();
  const user = getUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket 연결 상태
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [stompClient, setStompClient] = useState<any>(null);

  // 메시지 관련 상태
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  // 현재 사용자 정보
  const currentUserName = user?.name || user?.email || "익명";

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // CDN에서 라이브러리 로드
  useEffect(() => {
    const loadLibraries = async () => {
      if (!window.SockJS) {
        const sockjsScript = document.createElement("script");
        sockjsScript.src =
          "https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.6.1/sockjs.min.js";
        document.head.appendChild(sockjsScript);

        await new Promise((resolve) => {
          sockjsScript.onload = resolve;
        });
      }

      if (!window.Stomp) {
        const stompScript = document.createElement("script");
        stompScript.src =
          "https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js";
        document.head.appendChild(stompScript);

        await new Promise((resolve) => {
          stompScript.onload = resolve;
        });
      }
    };

    loadLibraries();
  }, []);

  // WebSocket 연결
  const connect = () => {
    if (!window.SockJS || !window.Stomp) {
      alert("WebSocket 라이브러리를 로딩 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setConnecting(true);
    const socket = new window.SockJS("http://localhost:8080/ws-stomp");
    const client = window.Stomp.over(socket);

    client.connect(
      {},
      (frame: any) => {
        console.log("Connected: " + frame);
        setConnected(true);
        setConnecting(false);
        setStompClient(client);
        addMessage("WebSocket 연결 성공!", "system");

        // /topic/test 구독 - 서버에서 보내는 모든 메시지 수신
        client.subscribe("/topic/test", (message: any) => {
          // 서버 응답을 받아서 적절한 sender 타입으로 표시
          const content = message.body;

          // 서버 응답 형태에 따라 메시지 타입 결정
          if (
            content.includes("안녕하세요") &&
            content.includes("WebSocket 연결이 정상적으로 작동합니다")
          ) {
            // Hello 응답
            addMessage(content, "server", "서버");
          } else if (content.startsWith("Echo: ")) {
            // Echo 응답 - 원본 메시지와 Echo 응답을 분리해서 표시
            const originalMessage = content
              .replace("Echo: ", "")
              .split(" (서버 시간:")[0];
            const serverTime = content.match(/\(서버 시간: (.+?)\)/)?.[1];

            // 먼저 사용자 메시지 표시
            addMessage(originalMessage, "user", currentUserName);

            // 잠시 후 서버 Echo 응답 표시
            setTimeout(() => {
              addMessage(
                `Echo: ${originalMessage} (서버 시간: ${serverTime})`,
                "server",
                "서버",
              );
            }, 100);
          } else {
            // 기타 서버 메시지
            addMessage(content, "server", "서버");
          }
        });
      },
      (error: any) => {
        console.error("Connection error: ", error);
        setConnected(false);
        setConnecting(false);
        addMessage("연결 실패: " + error, "system");
      },
    );
  };

  // WebSocket 연결 해제
  const disconnect = () => {
    if (stompClient) {
      stompClient.disconnect();
    }
    setConnected(false);
    setStompClient(null);
    addMessage("연결이 해제되었습니다", "system");
  };

  // Hello 메시지 전송
  const sendHello = () => {
    if (stompClient && connected) {
      stompClient.send("/app/test/hello", {}, currentUserName);
      // 서버 응답을 기다림 (즉시 표시하지 않음)
    } else {
      alert("먼저 WebSocket에 연결해주세요!");
    }
  };

  // Echo 메시지 전송
  const sendEcho = () => {
    if (!inputMessage.trim()) return;

    if (stompClient && connected) {
      stompClient.send("/app/test/echo", {}, inputMessage);
      // 서버 응답을 기다림 (즉시 표시하지 않음)
      setInputMessage("");
    } else {
      alert("먼저 WebSocket에 연결해주세요!");
    }
  };

  // 메시지 추가 (실제 채팅 스타일)
  const addMessage = (
    content: string,
    sender: "user" | "server" | "system",
    senderName?: string,
  ) => {
    const newMessage: ChatMessage = {
      id: Date.now() + Math.random(),
      content,
      sender,
      senderName,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  // 메시지 클리어
  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/mobile")}
                className="w-9 px-0"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  WebSocket 채팅 테스트
                </h1>
                <p className="text-xs text-gray-600">{currentUserName}님</p>
              </div>
            </div>
            {/* 연결 상태 표시 */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connecting
                    ? "bg-yellow-500 animate-pulse"
                    : connected
                      ? "bg-green-500"
                      : "bg-red-500"
                }`}
              ></div>
              <span className="text-xs text-gray-600">
                {connecting ? "연결중" : connected ? "연결됨" : "연결 안됨"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 연결 컨트롤 */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-center space-x-3">
          {!connected ? (
            <Button onClick={connect} disabled={connecting} className="px-6">
              {connecting ? "연결 중..." : "WebSocket 연결"}
            </Button>
          ) : (
            <>
              <Button onClick={sendHello} variant="outline" className="px-4">
                👋 Hello 전송
              </Button>
              <Button
                onClick={disconnect}
                variant="outline"
                className="px-4 text-red-600 border-red-300 hover:bg-red-50"
              >
                연결 해제
              </Button>
            </>
          )}
          <Button
            onClick={clearMessages}
            variant="outline"
            size="sm"
            className="px-3"
          >
            🧹 클리어
          </Button>
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-lg font-medium mb-2">WebSocket 채팅 테스트</p>
              <p className="text-sm">
                WebSocket에 연결하고 실시간 메시지를 주고받아보세요!
              </p>
              <p className="text-xs text-gray-400 mt-2">
                🔥 서버 응답만 표시 (중복 제거)
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* 메시지 입력 (연결된 상태에서만 표시) */}
      {connected && (
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendEcho();
                  }
                }}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                onClick={sendEcho}
                disabled={!inputMessage.trim()}
                className="w-12 h-12 p-0 rounded-full"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💡 Step 1: 서버 응답 기반 실시간 채팅 (중복 방지)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
