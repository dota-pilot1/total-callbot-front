import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth";
import { Button } from "../components/ui";

import {
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

import MobileExamOptionsDialog from "../features/exam/components/MobileExamOptionsDialog";
import { useAudioSettings } from "../features/chatbot/settings";
import { useExamSettingsHook } from "../features/exam/hooks/useExamSettings";

export default function MobileExam() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  // 오디오 설정 훅
  const {
    settings: { englishLevel },
    setEnglishLevel,
  } = useAudioSettings();

  const [examOptionsOpen, setExamOptionsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 시험 설정 훅
  const {
    settings: examSettings,
    setExamDifficulty,
    setExamDuration,
    setAutoStartExam,
    setShowScoreAfterEach,
  } = useExamSettingsHook();

  const planSteps = [
    {
      id: 1,
      title: "시험 문제 출제 요청",
      description: "시험 시작할 때 서버에 문제 출제 요청",
    },
    {
      id: 2,
      title: "카드로 시험 문제 출력",
      description: "슬라이드로 3-5문제를 카드 형태로 표시",
    },
    {
      id: 3,
      title: "슬라이드 네비게이션",
      description: "슬라이드로 넘겨가면서 문제를 풀 수 있게",
    },
    {
      id: 4,
      title: "즉시 채점 및 저장",
      description: "듣기 버튼으로 출제, 답변 입력 후 바로 채점하고 저장",
    },
    {
      id: 5,
      title: "결과 조회",
      description: "모든 문제를 다 푼 후 종합 결과 조회",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="rounded-lg border bg-card p-6 shadow-lg">
            {/* 브랜드 라인 & 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                  <AcademicCapIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-foreground">
                    AI 영어 시험
                  </span>
                  <p className="text-xs text-muted-foreground">
                    카드 기반 시험 시스템
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="h-8 w-8 p-0"
                  size="sm"
                  title="뒤로가기"
                >
                  <span className="text-sm">←</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExamOptionsOpen(true)}
                  title="시험 설정"
                  className="h-8 w-8 p-0"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  title="로그아웃"
                  className="h-8 w-8 p-0"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 구현 계획 - 간단한 목록 */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
                구현 계획
              </h2>

              <div className="space-y-3">
                {planSteps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-start space-x-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors duration-200"
                  >
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-sm font-medium text-muted-foreground flex-shrink-0 mt-0.5">
                      {step.id}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 시작 버튼 */}
            <div className="text-center mb-6">
              <Button
                size="lg"
                className="w-full"
                variant="outline"
                onClick={() => {
                  console.log("시험 시작 - 카드 기반 시스템 구현 예정");
                  alert("카드 기반 시험 시스템 구현 예정입니다!");
                }}
              >
                <span className="flex items-center justify-center space-x-2">
                  <span className="text-lg mr-2">🎓</span>
                  <span>시험 시작하기</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                카드 기반 시험 시스템으로 업그레이드 예정
              </p>
            </div>

            {/* 현재 설정 정보 (접이식) */}
            <div className="rounded-lg border border-border bg-card">
              <button
                type="button"
                onClick={() => setShowSettings((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
                aria-expanded={showSettings}
                aria-controls="settings-panel"
              >
                <span>현재 설정</span>
                <ChevronDownIcon
                  className={`h-5 w-5 transition-transform ${showSettings ? "rotate-180" : "rotate-0"}`}
                />
              </button>

              {showSettings && (
                <div id="settings-panel" className="px-4 pb-4 border-t">
                  <div className="pt-3 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">영어 레벨</span>
                      <span className="font-medium">{englishLevel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">시험 난이도</span>
                      <span className="font-medium">
                        {examSettings.examDifficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">시험 시간</span>
                      <span className="font-medium">
                        {examSettings.examDuration}분
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">자동 시작</span>
                      <span
                        className={`font-medium ${examSettings.autoStartExam ? "text-green-600" : "text-gray-500"}`}
                      >
                        {examSettings.autoStartExam ? "ON" : "OFF"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 하단 링크 */}
            <div className="mt-6 flex items-center justify-center text-sm">
              <button
                onClick={() => setExamOptionsOpen(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                시험 설정 변경 →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 시험 옵션 다이어로그 */}
      <MobileExamOptionsDialog
        isOpen={examOptionsOpen}
        onClose={() => setExamOptionsOpen(false)}
        englishLevel={englishLevel}
        onEnglishLevelChange={setEnglishLevel}
        examDifficulty={examSettings.examDifficulty}
        onExamDifficultyChange={setExamDifficulty}
        examDuration={examSettings.examDuration}
        onExamDurationChange={setExamDuration}
        autoStartExam={examSettings.autoStartExam}
        onAutoStartExamChange={setAutoStartExam}
        showScoreAfterEach={examSettings.showScoreAfterEach}
        onShowScoreAfterEachChange={setShowScoreAfterEach}
      />
    </div>
  );
}
