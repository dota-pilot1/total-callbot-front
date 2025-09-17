import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth";
import { EXAM_CHARACTERS } from "../features/chatbot/exam/examCharacters";

import { PasswordInput } from "../components/ui/PasswordInput";

import { Button } from "../components/ui";
import MemberStatusTable from "../components/MemberStatusTable";
import {
  CheckCircleIcon,
  ArrowRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
// Simplified login; added collapsible full member info box

type ServiceType =
  | "chatbot"
  | "conversation"
  | "quiz"
  | "chat"
  | "study"
  | "board"
  | "admin";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceType>(() => {
    // localStorage에서 저장된 서비스 가져오기
    const savedService = localStorage.getItem("selectedService") as ServiceType;
    return savedService &&
      [
        "chatbot",
        "conversation",
        "quiz",
        "chat",
        "study",
        "board",
        "admin",
      ].includes(savedService)
      ? savedService
      : "chatbot";
  });

  // 서비스 선택 시 localStorage에 저장
  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service);
    localStorage.setItem("selectedService", service);
  };
  const { login, isLoading, getUser } = useAuthStore();
  const navigate = useNavigate();
  const [showMembers, setShowMembers] = useState<boolean>(false);

  // 로봇 이미지 고정
  const robotImages = {
    brand: "/simple-chatbot.png",
    chatbot: "/simple-chatbot.png",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ email, password });

      // 로그인 성공 후 사용자 정보 가져오기
      const user = getUser();
      if (!user) {
        throw new Error("사용자 정보를 가져올 수 없습니다");
      }

      // 선택된 서비스에 따라 이동
      const isMobile =
        window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);

      switch (selectedService) {
        case "chatbot":
          navigate(isMobile ? "/mobile" : "/chatbots");
          break;
        case "conversation":
          // 회화 선택 시 랜덤 캐릭터만 선택하고 바로 이동
          console.log("로그인: 회화 페이지로 이동");

          // 랜덤 캐릭터 선택
          const randomIndex = Math.floor(
            Math.random() * EXAM_CHARACTERS.length,
          );
          const randomCharacter = EXAM_CHARACTERS[randomIndex];
          localStorage.setItem("selectedExamCharacter", randomCharacter.id);
          console.log("로그인: 랜덤 캐릭터 선택:", randomCharacter.name);

          // 바로 시험 페이지로 이동 (연결은 ExamChat에서 처리)
          navigate("/exam");
          break;
        case "quiz":
          // 영어 듣기 시험 목록 페이지로 이동
          console.log("로그인: 영어 듣기 시험 목록 페이지로 이동");
          navigate("/quiz-list");
          break;
        case "chat":
          navigate("/chat"); // 전체 채팅방
          break;
        case "study":
          navigate("/study"); // 학습 페이지
          break;
        case "board":
          console.log("로그인: 게시판 페이지로 이동");
          navigate("/board"); // 게시판 페이지
          break;
        case "admin":
          console.log("로그인: 관리자 대시보드로 이동");
          navigate("/admin"); // 관리자 대시보드
          break;
        default:
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
          <div className="rounded-lg bg-card p-6 shadow-lg">
            {/* 브랜드 라인 (심플, 공간 채움) */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={robotImages.brand}
                alt="콜봇"
                className="h-6 w-6 rounded-md object-cover"
              />
              <span className="text-xs font-medium text-muted-foreground">
                Total Callbot
              </span>
            </div>
            {/* 서비스 선택 (3x3 그리드) */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {/* 챗봇 */}
              <button
                onClick={() => handleServiceSelect("chatbot")}
                aria-pressed={selectedService === "chatbot"}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedService === "chatbot"
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {selectedService === "chatbot" && (
                  <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                )}
                <img
                  src={robotImages.chatbot}
                  alt="챗봇"
                  className="h-12 w-12 rounded-lg object-cover mb-2"
                />
                <span className="text-xs font-medium text-gray-700">챗봇</span>
              </button>

              {/* 회화 */}
              <button
                onClick={() => handleServiceSelect("conversation")}
                aria-pressed={selectedService === "conversation"}
                className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                  selectedService === "conversation"
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {selectedService === "conversation" && (
                  <CheckCircleIcon className="absolute top-1 right-1 h-4 w-4 text-blue-500" />
                )}
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-1">
                  <span className="text-lg">💬</span>
                </div>
                <span className="text-xs font-medium text-gray-700">회화</span>
              </button>

              {/* 영어 듣기 */}
              <button
                onClick={() => handleServiceSelect("quiz")}
                aria-pressed={selectedService === "quiz"}
                className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                  selectedService === "quiz"
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {selectedService === "quiz" && (
                  <CheckCircleIcon className="absolute top-1 right-1 h-4 w-4 text-blue-500" />
                )}
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-1">
                  <span className="text-lg">🎧</span>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  영어듣기
                </span>
              </button>

              {/* 전체 채팅방 */}
              <button
                onClick={() => handleServiceSelect("chat")}
                aria-pressed={selectedService === "chat"}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedService === "chat"
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {selectedService === "chat" && (
                  <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                )}
                <img
                  src="/multi-chat.png"
                  alt="전체 채팅방"
                  className="h-12 w-12 rounded-lg object-cover mb-2"
                />
                <span className="text-xs font-medium text-gray-700">
                  전체채팅
                </span>
              </button>

              {/* 학습 */}
              <button
                onClick={() => handleServiceSelect("study")}
                aria-pressed={selectedService === "study"}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedService === "study"
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {selectedService === "study" && (
                  <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                )}
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-2">
                  <span className="text-2xl">📚</span>
                </div>
                <span className="text-xs font-medium text-gray-700">학습</span>
              </button>

              {/* 게시판 */}
              <button
                onClick={() => handleServiceSelect("board")}
                aria-pressed={selectedService === "board"}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedService === "board"
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {selectedService === "board" && (
                  <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                )}
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mb-2">
                  <span className="text-2xl">📋</span>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  게시판
                </span>
              </button>

              {/* 관리자 */}
              <button
                onClick={() => handleServiceSelect("admin")}
                aria-pressed={selectedService === "admin"}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedService === "admin"
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {selectedService === "admin" && (
                  <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                )}
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mb-2">
                  <span className="text-2xl">⚙️</span>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  관리자
                </span>
              </button>

              {/* 빈 공간 (3x3 그리드에서 8개 요소만 사용) */}
              <div></div>
            </div>

            {/* 로그인 폼 */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
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
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  비밀번호
                </label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="border border-border"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
                variant="outline"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>{isLoading ? "로그인 중..." : "로그인"}</span>
                  {!isLoading && <ArrowRightIcon className="h-4 w-4" />}
                </span>
              </Button>
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
            <div className="mt-6 rounded-lg border border-border bg-card">
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
