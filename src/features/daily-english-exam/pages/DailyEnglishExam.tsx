import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from "../../../components/ui";
import {
  MicrophoneIcon,
  SpeakerWaveIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { useRealtimeConversation } from "../hooks/useRealtimeConversation";

interface DailyScenario {
  id: string;
  title: string;
  description: string;
  category: string;
}

export default function DailyEnglishExam() {
  const navigate = useNavigate();
  const location = useLocation();

  const sessionScenario = useMemo(() => {
    const stateScenario = (location.state as { scenario?: DailyScenario })
      ?.scenario;
    if (stateScenario) {
      sessionStorage.setItem(
        "dailyExamScenario",
        JSON.stringify(stateScenario),
      );
      return stateScenario;
    }

    const stored = sessionStorage.getItem("dailyExamScenario");
    if (!stored) return null;
    try {
      return JSON.parse(stored) as DailyScenario;
    } catch (error) {
      console.error("Failed to parse stored scenario", error);
      return null;
    }
  }, [location.state]);

  const [conversationLog, setConversationLog] = useState<string[]>([]);
  const [isStarted, setIsStarted] = useState(false);

  // 실시간 음성 대화 훅
  const {
    isConnected,
    isRecording,
    isPlaying,
    error,
    connectionStatus,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    clearError,
  } = useRealtimeConversation({
    scenario: sessionScenario?.title || "",
    instructions: sessionScenario?.description,
  });

  useEffect(() => {
    if (!sessionScenario) {
      navigate("/daily-english", { replace: true });
    }
  }, [sessionScenario, navigate]);

  useEffect(() => {
    if (isStarted && isConnected && conversationLog.length === 0) {
      setConversationLog([
        "🎤 실시간 음성 대화가 시작되었습니다. 마이크 버튼을 눌러 말씀해 주세요.",
      ]);
    }
  }, [isStarted, isConnected, conversationLog.length]);

  const handleStart = async () => {
    try {
      setIsStarted(true);
      setConversationLog([]);
      clearError();
      await connect();
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
      setConversationLog((prev) => [...prev, "🎤 녹음 중지됨"]);
    } else {
      startRecording();
      setConversationLog((prev) => [...prev, "🎤 녹음 시작됨"]);
    }
  };

  const handleStop = async () => {
    try {
      await disconnect();
      setIsStarted(false);
      setConversationLog((prev) => [...prev, "🔚 대화가 종료되었습니다."]);
    } catch (error) {
      console.error("Failed to stop conversation:", error);
    }
  };

  if (!sessionScenario) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/daily-english")}
          >
            ← 상황 다시 선택하기
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            Daily English Conversation Test
          </h1>
          <p className="text-sm text-muted-foreground">
            실시간 음성 대화로 영어 회화를 연습합니다. GPT Real-time API를 통해
            자연스러운 대화가 가능합니다.
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-2">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              Today's Scenario
            </p>
            <CardTitle>{sessionScenario.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {sessionScenario.category}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">
              {sessionScenario.description}
            </p>
          </CardContent>
        </Card>

        {!isStarted ? (
          <Card>
            <CardContent className="py-6 flex flex-col items-center gap-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <MicrophoneIcon className="h-6 w-6" />
                  <SpeakerWaveIcon className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground">
                  실시간 음성 대화로 영어 회화를 연습하세요.
                  <br />
                  GPT Real-time API를 통해 자연스러운 대화가 가능합니다.
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleStart}
                disabled={connectionStatus === "connecting"}
                className="min-w-[140px]"
              >
                {connectionStatus === "connecting"
                  ? "연결 중..."
                  : "🎤 대화 시작"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col h-[70vh]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <SpeakerWaveIcon className="h-5 w-5" />
                실시간 음성 대화
              </CardTitle>
              <div className="flex items-center gap-2 text-xs">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connectionStatus === "connected"
                      ? "bg-green-500"
                      : connectionStatus === "connecting"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
                <span className="text-muted-foreground">
                  {connectionStatus === "connected"
                    ? "연결됨"
                    : connectionStatus === "connecting"
                      ? "연결 중..."
                      : "연결 끊김"}
                </span>
              </div>
            </CardHeader>
            <Separator className="mx-6" />
            <CardContent className="flex-1 overflow-y-auto space-y-4 py-4">
              {conversationLog.map((log, index) => (
                <div key={index} className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-4 py-2 text-sm shadow-sm bg-muted text-muted-foreground">
                    {log}
                  </div>
                </div>
              ))}
            </CardContent>
            <Separator className="mx-6" />
            <div className="px-6 py-4 space-y-3 border-t bg-card">
              {error && (
                <div className="rounded bg-red-50 px-3 py-2 text-xs text-red-600 flex items-center justify-between">
                  <span>{error}</span>
                  <Button variant="ghost" size="sm" onClick={clearError}>
                    ×
                  </Button>
                </div>
              )}

              {/* 음성 컨트롤 */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  size="lg"
                  onClick={handleMicClick}
                  disabled={!isConnected || isPlaying}
                  className="w-16 h-16 rounded-full"
                >
                  {isRecording ? (
                    <StopIcon className="h-8 w-8" />
                  ) : (
                    <MicrophoneIcon className="h-8 w-8" />
                  )}
                </Button>

                {isPlaying && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <SpeakerWaveIcon className="h-4 w-4 animate-pulse" />
                    <span>AI 응답 중...</span>
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  {isRecording
                    ? "🎤 말씀하고 계시면 버튼을 눌러 중지하세요"
                    : "🎤 마이크 버튼을 눌러 말씀해 주세요"}
                </p>

                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleStop}
                    disabled={!isStarted}
                  >
                    대화 종료
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleStop().then(() => {
                        setConversationLog([]);
                      });
                    }}
                    disabled={!isStarted}
                  >
                    다시 시작
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
