import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTestRooms, useTestCenterStats } from "../api/useTestRooms";
import TestCenterHeader from "../components/TestCenterHeader";
import { Button } from "../../../components/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui";
import { Input } from "../../../components/ui/input";
import {
  FunnelIcon,
  ArrowPathIcon,
  ChartBarIcon,
  PlusIcon,
  PlayIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

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
    navigate(`/test-center-web/room/${roomId}`);
  };

  const handleCreateRoom = () => {
    navigate("/test-center-web/create");
  };

  // 검색 및 필터링된 룸
  const filteredRooms = rooms.filter((room) => {
    if (searchKeyword) {
      return (
        room.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TestCenterHeader />
        <div className="max-w-7xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TestCenterHeader />
        <div className="max-w-7xl mx-auto p-6">
          <Card>
            <CardContent className="p-8 text-center">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <TestCenterHeader />

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* 상단 헤더 및 액션 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">테스트 센터</h1>
            <p className="text-gray-600 mt-1">
              실시간 문제 풀이 및 토론에 참여하세요
            </p>
          </div>
          <Button
            onClick={handleCreateRoom}
            className="flex items-center gap-2 px-6 py-3"
          >
            <PlusIcon className="h-5 w-5" />새 룸 만들기
          </Button>
        </div>

        {/* 통계 대시보드 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">활성 룸</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.activeRooms ?? stats.totalActiveRooms ?? 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      총 참여자
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.totalParticipants ??
                        rooms.reduce(
                          (sum, room) => sum + room.currentParticipants,
                          0,
                        )}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <UserGroupIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      오늘 생성된 룸
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.todayRooms || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <AcademicCapIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      평균 참여 시간
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.avgParticipationTime || "15"}분
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <ClockIcon className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 필터 및 검색 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FunnelIcon className="h-5 w-5" />
              필터 및 검색
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 검색 */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium mb-2">
                  룸 검색
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="룸 이름 또는 설명 검색..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" className="px-3">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 시험 유형 필터 */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium mb-2">
                  시험 유형
                </label>
                <select
                  value={selectedTestType}
                  onChange={(e) => setSelectedTestType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {testTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 추가 옵션 */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium mb-2">옵션</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="available-only"
                      checked={showAvailableOnly}
                      onChange={(e) => setShowAvailableOnly(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="available-only" className="text-sm">
                      참여 가능한 룸만 보기
                    </label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="flex items-center gap-2"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    새로고침
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 룸 목록 */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              테스트 룸 ({filteredRooms.length}개)
            </h2>
          </div>

          {filteredRooms.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                  <AcademicCapIcon className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchKeyword
                    ? "검색 결과가 없습니다"
                    : "참여할 수 있는 테스트 룸이 없습니다"}
                </h3>
                <p className="text-gray-500 mb-6">
                  새로운 테스트 룸을 만들어 다른 사용자들과 함께 학습해보세요.
                </p>
                <Button
                  onClick={handleCreateRoom}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />새 룸 만들기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => {
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
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold truncate">
                            {room.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(normalizedStatus)}`}
                            >
                              {getStatusText(normalizedStatus)}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getTestTypeColor(room.testType)}`}
                            >
                              {testTypeOptions.find(
                                (t) => t.value === room.testType,
                              )?.label || room.testType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {room.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {room.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
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

                        <Button
                          onClick={() => handleEnterRoom(room.id)}
                          disabled={room.currentParticipants >= maxParticipants}
                          className="w-full flex items-center justify-center gap-2"
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
