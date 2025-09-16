import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";

interface MobileAudioSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // 음성 설정
  speechLang: "ko" | "en";
  onSpeechLangChange: (lang: "ko" | "en") => void;
  echoCancellation: boolean;
  onEchoCancellationChange: (enabled: boolean) => void;
  noiseSuppression: boolean;
  onNoiseSuppressionChange: (enabled: boolean) => void;
  autoGainControl: boolean;
  onAutoGainControlChange: (enabled: boolean) => void;
  responseDelayMs: number;
  onResponseDelayChange: (ms: number) => void;
  onClearChat: () => void;
}

export default function MobileAudioSettingsDialog({
  isOpen,
  onClose,
  speechLang,
  onSpeechLangChange,
  echoCancellation,
  onEchoCancellationChange,
  noiseSuppression,
  onNoiseSuppressionChange,
  autoGainControl,
  onAutoGainControlChange,
  responseDelayMs,
  onResponseDelayChange,
  onClearChat,
}: MobileAudioSettingsDialogProps) {
  // 토글 스위치 컴포넌트
  const ToggleSwitch = ({
    enabled,
    onChange,
  }: {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
  }) => {
    return (
      <button
        type="button"
        className={`h-6 w-11 ${
          enabled ? "bg-blue-600" : "bg-gray-200"
        } relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        onClick={() => onChange(!enabled)}
      >
        <span
          className={`h-5 w-5 ${
            enabled ? "translate-x-5" : "translate-x-0"
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

          {/* 음성 설정 슬라이드 다운 패널 */}
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
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-b border-blue-300 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <SpeakerWaveIcon className="h-5 w-5" />
                <h2 className="text-lg font-semibold">음성 설정</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* 설정 내용 */}
            <div className="p-6 space-y-8">
              {/* 음성 언어 */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-4">
                  🌐 음성 언어
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onSpeechLangChange("ko")}
                    className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                      speechLang === "ko"
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    한국어
                  </button>
                  <button
                    onClick={() => onSpeechLangChange("en")}
                    className={`px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                      speechLang === "en"
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* 오디오 품질 설정 */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-4">
                  🎧 오디오 품질
                </label>

                <div className="space-y-4">
                  {/* 에코 제거 */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        에코 제거
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        스피커 에코를 자동으로 제거합니다
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={echoCancellation}
                      onChange={onEchoCancellationChange}
                    />
                  </div>

                  {/* 노이즈 억제 */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        노이즈 억제
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        배경 소음을 자동으로 제거합니다
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={noiseSuppression}
                      onChange={onNoiseSuppressionChange}
                    />
                  </div>

                  {/* 자동 음량 조절 */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        자동 음량 조절
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        마이크 음량을 자동으로 조절합니다
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={autoGainControl}
                      onChange={onAutoGainControlChange}
                    />
                  </div>
                </div>
              </div>

              {/* 응답 지연 시간 */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-4">
                  ⏱️ 응답 지연 시간
                </label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Slider
                    value={responseDelayMs}
                    onChange={onResponseDelayChange}
                    min={0}
                    max={5000}
                    step={500}
                    unit="ms"
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    사용자 발언 완료 후 AI 응답까지의 대기 시간
                  </p>
                </div>
              </div>
            </div>

            {/* 하단 액션 */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <button
                onClick={onClearChat}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
              >
                대화 내용 지우기
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
