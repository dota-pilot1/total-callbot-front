import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import {
  UserGroupIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import TestCenterHeader from "../components/TestCenterHeader";

// Mock data - 실제로는 API에서 가져와야 합니다
interface TestRoom {
  id: number;
  name: string;
  description: string;
  status: "ACTIVE" | "WAITING" | "COMPLETED";
  testType: string;
  currentParticipants: number;
  maxParticipants: number;
  creator: string;
  createdAt: string;
  currentQuestion?: {
    id: number;
    questionNumber: number;
    content: string;
    options: string[];
    correctAnswer?: string;
    timeLimit: number;
    timeRemaining: number;
  };
  participants: Array<{
    id: number;
    name: string;
    score: number;
    isOnline: boolean;
    joinedAt: string;
  }>;
  chat: Array<{
    id: number;
    user: string;
    message: string;
    timestamp: string;
  }>;
}

const mockRoom: TestRoom = {
  id: 1,
  name: "영어 회화 기초 테스트",
  description: "일상 영어 회화 실력을 테스트해보세요",
  status: "ACTIVE",
  testType: "ENGLISH_CONVERSATION",
  currentParticipants: 3,
  maxParticipants: 5,
  creator: "김선생",
  createdAt: "2024-01-15T09:00:00Z",
  currentQuestion: {
    id: 1,
    questionNumber: 1,
    content:
      "다음 상황에서 가장 적절한 영어 표현은? 처음 만나는 사람에게 인사할 때 사용하는 표현을 선택하세요.",
    options: [
      "How are you doing?",
      "What's up?",
      "Nice to meet you",
      "See you later",
    ],
    timeLimit: 60,
    timeRemaining: 45,
  },
  participants: [
    { id: 1, name: "김학생", score: 85, isOnline: true, joinedAt: "10:00" },
    { id: 2, name: "이학생", score: 92, isOnline: true, joinedAt: "10:02" },
    { id: 3, name: "박학생", score: 78, isOnline: false, joinedAt: "10:01" },
    { id: 4, name: "정학생", score: 91, isOnline: true, joinedAt: "10:03" },
  ],
  chat: [
    { id: 1, user: "김학생", message: "문제가 어렵네요", timestamp: "10:05" },
    { id: 2, user: "이학생", message: "화이팅!", timestamp: "10:06" },
    { id: 3, user: "정학생", message: "좋은 문제네요", timestamp: "10:07" },
    {
      id: 4,
      user: "김학생",
      message: "다들 잘하시는 것 같아요",
      timestamp: "10:08",
    },
  ],
};

export default function TestRoomDetail() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const numericRoomId = roomId ? Number(roomId) : mockRoom.id;
  const [room] = useState<TestRoom>({ ...mockRoom, id: numericRoomId });
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [chatMessage, setChatMessage] = useState("");
  const [isTestActive, setIsTestActive] = useState(true);

  const handleBack = () => {
    navigate("/test-center-web");
  };

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;
    // API 호출하여 답안 제출
    console.log("답안 제출:", selectedAnswer);
    setSelectedAnswer("");
  };

  const handleChatSend = () => {
    if (!chatMessage.trim()) return;
    // API 호출하여 채팅 메시지 전송
    console.log("채팅 전송:", chatMessage);
    setChatMessage("");
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <TestCenterHeader
        title={roomId ? `${room.name} (#${roomId})` : room.name}
        showBackButton
        onBack={handleBack}
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* 상단 룸 정보 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
              <p className="text-gray-600 mt-1">{room.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={getStatusColor(room.status)}>
                {getStatusText(room.status)}
              </Badge>
              <Button variant="outline" className="flex items-center gap-2">
                <ShareIcon className="h-4 w-4" />
                공유
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <CogIcon className="h-4 w-4" />
                설정
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <UserGroupIcon className="h-4 w-4" />
              <span>
                참여자: {room.currentParticipants}/{room.maxParticipants}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <AcademicCapIcon className="h-4 w-4" />
              <span>
                진행률: {room.currentQuestion?.questionNumber || 0}/10
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span>
                남은 시간: {room.currentQuestion?.timeRemaining || 0}초
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 현재 문제 */}
            {room.currentQuestion && isTestActive && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">
                      문제 {room.currentQuestion.questionNumber}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-lg font-semibold text-orange-600">
                      <ClockIcon className="h-5 w-5" />
                      <span>{room.currentQuestion.timeRemaining}초</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <p className="text-lg leading-relaxed">
                      {room.currentQuestion.content}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {room.currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedAnswer(option)}
                        className={`p-4 text-left rounded-lg border-2 transition-all ${
                          selectedAnswer === option
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                              selectedAnswer === option
                                ? "border-blue-500 bg-blue-500 text-white"
                                : "border-gray-300 text-gray-500"
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-base">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleAnswerSubmit}
                      disabled={!selectedAnswer}
                      className="flex-1 flex items-center justify-center gap-2 py-3"
                      size="lg"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      답안 제출
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedAnswer("")}
                      className="px-6"
                    >
                      선택 취소
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 테스트 완료 또는 대기 상태 */}
            {!isTestActive && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    테스트가 종료되었습니다
                  </h3>
                  <p className="text-gray-600 mb-6">
                    결과를 확인하고 다른 테스트에도 참여해보세요.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={handleBack}>목록으로 돌아가기</Button>
                    <Button variant="outline">결과 보기</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 참여자 목록 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  참여자 ({room.participants.length}명)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {room.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            participant.isOnline
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm">
                            {participant.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            참여: {participant.joinedAt}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {participant.score}점
                        </p>
                        <p className="text-xs text-gray-500">점수</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 실시간 채팅 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  실시간 채팅
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-64 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg">
                  {room.chat.map((message) => (
                    <div key={message.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-blue-600">
                          {message.user}
                        </span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 bg-white p-2 rounded">
                        {message.message}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
                  />
                  <Button onClick={handleChatSend}>전송</Button>
                </div>
              </CardContent>
            </Card>

            {/* 룸 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">룸 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-600">생성자</p>
                  <p className="font-medium">{room.creator}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">생성일</p>
                  <p className="font-medium">
                    {new Date(room.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">테스트 유형</p>
                  <p className="font-medium">{room.testType}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 mt-4"
                  onClick={() => setIsTestActive(false)}
                >
                  <XCircleIcon className="h-4 w-4" />룸 나가기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
