import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatApi } from "../features/chatbot/messaging/api/chat";
import type { ChatRoom } from "../shared/api/chat-types";

const ChatRoomList: React.FC = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadChatRooms();
  }, []);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const rooms = await chatApi.getChatRooms();
      setChatRooms(rooms);
    } catch (err) {
      setError("채팅방 목록을 불러오는데 실패했습니다.");
      console.error("Error loading chat rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = async (chatRoom: ChatRoom) => {
    try {
      // 채팅방 참여
      await chatApi.joinChatRoom(chatRoom.id);
      // 채팅방으로 이동
      navigate(`/chat/${chatRoom.id}`);
    } catch (err) {
      setError("채팅방 입장에 실패했습니다.");
      console.error("Error joining chat room:", err);
    }
  };

  const handleCreateNewRoom = () => {
    navigate("/chatbots");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">채팅방 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">내 채팅방</h1>
              <button
                onClick={handleCreateNewRoom}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                새 채팅방 만들기
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Chat Room List */}
          <div className="divide-y divide-gray-200">
            {chatRooms.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  아직 채팅방이 없습니다
                </h3>
                <p className="text-gray-500 mb-6">
                  새로운 챗봇과 대화를 시작해보세요!
                </p>
                <button
                  onClick={handleCreateNewRoom}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  첫 채팅방 만들기
                </button>
              </div>
            ) : (
              chatRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleRoomSelect(room)}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {room.name || `채팅방 ${room.id}`}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {room.botType && `${room.botType} 봇`}
                          {room.lastMessageAt &&
                            ` • 마지막 활동: ${new Date(room.lastMessageAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomList;
