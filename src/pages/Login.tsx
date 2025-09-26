import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth";
import { EXAM_CHARACTERS } from "../features/chatbot/exam/examCharacters";
import { PasswordInput } from "../components/ui/PasswordInput";

import { Button } from "../components/ui";
import {
  CheckCircleIcon,
  ArrowRightIcon,
  CogIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

type ServiceType =
  | "chatbot"
  | "chat"
  | "chat_list"
  | "scenario_template"
  | "exam"
  | "group_quiz"
  | "question_bank"
  | "daily_english"
  | "quiz"
  | "interval_reading"
  | "board"
  | "my_study";

export default function Login() {
  // 테스트 계정 목록
  const testAccounts = [
    "terecal@daum.net",
    "user1@daum.net",
    "user2@daum.net",
    "user3@daum.net",
    "user4@daum.net",
    "user5@daum.net",
    "user6@daum.net",
    "user7@daum.net",
    "user8@daum.net",
    "user9@daum.net",
  ];

  // 랜덤 계정 선택 및 자동 입력
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // 페이지 로드시 랜덤 계정 선택하여 자동 입력
    const randomIndex = Math.floor(Math.random() * testAccounts.length);
    const randomEmail = testAccounts[randomIndex];
    setEmail(randomEmail);
    setPassword("123456");
  }, []);

  const [selectedService, setSelectedService] = useState<ServiceType>(() => {
    // localStorage에서 저장된 서비스 가져오기
    const savedService = localStorage.getItem("selectedService");
    const normalizedService =
      savedService === "history"
        ? "daily_english"
        : savedService === "math" || savedService === "daily_math"
          ? "group_quiz"
          : savedService;

    const validServices: ServiceType[] = [
      "chatbot",
      "chat",
      "chat_list",
      "scenario_template",
      "exam",
      "group_quiz",
      "question_bank",
      "daily_english",
      "quiz",
      "interval_reading",
      "board",
      "my_study",
    ];

    if (
      normalizedService &&
      validServices.includes(normalizedService as ServiceType)
    ) {
      return normalizedService as ServiceType;
    }

    return "chatbot";
  });

  // 서비스 선택 시 localStorage에 저장
  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service);
    localStorage.setItem("selectedService", service);
  };
  const { login, isLoading, getUser } = useAuthStore();
  const navigate = useNavigate();

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
      const isMobileDevice =
        window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);

      switch (selectedService) {
        case "chatbot":
          navigate(isMobileDevice ? "/mobile" : "/chatbots");
          break;
        case "exam":
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
          navigate("/role-play");
          break;
        case "group_quiz":
          // 단체 퀴즈 페이지로 이동 (모바일/데스크톱 구분)
          console.log("로그인: 단체 퀴즈 페이지로 이동");
          navigate(isMobileDevice ? "/group-quiz-mobile" : "/group-quiz-web");
          break;
        case "quiz":
          // 영어 듣기 시험 목록 페이지로 이동
          console.log("로그인: 영어 듣기 시험 목록 페이지로 이동");
          navigate("/quiz-list");
          break;
        case "interval_reading":
          // 화면 크기에 따라 모바일/웹 페이지로 분기
          const isMobile = window.innerWidth < 768;
          navigate(
            isMobile
              ? "/interval-english-reading-mobile"
              : "/interval-english-reading-web",
          );
          break;

        case "scenario_template":
          navigate("/conversation-scenario-templates"); // 시나리오 템플릿 페이지
          break;
        case "board":
          console.log("로그인: 게시판 페이지로 이동");
          navigate("/board"); // 게시판 페이지
          break;
        case "question_bank":
          console.log("로그인: 테스트 센터 페이지로 이동");
          navigate("/test-center"); // 테스트 센터 페이지
          break;
        case "daily_english":
          console.log("로그인: 일일 영어 페이지로 이동");
          navigate("/daily-english");
          break;

        case "my_study":
          console.log("로그인: my-study 대시보드로 이동");
          navigate("/my-study");
          break;
        default:
          navigate(isMobileDevice ? "/mobile" : "/chatbots");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Thin Header */}
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">MS</span>
          </div>
          <span className="text-sm font-medium text-foreground">my-study</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/chat")}
            className="flex items-center gap-2"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            <span className="text-sm">전체 채팅</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/chat/rooms")}
            className="flex items-center gap-2"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            <span className="text-sm">채팅방 목록</span>
          </Button>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-3rem)] px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="rounded-lg bg-card p-6 shadow-lg">
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

              {/* 인터벌 영독 */}
              <button
                onClick={() => handleServiceSelect("interval_reading")}
                aria-pressed={selectedService === "interval_reading"}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedService === "interval_reading"
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {selectedService === "interval_reading" && (
                  <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                )}
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-2">
                  <span className="text-xl">📚</span>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  인터벌 영독
                </span>
              </button>

              {/* 인터벌 영듣 */}
              <button
                onClick={() => handleServiceSelect("group_quiz")}
                aria-pressed={selectedService === "group_quiz"}
                className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                  selectedService === "group_quiz"
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {selectedService === "group_quiz" && (
                  <CheckCircleIcon className="absolute top-1 right-1 h-4 w-4 text-blue-500" />
                )}
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mb-1">
                  <span className="text-lg">👥</span>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  인터벌 영듣
                </span>
              </button>

              {/* 역할극 */}
              <button
                onClick={() => handleServiceSelect("exam")}
                aria-pressed={selectedService === "exam"}
                className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                  selectedService === "exam"
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {selectedService === "exam" && (
                  <CheckCircleIcon className="absolute top-1 right-1 h-4 w-4 text-blue-500" />
                )}
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-1">
                  <span className="text-lg">🎭</span>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  역할극
                </span>
              </button>

              {/* 듣기 시험 */}
              <button
                onClick={() => handleServiceSelect("quiz")}
                aria-pressed={selectedService === "quiz"}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedService === "quiz"
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {selectedService === "quiz" && (
                  <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                )}
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-2">
                  <span className="text-2xl">🎧</span>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  듣기 시험
                </span>
              </button>

              {/* 테스트 센터 */}
              <button
                onClick={() => handleServiceSelect("question_bank")}
                aria-pressed={selectedService === "question_bank"}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedService === "question_bank"
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {selectedService === "question_bank" && (
                  <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                )}
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mb-2">
                  <span className="text-2xl">🏛️</span>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  문제 은행
                </span>
              </button>

              {/* 일일 회화 */}
              <button
                onClick={() => handleServiceSelect("daily_english")}
                aria-pressed={selectedService === "daily_english"}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedService === "daily_english"
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {selectedService === "daily_english" && (
                  <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                )}
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-2">
                  <span className="text-2xl">📅</span>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  일일 회화
                </span>
              </button>

              {/* my-study */}
              <button
                onClick={() => handleServiceSelect("my_study")}
                aria-pressed={selectedService === "my_study"}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedService === "my_study"
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {selectedService === "my_study" && (
                  <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                )}
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-sm">MS</span>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  my-study
                </span>
              </button>

              {/* 시나리오 템플릿 */}
              <button
                onClick={() => handleServiceSelect("scenario_template")}
                aria-pressed={selectedService === "scenario_template"}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedService === "scenario_template"
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {selectedService === "scenario_template" && (
                  <CheckCircleIcon className="absolute top-2 right-2 h-5 w-5 text-blue-500" />
                )}
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-2">
                  <span className="text-2xl">📝</span>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  시나리오 템플릿
                </span>
              </button>
            </div>

            {/* 자동 입력 안내 */}
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                💡 로그인 정보가 자동 입력되었습니다. 로그인 버튼을 클릭하시면
                로그인됩니다. 또는 회원가입을 해주세요.
              </p>
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
                  autoComplete="username"
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
          </div>

          {/* 하단 관리 버튼들 */}
          <div className="mt-6 space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-3"
              onClick={() => navigate("/board")}
            >
              <span className="text-base">📋 게시판</span>
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 py-3"
              onClick={() => navigate("/admin/members")}
            >
              <CogIcon className="h-5 w-5" />
              <span className="text-base">회원 관리</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
