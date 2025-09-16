import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

interface MobileExamOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // 시험 관련 설정
  englishLevel: "beginner" | "intermediate" | "advanced";
  onEnglishLevelChange: (
    level: "beginner" | "intermediate" | "advanced",
  ) => void;
  examDifficulty: "easy" | "medium" | "hard";
  onExamDifficultyChange: (difficulty: "easy" | "medium" | "hard") => void;
  examDuration: number; // 분 단위
  onExamDurationChange: (duration: number) => void;
  autoStartExam: boolean;
  onAutoStartExamChange: (enabled: boolean) => void;
  showScoreAfterEach: boolean;
  onShowScoreAfterEachChange: (enabled: boolean) => void;
}

export default function MobileExamOptionsDialog({
  isOpen,
  onClose,
  englishLevel,
  onEnglishLevelChange,
  examDifficulty,
  onExamDifficultyChange,
  examDuration,
  onExamDurationChange,
  autoStartExam,
  onAutoStartExamChange,
  showScoreAfterEach,
  onShowScoreAfterEachChange,
}: MobileExamOptionsDialogProps) {
  // 토글 스위치 컴포넌트
  const ToggleSwitch = ({
    enabled,
    onChange,
    size = "normal",
  }: {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    size?: "small" | "normal";
  }) => {
    const switchSize = size === "small" ? "h-5 w-9" : "h-6 w-11";
    const thumbSize = size === "small" ? "h-4 w-4" : "h-5 w-5";
    const translateX = size === "small" ? "translate-x-4" : "translate-x-5";

    return (
      <button
        type="button"
        className={`${switchSize} ${
          enabled ? "bg-blue-600" : "bg-gray-200"
        } relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        onClick={() => onChange(!enabled)}
      >
        <span
          className={`${thumbSize} ${
            enabled ? translateX : "translate-x-0"
          } inline-block transform rounded-full bg-white shadow-lg ring-0 transition-transform`}
        />
      </button>
    );
  };

  // 슬라이더 컴포넌트
  const Slider = ({
    value,
    onChange,
    min,
    max,
    step = 1,
    unit = "",
  }: {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    unit?: string;
  }) => (
    <div className="flex items-center space-x-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <span className="text-sm text-gray-600 min-w-[60px] text-right">
        {value}
        {unit}
      </span>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* 시험 옵션 슬라이드 다운 패널 */}
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              duration: 0.3,
            }}
            className="fixed inset-0 bg-white shadow-lg z-50 overflow-y-auto"
          >
            {/* 헤더 */}
            <div className="sticky top-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white px-6 py-6 flex justify-between items-center shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <AcademicCapIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">시험 설정</h2>
                  <p className="text-purple-100 text-sm">
                    나에게 맞는 시험 환경을 설정하세요
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 rounded-xl hover:bg-white/20 transition-all duration-200 text-white backdrop-blur-sm"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* 설정 내용 */}
            <div className="bg-gray-50 min-h-screen">
              <div className="p-6 space-y-6">
                {/* 영어 레벨 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <span className="text-xl">🎯</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        영어 레벨
                      </h3>
                      <p className="text-sm text-gray-500">
                        현재 영어 실력 수준을 선택하세요
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(["beginner", "intermediate", "advanced"] as const).map(
                      (level) => (
                        <button
                          key={level}
                          onClick={() => onEnglishLevelChange(level)}
                          className={`px-4 py-4 text-sm font-semibold rounded-xl border-2 transition-all duration-200 ${
                            englishLevel === level
                              ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/25 scale-105"
                              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md"
                          }`}
                        >
                          {level === "beginner"
                            ? "초급"
                            : level === "intermediate"
                              ? "중급"
                              : "고급"}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* 시험 난이도 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <span className="text-xl">⚡</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        시험 난이도
                      </h3>
                      <p className="text-sm text-gray-500">
                        시험 문제의 난이도를 선택하세요
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(["easy", "medium", "hard"] as const).map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() => onExamDifficultyChange(difficulty)}
                        className={`px-4 py-4 text-sm font-semibold rounded-xl border-2 transition-all duration-200 ${
                          examDifficulty === difficulty
                            ? "border-purple-500 bg-purple-500 text-white shadow-lg shadow-purple-500/25 scale-105"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        {difficulty === "easy"
                          ? "쉬움"
                          : difficulty === "medium"
                            ? "보통"
                            : "어려움"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 시험 시간 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-xl">
                      <span className="text-xl">⏰</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        시험 시간
                      </h3>
                      <p className="text-sm text-gray-500">
                        시험 진행 시간을 설정하세요
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
                    <Slider
                      value={examDuration}
                      onChange={onExamDurationChange}
                      min={5}
                      max={30}
                      step={5}
                      unit="분"
                    />
                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-white/60 rounded-lg">
                        <span className="font-medium text-gray-600">초급</span>
                        <br />
                        <span className="text-orange-600">10분 권장</span>
                      </div>
                      <div className="text-center p-2 bg-white/60 rounded-lg">
                        <span className="font-medium text-gray-600">중급</span>
                        <br />
                        <span className="text-orange-600">15분 권장</span>
                      </div>
                      <div className="text-center p-2 bg-white/60 rounded-lg">
                        <span className="font-medium text-gray-600">고급</span>
                        <br />
                        <span className="text-orange-600">20분 권장</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 고급 옵션 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <span className="text-xl">🔧</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        고급 옵션
                      </h3>
                      <p className="text-sm text-gray-500">
                        세부 시험 환경을 조정하세요
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* 자동 시험 시작 */}
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <span className="text-sm">🚀</span>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-800">
                            자동 시험 시작
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            연결 완료 후 자동으로 시험을 시작합니다
                          </p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={autoStartExam}
                        onChange={onAutoStartExamChange}
                      />
                    </div>

                    {/* 문항별 점수 표시 */}
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <span className="text-sm">📊</span>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-800">
                            문항별 점수 표시
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            각 문제 완료 후 개별 점수를 표시합니다
                          </p>
                        </div>
                      </div>
                      <ToggleSwitch
                        enabled={showScoreAfterEach}
                        onChange={onShowScoreAfterEachChange}
                      />
                    </div>
                  </div>
                </div>

                {/* 하단 여백 */}
                <div className="h-20"></div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
