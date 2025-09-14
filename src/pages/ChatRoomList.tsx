import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth";
import { useChatRooms, type ChatRoom } from "../features/chat-room";
import { Button } from "../components/ui";
import {
  ArrowLeftIcon,
  PlusIcon,
  UsersIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roomData: { name: string; description: string }) => void;
  loading: boolean;
}

function CreateRoomModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: CreateRoomModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), description: description.trim() });
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            새 채팅방 만들기
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="roomName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                채팅방 이름 *
              </label>
              <input
                type="text"
                id="roomName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="채팅방 이름을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={50}
                required
                autoFocus
              />
            </div>
            <div>
              <label
                htmlFor="roomDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                설명 (선택사항)
              </label>
              <textarea
                id="roomDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="채팅방에 대한 간단한 설명을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={200}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!name.trim() || loading}
              >
                {loading ? "생성 중..." : "만들기"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function RoomCard({
  room,
  onJoin,
  onDelete,
  canDelete,
}: {
  room: ChatRoom;
  onJoin: (roomId: string) => void;
  onDelete: (roomId: string) => void;
  canDelete: boolean;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}일 전`;
    } else if (hours > 0) {
      return `${hours}시간 전`;
    } else {
      return "방금 전";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate mb-1">
            {room.name}
          </h3>
          {room.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {room.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <UsersIcon className="h-4 w-4" />
            <span>
              {room.participantCount || 0}/{room.maxParticipants}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <ClockIcon className="h-4 w-4" />
            <span>{formatDate(room.createdAt)}</span>
          </div>
        </div>
        <div className="text-gray-400">by {room.createdBy}</div>
      </div>
      <div className="flex space-x-2">
        <Button
          onClick={() => onJoin(room.roomId || room.id)}
          size="sm"
          className="flex-1"
          disabled={(room.participantCount || 0) >= room.maxParticipants}
        >
          {(room.participantCount || 0) >= room.maxParticipants
            ? "가득찬"
            : "입장"}
        </Button>
        {canDelete && (
          <Button
            onClick={() => onDelete(room.id)}
            size="sm"
            variant="outline"
            className="px-2 text-red-600 border-red-300 hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ChatRoomList() {
  const navigate = useNavigate();
  const { getUser } = useAuthStore();
  const user = getUser();
  const currentUserName = user?.name || user?.email || "익명";

  // 채팅방 hooks 사용
  const {
    rooms,
    loading,
    creating,
    error,
    createRoom: createChatRoom,
    deleteRoom,
  } = useChatRooms();

  // 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // 채팅방 생성 핸들러
  const handleCreateRoom = async (roomData: {
    name: string;
    description: string;
  }) => {
    try {
      const newRoom = await createChatRoom(roomData, currentUserName);
      setCreateModalOpen(false);
      // 새로 생성된 채팅방으로 바로 이동
      navigate(`/chat/room/${newRoom.roomId || newRoom.id}`);
    } catch (error) {
      alert("채팅방 생성에 실패했습니다.");
    }
  };

  // 채팅방 삭제 핸들러
  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("정말로 이 채팅방을 삭제하시겠습니까?")) {
      return;
    }
    try {
      await deleteRoom(roomId);
      alert("채팅방이 삭제되었습니다.");
    } catch (error) {
      alert("채팅방 삭제에 실패했습니다.");
    }
  };

  // 채팅방 입장
  const joinRoom = (roomId: string) => {
    navigate(`/chat/room/${roomId}`);
  };

  // 검색 필터링 - description이 undefined일 수 있으므로 안전 체크 추가
  const filteredRooms = rooms.filter(
    (room) =>
      room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.description &&
        room.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate("/chatbots")}
              className="flex items-center space-x-1"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>뒤로</span>
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">채팅방 목록</h1>
          </div>
          <div className="flex items-center space-x-2">
            {error && <div className="text-sm text-red-600 mr-2">{error}</div>}
            <Button
              onClick={() => setCreateModalOpen(true)}
              size="sm"
              className="flex items-center space-x-1"
            >
              <PlusIcon className="h-4 w-4" />
              <span>만들기</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 검색바 */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="채팅방 이름이나 설명으로 검색..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 채팅방 목록 */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">채팅방 목록을 불러오는 중...</div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              {searchTerm
                ? "검색 결과가 없습니다"
                : "아직 생성된 채팅방이 없습니다"}
            </div>
            {!searchTerm && (
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center space-x-1"
              >
                <PlusIcon className="h-4 w-4" />
                <span>첫 번째 채팅방 만들기</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onJoin={joinRoom}
                onDelete={handleDeleteRoom}
                canDelete={room.createdBy === currentUserName}
              />
            ))}
          </div>
        )}
      </div>

      {/* 모달 */}
      <CreateRoomModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateRoom}
        loading={creating}
      />
    </div>
  );
}
