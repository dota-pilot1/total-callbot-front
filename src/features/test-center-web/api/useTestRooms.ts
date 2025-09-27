import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import type { TestRoom, TestCenterStats, TestTypeStats, CreateRoomRequest, UpdateRoomRequest } from '../types';

// API 함수들
const testCenterApi = {
  // 시험방 목록 조회
  getRooms: async (params?: { testType?: string; availableOnly?: boolean }): Promise<TestRoom[]> => {
    const searchParams = new URLSearchParams();
    if (params?.testType) searchParams.append('testType', params.testType);
    if (params?.availableOnly) searchParams.append('availableOnly', params.availableOnly.toString());

    const { data } = await apiClient.get(`/test-center/rooms?${searchParams.toString()}`);
    return data;
  },

  // 시험방 상세 조회
  getRoomDetail: async (roomId: number): Promise<TestRoom> => {
    const { data } = await apiClient.get(`/test-center/rooms/${roomId}`);
    return data;
  },

  // 시험방 생성
  createRoom: async (request: CreateRoomRequest): Promise<TestRoom> => {
    const { data } = await apiClient.post('/test-center/rooms', request);
    return data;
  },

  // 시험방 수정
  updateRoom: async (roomId: number, request: UpdateRoomRequest): Promise<TestRoom> => {
    const { data } = await apiClient.put(`/test-center/rooms/${roomId}`, request);
    return data;
  },

  // 시험방 점유
  occupyRoom: async (roomId: number, participantCount: number): Promise<TestRoom> => {
    const { data } = await apiClient.post(`/test-center/rooms/${roomId}/occupy`, { participantCount });
    return data;
  },

  // 시험방 해제
  releaseRoom: async (roomId: number): Promise<TestRoom> => {
    const { data } = await apiClient.post(`/test-center/rooms/${roomId}/release`);
    return data;
  },

  // 테스트 센터 통계
  getStats: async (): Promise<TestCenterStats> => {
    const { data } = await apiClient.get('/test-center/stats');
    return data;
  },

  // 시험 유형별 통계
  getTestTypeStats: async (): Promise<TestTypeStats[]> => {
    const { data } = await apiClient.get('/test-center/stats/test-types');
    return data;
  }
};

// React Query 훅들
export const useTestRooms = (params?: { testType?: string; availableOnly?: boolean }) => {
  return useQuery({
    queryKey: ['test-rooms', params],
    queryFn: () => testCenterApi.getRooms(params),
    staleTime: 30000, // 30초
  });
};

export const useTestRoomDetail = (roomId: number) => {
  return useQuery({
    queryKey: ['test-room', roomId],
    queryFn: () => testCenterApi.getRoomDetail(roomId),
    enabled: !!roomId,
  });
};

export const useCreateTestRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: testCenterApi.createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['test-center-stats'] });
    },
  });
};

export const useUpdateTestRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, request }: { roomId: number; request: UpdateRoomRequest }) =>
      testCenterApi.updateRoom(roomId, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['test-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['test-room', data.id] });
    },
  });
};

export const useOccupyRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, participantCount }: { roomId: number; participantCount: number }) =>
      testCenterApi.occupyRoom(roomId, participantCount),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['test-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['test-room', data.id] });
      queryClient.invalidateQueries({ queryKey: ['test-center-stats'] });
    },
  });
};

export const useReleaseRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: testCenterApi.releaseRoom,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['test-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['test-room', data.id] });
      queryClient.invalidateQueries({ queryKey: ['test-center-stats'] });
    },
  });
};

export const useTestCenterStats = () => {
  return useQuery({
    queryKey: ['test-center-stats'],
    queryFn: testCenterApi.getStats,
    staleTime: 60000, // 1분
  });
};

export const useTestTypeStats = () => {
  return useQuery({
    queryKey: ['test-type-stats'],
    queryFn: testCenterApi.getTestTypeStats,
    staleTime: 300000, // 5분
  });
};
