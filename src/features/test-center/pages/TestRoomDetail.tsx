import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTestRoomDetail } from "../api/useTestRooms";
import TestCenterHeader from "../components/TestCenterHeader";
import ExamStatusBar from "../components/ExamStatusBar";
import QuestionSection from "../components/QuestionSection";
import ChatSection from "../components/ChatSection";
import ParticipantsPanel from "../components/ParticipantsPanel";
import ParticipantsDialog from "../components/ParticipantsDialog";
import QuestionManagementDialog from "../components/QuestionManagementDialog";

// 타입 및 데이터 import
import type { AnswerSubmission } from "../types/exam";
import {
  dummyExamStatus,
  dummyQuestion,
  dummyParticipants,
  dummyChatMessages,
} from "../data/dummyData";

export default function TestRoomDetail() {
  const { roomId } = useParams<{ roomId: string }>();

  // State
  const [chatMessage, setChatMessage] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(525); // 8분 45초
  const [chatMessages, setChatMessages] = useState(dummyChatMessages);
  const [isParticipantsDialogOpen, setIsParticipantsDialogOpen] =
    useState(false);
  const [isQuestionManagementOpen, setIsQuestionManagementOpen] =
    useState(false);

  // API 훅
  const { data: room, isLoading, error } = useTestRoomDetail(Number(roomId));

  // Timer Effect
  useEffect(() => {
    if (dummyExamStatus.status === "IN_PROGRESS") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, []);

  // Utility Functions
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Event Handlers
  const handlePlayAudio = () => {
    if (isPlaying) return;

    setIsPlaying(true);

    if ("speechSynthesis" in window && dummyQuestion.audioText) {
      const utterance = new SpeechSynthesisUtterance(dummyQuestion.audioText);
      utterance.lang = "en-US";
      utterance.rate = 0.8;

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback for browsers without speech synthesis
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const submission: AnswerSubmission = {
      questionId: dummyQuestion.id,
      selectedAnswer,
      responseTime: Date.now(),
    };

    console.log("정답 제출:", submission);

    // Add system message to chat
    const systemMessage = {
      id: Date.now(),
      userName: "시스템",
      message: `문제 ${dummyQuestion.questionNumber}번 답안을 제출했습니다.`,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "system" as const,
    };

    setChatMessages((prev) => [...prev, systemMessage]);
    setSelectedAnswer("");

    // TODO: API 호출
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      userName: "나", // TODO: 실제 사용자명
      message: chatMessage.trim(),
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "chat" as const,
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setChatMessage("");

    // TODO: WebSocket으로 실시간 전송
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <TestCenterHeader title="시험방" showBackButton={true} />
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-muted-foreground">시험방에 접속 중...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !room) {
    return (
      <div className="min-h-screen bg-white">
        <TestCenterHeader title="시험방" showBackButton={true} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              시험방을 찾을 수 없습니다
            </h2>
            <p className="text-muted-foreground">
              시험방이 삭제되었거나 접근 권한이 없습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <TestCenterHeader
        title={`${room.name} - 단체 시험`}
        showBackButton={true}
        showQuestionManagementButton={true}
        showParticipantsButton={true}
        participantCount={dummyParticipants.length}
        onlineCount={
          dummyParticipants.filter((p) => p.status !== "WAITING").length
        }
        onQuestionManagement={() => setIsQuestionManagementOpen(true)}
        onParticipantsClick={() => setIsParticipantsDialogOpen(true)}
      />

      {/* Exam Status Bar */}
      <ExamStatusBar
        examStatus={dummyExamStatus}
        participants={dummyParticipants}
        timeLeft={timeLeft}
        formatTime={formatTime}
      />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-8rem)]">
        {/* Left Section - Question & Chat (4/5) */}
        <div className="flex-1 flex flex-col lg:w-4/5">
          {/* Question Section */}
          <QuestionSection
            question={dummyQuestion}
            selectedAnswer={selectedAnswer}
            isPlaying={isPlaying}
            onAnswerSelect={handleAnswerSelect}
            onPlayAudio={handlePlayAudio}
            onSubmitAnswer={handleSubmitAnswer}
          />

          {/* Chat Section */}
          <ChatSection
            messages={chatMessages}
            chatMessage={chatMessage}
            onMessageChange={setChatMessage}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Right Section - Participants (1/5) - Hidden on mobile */}
        <div className="hidden md:block lg:w-1/5">
          <ParticipantsPanel
            participants={dummyParticipants}
            examStatus={dummyExamStatus}
            roomInfo={{
              testTypeDisplayName: room.testTypeDisplayName,
              capacity: room.capacity,
              currentParticipants: room.currentParticipants,
            }}
          />
        </div>
      </div>

      {/* Mobile Participants Dialog */}
      <ParticipantsDialog
        isOpen={isParticipantsDialogOpen}
        onClose={() => setIsParticipantsDialogOpen(false)}
        participants={dummyParticipants}
        examStatus={dummyExamStatus}
        roomInfo={{
          testTypeDisplayName: room.testTypeDisplayName,
          capacity: room.capacity,
          currentParticipants: room.currentParticipants,
        }}
      />

      {/* Question Management Dialog */}
      <QuestionManagementDialog
        isOpen={isQuestionManagementOpen}
        onClose={() => setIsQuestionManagementOpen(false)}
        roomId={Number(roomId)}
        roomName={room.name}
      />
    </div>
  );
}
