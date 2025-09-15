import React from 'react';
import { Button } from './ui';
import { CogIcon } from '@heroicons/react/24/outline';
// Removed voice output icon row to simplify panel

interface ChatSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  voiceEnabled: boolean;
  onVoiceEnabledChange: (enabled: boolean) => void;
  onClearChat?: () => void;
  lang?: 'auto' | 'ko' | 'en';
  onLangChange?: (lang: 'auto' | 'ko' | 'en') => void;
  echoCancellation?: boolean;
  onEchoCancellationChange?: (v: boolean) => void;
  noiseSuppression?: boolean;
  onNoiseSuppressionChange?: (v: boolean) => void;
  autoGainControl?: boolean;
  onAutoGainControlChange?: (v: boolean) => void;
  coalesceDelayMs?: number;
  onCoalesceDelayChange?: (ms: number) => void;
  debugEvents?: boolean;
  onDebugEventsChange?: (v: boolean) => void;
}

const ChatSettingsPanel: React.FC<ChatSettingsPanelProps> = ({
  isOpen,
  onClose,
  voiceEnabled,
  onVoiceEnabledChange,
  onClearChat,
  lang = 'auto',
  onLangChange,
  echoCancellation = true,
  onEchoCancellationChange,
  noiseSuppression = true,
  onNoiseSuppressionChange,
  autoGainControl = false,
  onAutoGainControlChange,
  coalesceDelayMs = 800,
  onCoalesceDelayChange,
  debugEvents = false,
  onDebugEventsChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-72 bg-card border-l border-border p-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CogIcon className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">설정</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-muted/30 transition-colors text-muted-foreground"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">음성 옵션</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">음성 인식</span>
              <button
                onClick={() => onVoiceEnabledChange(!voiceEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  voiceEnabled ? 'bg-muted/60' : 'bg-muted/30'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                    voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">인식 언어</span>
              <select
                className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground"
                value={lang}
                onChange={(e) => onLangChange?.(e.target.value as 'auto' | 'ko' | 'en')}
              >
                <option value="auto">자동</option>
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-between text-sm text-muted-foreground border border-border rounded px-2 py-1">
                <span>에코 캔슬</span>
                <input type="checkbox" checked={echoCancellation} onChange={(e)=>onEchoCancellationChange?.(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between text-sm text-muted-foreground border border-border rounded px-2 py-1">
                <span>노이즈 제거</span>
                <input type="checkbox" checked={noiseSuppression} onChange={(e)=>onNoiseSuppressionChange?.(e.target.checked)} />
              </label>
              <label className="flex items-center justify-between text-sm text-muted-foreground border border-border rounded px-2 py-1 col-span-2">
                <span>오토 게인</span>
                <input type="checkbox" checked={autoGainControl} onChange={(e)=>onAutoGainControlChange?.(e.target.checked)} />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">문장 병합 지연(ms)</span>
              <input
                type="number"
                className="w-24 text-sm border border-border rounded px-2 py-1 bg-background text-foreground"
                value={coalesceDelayMs}
                onChange={(e)=> onCoalesceDelayChange?.(Math.max(200, Number(e.target.value) || 800))}
                min={200}
                step={100}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">디버그 로그</span>
              <input type="checkbox" checked={debugEvents} onChange={(e)=>onDebugEventsChange?.(e.target.checked)} />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">대화 기록</h4>
          <div className="space-y-2">
            <Button
              variant="destructive"
              size="sm"
              className="w-full text-left justify-start"
              onClick={() => onClearChat?.()}
            >
              대화 기록 삭제
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSettingsPanel;
