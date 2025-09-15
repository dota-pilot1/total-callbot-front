import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth";

import {
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { RobotIcon } from "../components/icons/RobotIcon";
import RippleButton from "../components/ui/RippleButton";
import MemberStatusTable from "../components/MemberStatusTable";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

type ServiceType = "chatbot" | "chat";

export default function Login() {
  const [email, setEmail] = useState("terecal@daum.net");
  const [password, setPassword] = useState("123456");
  const [selectedService, setSelectedService] =
    useState<ServiceType>("chatbot");
  const [participantCount, setParticipantCount] = useState(0);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // 접속자 수 실시간 조회
  useEffect(() => {
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1";
    const wsUrl = isLocal
      ? "http://localhost:8080/ws-stomp"
      : "https://api.total-callbot.cloud/ws-stomp";

    const socket = new SockJS(wsUrl);
    const client = Stomp.over(socket);

    client.connect(
      {},
      () => {
        // 전체 채팅방 참여자 수 구독
        client.subscribe("/topic/participant-count", (message: any) => {
          try {
            const participantData = JSON.parse(message.body);
            console.log(
              "Login page - Participant data received:",
              participantData,
            );
            console.log("Setting participant count to:", participantData.count);
            setParticipantCount(participantData.count || 0);
          } catch (error) {
            console.error("Error parsing participant data:", error);
          }
        });

        // 참여자 수 요청 (약간의 지연 후)
        setTimeout(() => {
          client.publish({
            destination: "/app/chat/participant-count",
            body: JSON.stringify({}),
          });
        }, 1000);
      },
      (error: any) => {
        console.log("Connection error:", error);
      },
    );

    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password });

      // 선택된 서비스에 따라 이동
      if (selectedService === "chat") {
        navigate("/chat"); // 전체 채팅방
      } else {
        // 모바일 디바이스 감지
        const isMobile =
          window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
        navigate(isMobile ? "/mobile" : "/chatbots");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="rounded-lg border bg-card p-8 shadow-lg">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold tracking-tight mb-2">
                {selectedService === "chatbot"
                  ? "챗봇 트레이너"
                  : "채팅 서비스"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedService === "chatbot"
                  ? "AI 챗봇과 영어 학습!"
                  : "실시간 채팅으로 소통하세요"}
              </p>
            </div>

            {/* 서비스 선택 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setSelectedService("chatbot")}
                className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  selectedService === "chatbot"
                    ? "border-primary bg-primary/10 text-primary shadow-md scale-105"
                    : "border-border hover:bg-accent hover:text-accent-foreground hover:border-primary/30"
                }`}
              >
                {selectedService === "chatbot" && (
                  <CheckCircleIcon className="absolute top-1 right-1 h-5 w-5 text-primary" />
                )}
                <RobotIcon className="h-6 w-6 mb-2" />
                <span className="text-sm font-medium">챗봇</span>
              </button>

              <button
                onClick={() => setSelectedService("chat")}
                className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  selectedService === "chat"
                    ? "border-primary bg-primary/10 text-primary shadow-md scale-105"
                    : "border-border hover:bg-accent hover:text-accent-foreground hover:border-primary/30"
                }`}
              >
                {selectedService === "chat" && (
                  <CheckCircleIcon className="absolute top-1 right-1 h-5 w-5 text-primary" />
                )}
                <div className="relative">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 mb-2" />
                  {participantCount >= 0 && (
                    <span className="absolute -top-3 -right-3 min-w-[1.5rem] h-6 text-sm font-medium text-white bg-green-500 rounded-full flex items-center justify-center px-1 shadow-lg border-2 border-white">
                      {participantCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium">채팅</span>
              </button>
            </div>

            {/* 로그인 폼 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="••••••••"
                  required
                />
              </div>

              <RippleButton
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gray-900 hover:bg-black text-white font-medium rounded-lg border border-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>{isLoading ? "로그인 중..." : "로그인"}</span>
                  {!isLoading && <ArrowRightIcon className="h-4 w-4" />}
                </span>
              </RippleButton>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link
                to="/welcome"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← 소개
              </Link>
              <Link
                to="/signup"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                회원가입 →
              </Link>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1 font-medium">
                테스트 계정
              </p>
              <p className="text-xs text-muted-foreground/80 font-mono">
                terecal@daum.net / 123456
              </p>
            </div>

            {/* 회원 접속 현황 테이블 */}
            <MemberStatusTable />
          </div>
        </div>
      </div>
    </div>
  );
}
