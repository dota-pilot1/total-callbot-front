import { useState, useEffect, useCallback } from "react";
import { chatRoomApi } from "../api/chatRoom";
import type { ChatRoom, CreateChatRoomRequest } from "../types";

export const useChatRooms = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 채팅방 목록 조회
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatRoomApi.getRooms();
      setRooms(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "채팅방 목록 조회 실패";
      setError(errorMessage);
      console.error("채팅방 목록 조회 오류:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 채팅방 생성
  const createRoom = useCallback(async (roomData: Omit<CreateChatRoomRequest, 'createdBy'>, createdBy: string) => {
    try {
      setCreating(true);
      setError(null);
      const newRoom = await chatRoomApi.createRoom({
        ...roomData,
        createdBy
      });
      setRooms(prevRooms => [...prevRooms, newRoom]);
      return newRoom;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "채팅방 생성 실패";
      setError(errorMessage);
      console.error("채팅방 생성 오류:", err);
      throw err;
    } finally {
      setCreating(false);
    }
  }, []);

  // 채팅방 삭제
  const deleteRoom = useCallback(async (roomId: string) => {
    try {
      setError(null);
      await chatRoomApi.deleteRoom(roomId);
      setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "채팅방 삭제 실패";
      setError(errorMessage);
      console.error("채팅방 삭제 오류:", err);
      throw err;
    }
  }, []);

  // 채팅방 검색
  const searchRooms = useCallback(async (keyword: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatRoomApi.searchRooms(keyword);
      setRooms(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "채팅방 검색 실패";
      setError(errorMessage);
      console.error("채팅방 검색 오류:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 채팅방 목록 조회
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    rooms,
    loading,
    creating,
    error,
    fetchRooms,
    createRoom,
    deleteRoom,
    searchRooms,
  };
};
