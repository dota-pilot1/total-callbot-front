import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTestRooms, useTestCenterStats } from "../api/useTestRooms";
import RoomCard from "../components/RoomCard";
import CreateRoomModal from "../components/CreateRoomModal";
import TestCenterHeader from "../components/TestCenterHeader";
import QuestionManagementDialog from "../components/QuestionManagementDialog";

import { Button } from "../../../components/ui";
import {
  FunnelIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
const testTypeOptions = [
  { value: "", label: "전체" },
  { value: "ENGLISH_CONVERSATION", label: "영어 회화" },
  { value: "ENGLISH_LISTENING", label: "영어 듣기" },
  { value: "ENGLISH_VOCABULARY", label: "영어 단어" },
  { value: "MATHEMATICS", label: "수학" },
];

export default function TestCenter() {
  const navigate = useNavigate();
  const [selectedTestType, setSelectedTestType] = useState<string>("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isQuestionManagementOpen, setIsQuestionManagementOpen] =
    useState(false);
  const [selectedRoomForQuestions, setSelectedRoomForQuestions] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // API 훅들
  const {
    data: rooms = [],
    isLoading,
    error,
    refetch,
  } = useTestRooms({
    testType: selectedTestType || undefined,
    availableOnly: showAvailableOnly,
  });

  const { data: stats } = useTestCenterStats();

  const handleEnterRoom = (roomId: number) => {
    navigate(`/test-center/room/${roomId}`);
  };

  const handleManageRoom = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      setSelectedRoomForQuestions({ id: room.id, name: room.name });
      setIsQuestionManagementOpen(true);
    }
  };

  const handleCreateRoom = () => {
    setIsCreateModalOpen(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            오류가 발생했습니다
          </h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error
              ? error.message
              : "시험방 목록을 불러올 수 없습니다"}
          </p>
          <Button onClick={() => refetch()}>다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <TestCenterHeader
        showCreateButton={true}
        onCreateRoom={handleCreateRoom}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Description */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            다양한 시험을 위한 온라인 시험방을 이용하세요
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
            <div className="bg-background border border-border rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    전체
                  </p>
                  <p className="text-lg sm:text-2xl font-semibold text-foreground">
                    {stats.totalActiveRooms}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-background border border-border rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    사용 가능
                  </p>
                  <p className="text-lg sm:text-2xl font-semibold text-green-600">
                    {stats.totalAvailableRooms}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-background border border-border rounded-lg p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    사용 중
                  </p>
                  <p className="text-lg sm:text-2xl font-semibold text-red-600">
                    {stats.totalOccupiedRooms}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <FunnelIcon className="w-5 h-5 text-muted-foreground" />
            <select
              value={selectedTestType}
              onChange={(e) => setSelectedTestType(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {testTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="rounded border-border text-primary focus:ring-ring"
              />
              사용 가능한 방만 보기
            </label>
          </div>

          <div className="text-sm text-muted-foreground">
            총 {rooms.length}개의 시험방
          </div>
        </div>

        {/* Room Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              시험방 목록을 불러오는 중...
            </div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {showAvailableOnly || selectedTestType
                ? "조건에 맞는 시험방이 없습니다"
                : "아직 생성된 시험방이 없습니다"}
            </div>
            {!showAvailableOnly && !selectedTestType && (
              <Button onClick={handleCreateRoom}>첫 번째 시험방 만들기</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onEnter={handleEnterRoom}
                onManage={handleManageRoom}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Question Management Dialog */}
      <QuestionManagementDialog
        isOpen={isQuestionManagementOpen && selectedRoomForQuestions !== null}
        onClose={() => {
          setIsQuestionManagementOpen(false);
          setSelectedRoomForQuestions(null);
        }}
        roomId={selectedRoomForQuestions?.id || 0}
        roomName={selectedRoomForQuestions?.name || ""}
      />
    </div>
  );
}
