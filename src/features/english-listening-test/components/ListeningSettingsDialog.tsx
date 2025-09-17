import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { ListeningSettings } from "../types";

interface ListeningSettingsDialogProps extends ListeningSettings {
  isOpen: boolean;
  onClose: () => void;
  onSpeechRateChange: (rate: number) => void;
  onAutoRepeatChange: (enabled: boolean) => void;
  onShowSubtitlesChange: (enabled: boolean) => void;
  onDifficultyChange: (level: 'beginner' | 'intermediate' | 'advanced') => void;
}

export default function ListeningSettingsDialog({
  isOpen,
  onClose,
  speechRate,
  onSpeechRateChange,
  autoRepeat,
  onAutoRepeatChange,
  showSubtitles,
  onShowSubtitlesChange,
  difficulty,
  onDifficultyChange,
}: ListeningSettingsDialogProps) {
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
    const circleSize = size === "small" ? "h-3 w-3" : "h-4 w-4";
    const translateDistance = size === "small" ? "translate-x-5" : "translate-x-6";

    return (
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex items-center rounded-full transition-colors ${switchSize} ${
          enabled ? "bg-blue-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block transform rounded-full bg-white transition-transform ${circleSize} ${
            enabled ? translateDistance : "translate-x-0.5"
          }`}
        />
      </button>
    );
  };

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

          {/* 설정 드롭다운 패널 */}
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
            className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 max-h-screen overflow-y-auto"
          >
            {/* 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">🎧 듣기 설정</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* 설정 내용 */}
            <div className="p-4 space-y-6">
              {/* 음성 속도 설정 */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
                  🔊 음성 설정
                </h4>

                <div className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">재생 속도</div>
                    <div className="text-sm text-gray-600">
                      영어 음성의 재생 속도를 조절합니다
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      value={speechRate}
                      onChange={(e) => onSpeechRateChange(Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600 w-12">
                      {speechRate}x
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">자동 반복</div>
                    <div className="text-sm text-gray-600">
                      문제당 음성을 자동으로 2번 재생합니다
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={autoRepeat}
                    onChange={onAutoRepeatChange}
                    size="small"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">자막 표시</div>
                    <div className="text-sm text-gray-600">
                      학습 모드에서 영어 자막을 표시합니다
                    </div>
                  </div>
                  <ToggleSwitch
                    enabled={showSubtitles}
                    onChange={onShowSubtitlesChange}
                    size="small"
                  />
                </div>
              </div>

              {/* 난이도 설정 */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
                  📚 난이도 설정
                </h4>

                <div className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">영어 수준</div>
                    <div className="text-sm text-gray-600">
                      수준에 맞는 문제와 어휘를 제공합니다
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={difficulty}
                      onChange={(e) =>
                        onDifficultyChange(
                          e.target.value as 'beginner' | 'intermediate' | 'advanced'
                        )
                      }
                      className="px-3 py-1 rounded border border-gray-300 text-sm bg-white"
                    >
                      <option value="beginner">초급 (Elementary)</option>
                      <option value="intermediate">중급 (Intermediate)</option>
                      <option value="advanced">고급 (Advanced)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 학습 팁 */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">
                  💡 학습 팁
                </h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• 처음엔 느린 속도로 시작해서 점차 빠르게 조절하세요</li>
                    <li>• 자막 없이 먼저 들어보고, 어려우면 자막을 켜보세요</li>
                    <li>• 반복 듣기로 발음과 억양을 익혀보세요</li>
                    <li>• 정답 후 해당 문장을 따라 읽어보세요</li>
                  </ul>
                </div>
              </div>

              {/* 하단 여백 */}
              <div className="h-4" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
