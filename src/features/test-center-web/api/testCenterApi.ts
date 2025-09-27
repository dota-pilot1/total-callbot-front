import { apiClient } from '../../../shared/api/client';
import type { TestRoom, Question } from '../types';

// 테스트 센터 룸 관련 API
export const testCenterRoomApi = {
  // 시험방 목록 조회
  getRooms: async (testType?: string, availableOnly = false): Promise<TestRoom[]> => {
    const params = new URLSearchParams();
    if (testType) params.append('testType', testType);
    if (availableOnly) params.append('availableOnly', 'true');

    const response = await apiClient.get(`/test-center/rooms?${params.toString()}`);
    return response.data;
  },

  // 시험방 상세 조회
  getRoomDetail: async (roomId: number): Promise<TestRoom> => {
    const response = await apiClient.get(`/test-center/rooms/${roomId}`);
    return response.data;
  },

  // 시험방 참가자 수 업데이트
  updateParticipants: async (roomId: number, participantCount: number): Promise<TestRoom> => {
    const response = await apiClient.put(`/test-center/rooms/${roomId}/participants`, {
      participantCount
    });
    return response.data;
  }
};

// 테스트 센터 문제 관련 API
export const testCenterQuestionApi = {
  // 특정 방의 문제 목록 조회
  getQuestions: async (roomId: number, includeInactive = false): Promise<Question[]> => {
    const params = new URLSearchParams();
    if (includeInactive) params.append('includeInactive', 'true');

    const response = await apiClient.get(`/test-center/rooms/${roomId}/questions?${params.toString()}`);
    return response.data;
  },

  // 특정 문제 조회
  getQuestion: async (roomId: number, questionId: number): Promise<Question> => {
    const response = await apiClient.get(`/test-center/rooms/${roomId}/questions/${questionId}`);
    return response.data;
  },

  // 순서로 문제 조회
  getQuestionByOrder: async (roomId: number, order: number): Promise<Question> => {
    const response = await apiClient.get(`/test-center/rooms/${roomId}/questions/order/${order}`);
    return response.data;
  },

  // 문제 통계 조회
  getQuestionStats: async (roomId: number) => {
    const response = await apiClient.get(`/test-center/rooms/${roomId}/questions/stats`);
    return response.data;
  }
};
