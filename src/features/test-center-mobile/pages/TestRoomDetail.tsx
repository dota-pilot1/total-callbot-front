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
import {
  UserGroupIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
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
    content: "다음 상황에서 가장 적절한 영어 표현은?",
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
    { id: 1, name: "김학생", score: 85, isOnline: true },
    { id: 2, name: "이학생", score: 92, isOnline: true },
    { id: 3, name: "박학생", score: 78, isOnline: false },
  ],
  chat: [
    { id: 1, user: "김학생", message: "문제가 어렵네요", timestamp: "10:05" },
    { id: 2, user: "이학생", message: "화이팅!", timestamp: "10:06" },
  ],
};

export default function TestRoomDetail() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const numericRoomId = roomId ? Number(roomId) : mockRoom.id;
  const [room] = useState<TestRoom>({ ...mockRoom, id: numericRoomId });
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isTestActive, setIsTestActive] = useState(true);

  const handleBack = () => {
    navigate("/test-center-mobile");
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

      <div className="p-4 space-y-4">
        {/* 룸 정보 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg">{room.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{room.description}</p>
              </div>
              <Badge className={getStatusColor(room.status)}>
                {getStatusText(room.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <UserGroupIcon className="h-4 w-4" />
                  <span>
                    {room.currentParticipants}/{room.maxParticipants}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <AcademicCapIcon className="h-4 w-4" />
                  <span>
                    문제 {room.currentQuestion?.questionNumber || 0}/10
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                <span>{room.currentQuestion?.timeRemaining || 0}초</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 현재 문제 */}
        {room.currentQuestion && isTestActive && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>문제 {room.currentQuestion.questionNumber}</span>
                <div className="flex items-center gap-1 text-sm text-orange-600">
                  <ClockIcon className="h-4 w-4" />
                  <span>{room.currentQuestion.timeRemaining}초</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base font-medium">
                {room.currentQuestion.content}
              </p>

              <div className="space-y-2">
                {room.currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(option)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedAnswer === option
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                          selectedAnswer === option
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-gray-300 text-gray-500"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-sm">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              <Button
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer}
                className="w-full flex items-center justify-center gap-2"
              >
                <CheckCircleIcon className="h-4 w-4" />
                답안 제출
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 참여자 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              참여자 ({room.participants.length}명)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {room.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        participant.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {participant.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {participant.score}점
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 채팅 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>채팅</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className="p-1"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          {showChat && (
            <CardContent className="space-y-3">
              <div className="max-h-32 overflow-y-auto space-y-2">
                {room.chat.map((message) => (
                  <div key={message.id} className="text-sm">
                    <span className="font-medium text-blue-600">
                      {message.user}
                    </span>
                    <span className="text-gray-500 ml-2">
                      {message.timestamp}
                    </span>
                    <p className="text-gray-700 mt-1">{message.message}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                  onKeyPress={(e) => e.key === "Enter" && handleChatSend()}
                />
                <Button size="sm" onClick={handleChatSend}>
                  전송
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* 하단 고정 액션 바 */}
      {isTestActive && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => setShowChat(!showChat)}
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              채팅
            </Button>
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => setIsTestActive(false)}
            >
              <XCircleIcon className="h-4 w-4" />
              나가기
            </Button>
          </div>
        </div>
      )}

      {/* 모바일에서 하단 여백 확보 */}
      <div className="h-20"></div>
    </div>
  );
}
