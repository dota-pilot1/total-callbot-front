import { useState } from 'react';
import { getRandomExamTopic, buildExamPrompt } from '../lib/examUtils';

// 음성 연결 타입 (useVoiceConnection에서 반환되는 타입)
interface VoiceConnection {
  dc: RTCDataChannel | null;
}

export interface UseExamModeOptions {
  // 의존성들
  voiceConnection?: VoiceConnection | null;
  selectedVoice: string;
  onAddAssistantMessage: (message: string) => void;
  ensureConnectedAndReady: () => Promise<void>;
}

export interface UseExamModeReturn {
  examSending: boolean;
  triggerExam: () => Promise<void>;
}

/**
 * 시험 모드 관리 훅
 *
 * OpenAI Realtime API를 통한 모의 면접/시험 세션을 시작하는 기능을 관리합니다.
 * 랜덤 시험 주제 선택 → 프롬프트 생성 → 음성 연결을 통한 AI 지시 전송
 */
export const useExamMode = (options: UseExamModeOptions): UseExamModeReturn => {
  const {
    voiceConnection,
    selectedVoice,
    onAddAssistantMessage,
    ensureConnectedAndReady,
  } = options;

  // 시험 전송 중 상태
  const [examSending, setExamSending] = useState(false);

  /**
   * 시험 모드 시작
   * 1. 연결 상태 확인 및 준비
   * 2. 랜덤 시험 주제 선택
   * 3. 시험 안내 메시지 표시
   * 4. OpenAI Realtime API로 시험 지시 전송
   */
  const triggerExam = async () => {
    // 이미 전송 중이면 중복 실행 방지
    if (examSending) return;

    setExamSending(true);

    try {
      // 1. 연결 상태 확인 및 준비
      await ensureConnectedAndReady();
    } catch (e) {
      alert(
        '연결에 실패했습니다. 마이크 권한 또는 네트워크 상태를 확인해주세요.'
      );
      setExamSending(false);
      return;
    }

    // 2. 랜덤 시험 주제 선택 및 프롬프트 생성
    const topic = getRandomExamTopic();
    const prompt = buildExamPrompt(topic);

    try {
      // 3. 사용자에게 시험 안내 메시지 표시
      onAddAssistantMessage(
        `이번 시험 주제: ${topic.ko}\n총 5문항으로 진행됩니다.`
      );
    } catch (error) {
      console.warn('시험 안내 메시지 표시 실패:', error);
    }

    try {
      // 4. OpenAI Realtime API를 통한 시험 지시 전송
      if (!voiceConnection?.dc || voiceConnection.dc.readyState !== 'open') {
        throw new Error('음성 연결이 준비되지 않았습니다');
      }

      // 대화 컨텍스트에 시험 지시사항 추가
      voiceConnection.dc.send(
        JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: prompt }],
          },
        })
      );

      // AI 응답 요청 (오디오 + 텍스트)
      voiceConnection.dc.send(
        JSON.stringify({
          type: 'response.create',
          response: {
            modalities: ['audio', 'text'],
            conversation: 'auto',
            voice: selectedVoice,
          },
        })
      );
    } catch (error) {
      console.error('Exam 트리거 실패:', error);
      alert('Exam 지시를 전송하지 못했습니다. 다시 시도해주세요.');
    } finally {
      setExamSending(false);
    }
  };

  return {
    examSending,
    triggerExam,
  };
};
