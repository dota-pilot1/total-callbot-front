import { useState, useCallback } from 'react';
import { chatApi } from '../../messaging/api/chat';

// 챗봇 설정 타입
interface ChatbotConfig {
  id: string;
  name: string;
}

export interface UseConnectionStateOptions {
  chatbotConfig: ChatbotConfig;
}

export interface UseConnectionStateReturn {
  // 연결 상태
  isConnected: boolean;
  isConnecting: boolean;

  // 연결 관리 함수들
  connectToChatRoom: () => Promise<void>;
  disconnect: () => void;
  ensureChatRoomConnected: () => Promise<void>;
}

/**
 * 채팅방 연결 상태 관리 훅
 *
 * 챗봇과의 채팅방 연결 상태를 관리하고, 연결/해제 기능을 제공합니다.
 * chatApi를 사용하여 채팅방 생성 및 참여를 처리합니다.
 *
 * 주요 기능:
 * - 채팅방 연결 상태 추적 (isConnected, isConnecting)
 * - 채팅방 자동 생성 및 참여
 * - 연결 실패 시 에러 처리
 * - 연결 상태 확인 및 자동 연결
 */
export const useConnectionState = (
  options: UseConnectionStateOptions
): UseConnectionStateReturn => {
  const { chatbotConfig } = options;

  // 연결 상태 관리
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  /**
   * 채팅방에 연결
   * 1. 채팅방 생성 또는 기존 채팅방 가져오기
   * 2. 채팅방 참여
   * 3. 연결 상태 업데이트
   */
  const connectToChatRoom = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);

    try {
      // 채팅방 생성 또는 기존 채팅방 가져오기
      const chatRoomData = await chatApi.getOrCreateChatRoom({
        chatbotId: chatbotConfig.id,
        chatbotName: chatbotConfig.name,
      });

      // 채팅방 참여
      await chatApi.joinChatRoom(chatRoomData.id);

      setIsConnected(true);
    } catch (error) {
      console.error('채팅방 연결 실패:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [chatbotConfig, isConnecting, isConnected]);

  /**
   * 연결 해제
   * 채팅방과의 연결을 종료하고 상태를 초기화합니다.
   */
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  /**
   * 채팅방 연결 상태 확인 및 자동 연결
   * 연결되지 않은 경우 자동으로 연결을 시도합니다.
   * ensureConnectedAndReady 함수에서 채팅방 연결 부분만 분리된 것
   */
  const ensureChatRoomConnected = useCallback(async () => {
    if (!isConnected && !isConnecting) {
      await connectToChatRoom();
    }

    // 연결이 완료될 때까지 대기
    let attempts = 0;
    const maxAttempts = 10;

    while (!isConnected && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 200));
      attempts++;
    }

    if (!isConnected) {
      throw new Error('채팅방 연결에 실패했습니다');
    }
  }, [isConnected, isConnecting, connectToChatRoom]);

  return {
    isConnected,
    isConnecting,
    connectToChatRoom,
    disconnect,
    ensureChatRoomConnected,
  };
};
