import { useState, useEffect } from "react";
import { Button } from "../../../components/ui";
import {
  SpeakerWaveIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import type { Participant } from "../types";

// Mock data for current question
const currentQuestion = {
  id: "1",
  type: "listening",
  audioText: "What time does the library close on weekends?",
  question: "When does the library close on weekends?",
  options: ["A. 6:00 PM", "B. 8:00 PM", "C. 9:00 PM", "D. 10:00 PM"],
  correctAnswer: "B",
};

// Mock participants data
const mockParticipants: Participant[] = [
  {
    id: "1",
    name: "김학생",
    email: "kim@test.com",
    joinedAt: "2024-01-15T09:05:00Z",
    status: "connected",
    answer: "A",
    isCorrect: false,
  },
  {
    id: "2",
    name: "이학생",
    email: "lee@test.com",
    joinedAt: "2024-01-15T09:07:00Z",
    status: "connected",
    answer: "B",
    isCorrect: true,
  },
  {
    id: "3",
    name: "박학생",
    email: "park@test.com",
    joinedAt: "2024-01-15T09:10:00Z",
    status: "connected",
    answer: null,
    isCorrect: null,
  },
  {
    id: "4",
    name: "최학생",
    email: "choi@test.com",
    joinedAt: "2024-01-15T09:12:00Z",
    status: "connected",
    answer: "C",
    isCorrect: false,
  },
  {
    id: "5",
    name: "정학생",
    email: "jung@test.com",
    joinedAt: "2024-01-15T09:15:00Z",
    status: "disconnected",
    answer: null,
    isCorrect: null,
  },
  {
    id: "6",
    name: "윤학생",
    email: "yoon@test.com",
    joinedAt: "2024-01-15T09:18:00Z",
    status: "connected",
    answer: "B",
    isCorrect: true,
  },
];

export default function TestCenterRoom() {
  const [participants] =
    useState<
      (Participant & { answer?: string | null; isCorrect?: boolean | null })[]
    >(mockParticipants);
  const [timeLeft, setTimeLeft] = useState(45); // 45 seconds left
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePlayAudio = () => {
    setIsPlaying(true);
    // Mock TTS playback
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const handleNextQuestion = () => {
    // TODO: Implement next question logic
    console.log("Moving to next question...");
  };

  const getStatusIcon = (
    participant: Participant & {
      answer?: string | null;
      isCorrect?: boolean | null;
    },
  ) => {
    if (participant.status === "disconnected") {
      return <div className="w-3 h-3 rounded-full bg-gray-400"></div>;
    }
    if (participant.answer === null) {
      return (
        <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
      );
    }
    return participant.isCorrect ? (
      <CheckCircleIcon className="w-4 h-4 text-green-500" />
    ) : (
      <XCircleIcon className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusText = (
    participant: Participant & {
      answer?: string | null;
      isCorrect?: boolean | null;
    },
  ) => {
    if (participant.status === "disconnected") return "연결끊김";
    if (participant.answer === null) return "답변중...";
    return participant.isCorrect ? "정답" : "오답";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Dedicated Test Center Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                테스트 센터로
              </Button>
              <div className="border-l border-white/20 pl-4">
                <h1 className="text-xl font-bold">영어 듣기 시험 A</h1>
                <div className="flex items-center gap-4 text-sm text-blue-100">
                  <span>문제 3/10</span>
                  <span>•</span>
                  <span>참여자 {participants.length}명</span>
                  <span>•</span>
                  <span>진행중</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                <ClockIcon className="h-4 w-4" />
                <span
                  className={`font-mono font-bold ${timeLeft <= 10 ? "text-red-200" : "text-white"}`}
                >
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </span>
                <span className="text-xs text-blue-100">남음</span>
              </div>
              <Button
                onClick={handleNextQuestion}
                disabled={timeLeft > 0}
                className="bg-white text-blue-600 hover:bg-blue-50 disabled:bg-white/20 disabled:text-white/50"
              >
                다음 문제
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold mb-4">현재 문제</h2>

                {/* Audio Control */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <Button
                    onClick={handlePlayAudio}
                    disabled={isPlaying}
                    className="flex items-center gap-2 mx-auto"
                    variant="outline"
                  >
                    <SpeakerWaveIcon
                      className={`h-5 w-5 ${isPlaying ? "animate-pulse" : ""}`}
                    />
                    {isPlaying ? "재생중..." : "음성 재생"}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    "{currentQuestion.audioText}"
                  </p>
                </div>

                {/* Question */}
                <div className="text-left">
                  <h3 className="font-medium mb-4">
                    {currentQuestion.question}
                  </h3>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          option.startsWith(currentQuestion.correctAnswer)
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Participants Panel */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                참여자 ({participants.length}명)
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`p-3 rounded-lg border transition-all ${
                      participant.status === "disconnected"
                        ? "bg-gray-50 border-gray-200 opacity-60"
                        : "bg-background border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">
                            {participant.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {participant.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {participant.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(participant)}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {getStatusText(participant)}
                      </span>
                      {participant.answer && (
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            participant.isCorrect
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          선택: {participant.answer}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">정답</p>
                    <p className="text-sm font-semibold text-green-600">
                      {participants.filter((p) => p.isCorrect === true).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">오답</p>
                    <p className="text-sm font-semibold text-red-600">
                      {participants.filter((p) => p.isCorrect === false).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">대기</p>
                    <p className="text-sm font-semibold text-yellow-600">
                      {
                        participants.filter(
                          (p) => p.answer === null && p.status === "connected",
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
