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
  sender: "user" | "other";
  timestamp: string;
  senderName: string;
}

// 메시지 컴포넌트
function MessageBubble({
  message,
  currentUserName,
}: {
  message: ChatMessage;
  currentUserName: string;
}) {
  const isMyMessage = message.senderName === currentUserName;

  return (
    <div
      className={`flex items-end space-x-2 mb-4 ${isMyMessage ? "flex-row-reverse space-x-reverse" : ""}`}
    >
      {/* 아바타 */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          isMyMessage ? "bg-blue-500 text-white" : "bg-green-500 text-white"
        }`}
      >
        {isMyMessage ? "👤" : "👥"}
      </div>

      {/* 메시지 버블 */}
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isMyMessage
            ? "bg-blue-500 text-white rounded-br-sm"
            : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
        }`}
      >
        {/* 보낸 사람 이름 (다른 사람 메시지일 때만) */}
        {!isMyMessage && (
          <div className="text-xs text-gray-500 mb-1 font-medium">
            {message.senderName}
          </div>
        )}
        <div className="text-sm">{message.content}</div>
        <div
          className={`text-xs mt-1 ${
            isMyMessage ? "text-blue-100" : "text-gray-500"
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

        // 시스템 메시지 추가
        addSystemMessage(`${currentUserName}님이 채팅에 참여했습니다`);

        // /topic/test 구독 - 다른 사용자들의 메시지 수신
        client.subscribe("/topic/test", (message: any) => {
          const content = message.body;
          // Step 1: Echo 서버를 통한 기본 브로드캐스트 메시지 처리
          addMessage(content, "다른 사용자");
        });
      },
      (error: any) => {
        console.error("Connection error: ", error);
        setConnected(false);
        setConnecting(false);
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
    addSystemMessage("채팅에서 나갔습니다");
  };

  // 메시지 전송
  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    if (stompClient && connected) {
      // Step 1: 기본 메시지 브로드캐스트
      stompClient.send("/app/test/echo", {}, inputMessage);
      setInputMessage("");
    } else {
      alert("먼저 채팅에 연결해주세요!");
    }
  };

  // 일반 메시지 추가
  const addMessage = (content: string, senderName: string) => {
    const newMessage: ChatMessage = {
      id: Date.now() + Math.random(),
      content,
      sender: senderName === currentUserName ? "user" : "other",
      senderName,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  // 시스템 메시지 추가
  const addSystemMessage = (content: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now() + Math.random(),
      content,
      sender: "other",
      senderName: "시스템",
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, systemMessage]);
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
                  실시간 채팅
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
                {connecting ? "연결중" : connected ? "온라인" : "오프라인"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 연결 컨트롤 */}
      {!connected && (
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-center space-x-3">
            <Button onClick={connect} disabled={connecting} className="px-6">
              {connecting ? "연결 중..." : "채팅 시작"}
            </Button>
          </div>
        </div>
      )}

      {/* 채팅 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-lg font-medium mb-2">실시간 멀티유저 채팅</p>
              <p className="text-sm">
                다른 사용자들과 실시간으로 대화해보세요!
              </p>
              {!connected && (
                <p className="text-xs text-gray-400 mt-2">
                  채팅을 시작하려면 연결 버튼을 클릭하세요
                </p>
              )}
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  currentUserName={currentUserName}
                />
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
                    sendMessage();
                  }
                }}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
                className="w-12 h-12 p-0 rounded-full"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                💬 실시간 멀티유저 채팅 (Step 1 완료)
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={clearMessages}
                  variant="outline"
                  size="sm"
                  className="px-3 text-xs"
                >
                  🧹 지우기
                </Button>
                <Button
                  onClick={disconnect}
                  variant="outline"
                  size="sm"
                  className="px-3 text-xs text-red-600 border-red-300 hover:bg-red-50"
                >
                  나가기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
