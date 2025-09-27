import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import {
  PlayIcon,
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useTestRooms, useTestCenterStats } from "../api/useTestRooms";
import TestCenterHeader from "../components/TestCenterHeader";

const testTypeOptions = [
  { value: "", label: "전체" },
  { value: "ENGLISH_CONVERSATION", label: "영어 회화" },
  { value: "ENGLISH_LISTENING", label: "영어 듣기" },
  { value: "ENGLISH_VOCABULARY", label: "영어 단어" },
  { value: "MATHEMATICS", label: "수학" },
];

const getTestTypeColor = (testType: string) => {
  switch (testType) {
    case "ENGLISH_CONVERSATION":
      return "bg-blue-100 text-blue-800";
    case "ENGLISH_LISTENING":
      return "bg-green-100 text-green-800";
    case "ENGLISH_VOCABULARY":
      return "bg-purple-100 text-purple-800";
    case "MATHEMATICS":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "WAITING":
      return "bg-yellow-100 text-yellow-800";
    case "COMPLETED":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return "진행중";
    case "WAITING":
      return "대기중";
    case "COMPLETED":
      return "종료";
    default:
      return "알 수 없음";
  }
};

export default function TestCenter() {
  const navigate = useNavigate();
  const [selectedTestType, setSelectedTestType] = useState<string>("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);

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
    navigate(`/test-center-mobile/room/${roomId}`);
  };

  const handleCreateRoom = () => {
    navigate("/test-center-mobile/create");
  };

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };

  const handleDifficultyChange = (testType: string) => {
    setSelectedTestType(testType);
    setIsSearching(false);
    setSearchKeyword("");
  };

  // 현재 표시할 룸 데이터 결정
  const getCurrentRooms = () => {
    if (isSearching && searchKeyword.length > 0) {
      return rooms.filter(
        (room) =>
          room.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          room.description?.toLowerCase().includes(searchKeyword.toLowerCase()),
      );
    }
    return rooms;
  };

  const currentRooms = getCurrentRooms();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TestCenterHeader />
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TestCenterHeader />
        <div className="p-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">
                데이터를 불러오는 중 오류가 발생했습니다.
              </p>
              <Button onClick={() => refetch()}>다시 시도</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const activeRoomCount = stats?.activeRooms ?? stats?.totalActiveRooms ?? 0;
  const participantCount =
    stats?.totalParticipants ??
    rooms.reduce((sum, room) => sum + room.currentParticipants, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <TestCenterHeader />

      <div className="p-4 space-y-6">
        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-2">
                  <ChartBarIcon className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1">활성 룸</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeRoomCount}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mx-auto mb-2">
                  <UserGroupIcon className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1">총 참여자</p>
                <p className="text-2xl font-bold text-gray-900">
                  {participantCount}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <Button
            onClick={handleCreateRoom}
            className="flex-1 flex items-center justify-center gap-2 h-12"
          >
            <PlusIcon className="h-5 w-5" />새 룸 만들기
          </Button>
        </div>

        {/* 검색 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">테스트 룸 검색</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="룸 이름으로 검색..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* 시험 유형 필터 */}
            <div>
              <p className="text-sm font-medium mb-2">시험 유형</p>
              <div className="flex flex-wrap gap-2">
                {testTypeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      selectedTestType === option.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleDifficultyChange(option.value)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 필터 옵션 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available-only"
                checked={showAvailableOnly}
                onChange={(e) => setShowAvailableOnly(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="available-only" className="text-sm text-gray-600">
                참여 가능한 룸만 보기
              </label>
            </div>
          </CardContent>
        </Card>

        {/* 룸 목록 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isSearching && searchKeyword
                ? `"${searchKeyword}" 검색 결과`
                : "테스트 룸"}
            </h2>
            <span className="text-sm text-gray-500">
              {currentRooms.length}개의 룸
            </span>
          </div>

          {currentRooms.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                  <AcademicCapIcon className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-gray-500 mb-4">
                  {isSearching
                    ? "검색 결과가 없습니다."
                    : "참여할 수 있는 테스트 룸이 없습니다."}
                </p>
                <Button
                  onClick={handleCreateRoom}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />새 룸 만들기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {currentRooms.map((room) => {
                const normalizedStatus =
                  room.status ??
                  (room.isActive
                    ? "ACTIVE"
                    : room.isAvailable
                    ? "WAITING"
                    : "COMPLETED");
                const maxParticipants = room.maxParticipants ?? room.capacity;

                return (
                  <Card
                    key={room.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold truncate">
                          {room.name}
                        </CardTitle>
                        {room.description && (
                          <CardDescription className="text-sm mt-1 line-clamp-2">
                            {room.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge
                        className={`ml-2 text-xs ${getStatusColor(normalizedStatus)}`}
                      >
                        {getStatusText(normalizedStatus)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* 메타 정보 */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <UserGroupIcon className="h-4 w-4" />
                            <span>
                              {room.currentParticipants}/{maxParticipants}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>30분</span>
                          </div>
                        </div>
                        <Badge
                          className={`text-xs ${getTestTypeColor(room.testType)}`}
                        >
                          {testTypeOptions.find(
                            (t) => t.value === room.testType,
                          )?.label || room.testType}
                        </Badge>
                      </div>

                      {/* 입장 버튼 */}
                      <Button
                        onClick={() => handleEnterRoom(room.id)}
                        disabled={room.currentParticipants >= maxParticipants}
                        className="w-full flex items-center justify-center gap-2"
                        size="sm"
                      >
                        <PlayIcon className="h-4 w-4" />
                        {room.currentParticipants >= maxParticipants
                          ? "정원 마감"
                          : "입장하기"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
