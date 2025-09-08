import React from 'react';
import { Button } from './ui';
import { CogIcon } from '@heroicons/react/24/outline';
import { SpeakerWaveIcon as SpeakerWaveIconSolid } from '@heroicons/react/24/solid';

interface ChatSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  voiceEnabled: boolean;
  onVoiceEnabledChange: (enabled: boolean) => void;
  onClearChat?: () => void;
}

const ChatSettingsPanel: React.FC<ChatSettingsPanelProps> = ({
  isOpen,
  onClose,
  voiceEnabled,
  onVoiceEnabledChange,
  onClearChat
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-72 bg-white border-l border-gray-200 p-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <CogIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">설정</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">음성 옵션</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">음성 출력</span>
              <SpeakerWaveIconSolid className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">음성 인식</span>
              <button
                onClick={() => onVoiceEnabledChange(!voiceEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  voiceEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">음성 속도</span>
              <select className="text-sm border border-gray-300 rounded px-2 py-1">
                <option>보통</option>
                <option>빠름</option>
                <option>느림</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">콜봇 설정</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">자동 응답</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">응답 지연</span>
              <span className="text-sm text-gray-500">1.5초</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">대화 기록</h4>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full text-left justify-start">
              대화 내용 저장
            </Button>
            <Button variant="outline" size="sm" className="w-full text-left justify-start">
              기록 다운로드
            </Button>
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
