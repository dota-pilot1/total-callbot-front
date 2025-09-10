import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface MobileSettingsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  // 캐릭터/목소리/성격 선택
  characterOptions: { id: string; name: string; emoji?: string }[];
  selectedCharacterId: string;
  onSelectCharacter: (id: string) => void;
  voiceOptions: string[];
  selectedVoice: string;
  onSelectVoice: (v: string) => void;
  voiceEnabled: boolean;
  onVoiceEnabledChange: (enabled: boolean) => void;
  speechLang: "ko" | "en";
  onSpeechLangChange: (lang: "ko" | "en") => void;
  echoCancellation: boolean;
  onEchoCancellationChange: (enabled: boolean) => void;
  noiseSuppression: boolean;
  onNoiseSuppressionChange: (enabled: boolean) => void;
  autoGainControl: boolean;
  onAutoGainControlChange: (enabled: boolean) => void;
  coalesceDelayMs: number;
  onCoalesceDelayChange: (ms: number) => void;
  debugEvents: boolean;
  onDebugEventsChange: (enabled: boolean) => void;
  onClearChat: () => void;
}

export default function MobileSettingsDropdown({
  isOpen,
  onClose,
  characterOptions,
  selectedCharacterId,
  onSelectCharacter,
  voiceOptions: _voiceOptions,
  selectedVoice: _selectedVoice,
  onSelectVoice: _onSelectVoice,
  voiceEnabled: _voiceEnabled,
  onVoiceEnabledChange: _onVoiceEnabledChange,
  speechLang,
  onSpeechLangChange,
  echoCancellation,
  onEchoCancellationChange,
  noiseSuppression,
  onNoiseSuppressionChange,
  autoGainControl,
  onAutoGainControlChange,
  coalesceDelayMs,
  onCoalesceDelayChange,
  debugEvents: _debugEvents,
  onDebugEventsChange: _onDebugEventsChange,
  onClearChat: _onClearChat,
}: MobileSettingsDropdownProps) {
  // 토글 스위치 컴포넌트
  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    size = 'normal' 
  }: { 
    enabled: boolean; 
    onChange: (enabled: boolean) => void;
    size?: 'small' | 'normal';
  }) => {
    const switchSize = size === 'small' ? 'h-5 w-9' : 'h-6 w-11';
    const circleSize = size === 'small' ? 'h-3 w-3' : 'h-4 w-4';
    const translateDistance = size === 'small' ? 'translate-x-5' : 'translate-x-6';
    
    return (
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex items-center rounded-full transition-colors ${switchSize} ${
          enabled ? "bg-indigo-600" : "bg-gray-300"
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
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={onClose}
          />
          
          {/* 설정 드롭다운 패널 */}
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ 
              type: "spring",
              damping: 25,
              stiffness: 200,
              duration: 0.3
            }}
            className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 max-h-[80vh] overflow-y-auto"
          >
            {/* 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">채팅 설정</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            {/* 설정 내용 */}
            <div className="p-4 space-y-6">
              {/* 캐릭터 선택 */}
              <div className="space-y-2">
                <h4 className="text-md font-medium text-gray-900 border-b border-gray-100 pb-2">
                  캐릭터 선택
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {characterOptions.map((c) => {
                    const selected = c.id === selectedCharacterId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => onSelectCharacter(c.id)}
                        className={`flex flex-col items-center justify-center rounded-md border text-xs py-2 ${
                          selected ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 bg-gray-50 text-gray-700'
                        }`}
                        style={{ aspectRatio: '1 / 1' }}
                        title={c.name}
                      >
                        <div className="text-lg mb-1">{c.emoji || '🤖'}</div>
                        <div className="truncate max-w-[3.2rem]">{c.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 목소리 선택 */}
              {/* <div className="space-y-2">
                <h4 className="text-md font-medium text-gray-900 border-b border-gray-100 pb-2">
                  목소리
                </h4>
                <div className="flex flex-wrap gap-2">
                  {voiceOptions.map((v) => {
                    const selected = v === selectedVoice;
                    return (
                      <button
                        key={v}
                        onClick={() => onSelectVoice(v)}
                        className={`px-3 py-1 rounded-md text-sm border ${selected ? 'bg-indigo-100 text-indigo-700 border-indigo-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div> */}

              {/* 성격 선택 제거됨 (Realtime의 voice만 노출) */}

              {/* 음성 인식 기본 설정 */}
              <div className="space-y-2">
                <h4 className="text-md font-medium text-gray-900 border-b border-gray-100 pb-ㅂ">
                  인식 언어
                </h4>                

                {/* 언어 설정 */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {[
                      { key: "ko" as const, label: "한국어" },
                      { key: "en" as const, label: "English" },
                    ].map((option) => (
                      <button
                        key={option.key}
                        onClick={() => onSpeechLangChange(option.key)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          speechLang === option.key
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                            : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 오디오 최적화 설정 */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b border-gray-100 pb-2">
                  🔊 오디오 최적화
                </h4>
                
                {[
                  {
                    key: "echo",
                    label: "에코 제거",
                    description: "스피커 소리가 마이크로 들어가는 것을 방지",
                    value: echoCancellation,
                    onChange: onEchoCancellationChange,
                  },
                  {
                    key: "noise",
                    label: "노이즈 억제",
                    description: "배경 소음을 줄여 음성 품질 향상",
                    value: noiseSuppression,
                    onChange: onNoiseSuppressionChange,
                  },
                  {
                    key: "gain",
                    label: "자동 음량 조절",
                    description: "마이크 입력 음량을 자동으로 조절",
                    value: autoGainControl,
                    onChange: onAutoGainControlChange,
                  },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{setting.label}</div>
                      <div className="text-sm text-gray-600">{setting.description}</div>
                    </div>
                    <ToggleSwitch
                      enabled={setting.value}
                      onChange={setting.onChange}
                      size="small"
                    />
                  </div>
                ))}
              </div>

              {/* 고급 설정 */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 border-b border-gray-100 pb-2">
                  ⚙️ 고급 설정
                </h4>
                
                {/* 문장 병합 지연 */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">응답 지연시간</div>
                    <div className="text-sm text-gray-600">음성 인식 후 응답까지의 지연시간</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="200"
                      max="2000"
                      step="100"
                      value={coalesceDelayMs}
                      onChange={(e) => onCoalesceDelayChange(Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600 w-12">{coalesceDelayMs}ms</span>
                  </div>
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
