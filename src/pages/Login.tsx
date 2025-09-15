import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth";

import {
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import RippleButton from "../components/ui/RippleButton";
import MemberStatusTable from "../components/MemberStatusTable";
// Simplified login; added collapsible full member info box

type ServiceType = "chatbot" | "chat";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedService, setSelectedService] =
    useState<ServiceType>("chatbot");
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [showMembers, setShowMembers] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
            {/* 소개 탭 (챗봇/채팅 간략 소개) */}
            <div className="mb-4">
              <div className="flex gap-2 border-b">
                <button
                  type="button"
                  onClick={() => setSelectedService("chatbot")}
                  aria-pressed={selectedService === "chatbot"}
                  className={`px-3 py-2 text-sm -mb-px rounded-t-md transition-colors ${
                    selectedService === "chatbot"
                      ? "border-b-2 border-primary text-foreground bg-muted/40"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                  }`}
                >
                  챗봇
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedService("chat")}
                  aria-pressed={selectedService === "chat"}
                  className={`px-3 py-2 text-sm -mb-px rounded-t-md transition-colors ${
                    selectedService === "chat"
                      ? "border-b-2 border-primary text-foreground bg-muted/40"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                  }`}
                >
                  채팅
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {selectedService === "chatbot"
                  ? "AI 챗봇과 대화하며 영어를 간단히 연습하세요."
                  : "실시간 채팅으로 사용자들과 빠르게 소통하세요."}
              </p>
            </div>

            {/* 서비스 선택 */}
            <div className="grid grid-cols-2 gap-3 mb-6 bg-muted/20 p-2 rounded-xl">
              <button
                onClick={() => setSelectedService("chatbot")}
                aria-pressed={selectedService === "chatbot"}
                className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-colors duration-200 ${
                  selectedService === "chatbot"
                    ? "border-primary bg-muted/60 text-foreground shadow-md ring-1 ring-primary/30"
                    : "border-border hover:bg-muted/30 hover:text-foreground hover:border-primary/30"
                }`}
              >
                {selectedService === "chatbot" && (
                  <CheckCircleIcon className="absolute top-1 right-1 h-5 w-5 text-primary" />
                )}
                <img
                  src="/gpt-star.jpeg"
                  alt="챗봇"
                  className="h-8 w-8 rounded-md object-cover"
                />
              </button>

              <button
                onClick={() => setSelectedService("chat")}
                aria-pressed={selectedService === "chat"}
                className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-colors duration-200 ${
                  selectedService === "chat"
                    ? "border-primary bg-muted/60 text-foreground shadow-md ring-1 ring-primary/30"
                    : "border-border hover:bg-muted/30 hover:text-foreground hover:border-primary/30"
                }`}
              >
                {selectedService === "chat" && (
                  <CheckCircleIcon className="absolute top-1 right-1 h-5 w-5 text-primary" />
                )}
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
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

            {/* 전체 회원 정보 (접이식) */}
            <div className="mt-6 rounded-lg border">
              <button
                type="button"
                onClick={() => setShowMembers((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
                aria-expanded={showMembers}
                aria-controls="member-info-panel"
              >
                <span>전체 회원 정보</span>
                <ChevronDownIcon
                  className={`h-5 w-5 transition-transform ${showMembers ? "rotate-180" : "rotate-0"}`}
                />
              </button>
              {showMembers && (
                <div id="member-info-panel" className="px-4 pb-4 border-t">
                  <div className="pt-3">
                    <MemberStatusTable bordered={false} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
