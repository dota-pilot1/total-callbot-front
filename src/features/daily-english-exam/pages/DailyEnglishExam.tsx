import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from "../../../components/ui";
import { examApi } from "../../chatbot/exam/api/exam";

interface DailyScenario {
  id: string;
  title: string;
  description: string;
  category: string;
}

type MessageAuthor = "assistant" | "user" | "system";

interface ChatMessage {
  id: string;
  author: MessageAuthor;
  text: string;
}

function buildPrompts(scenario: DailyScenario) {
  const base = scenario.title;
  const detail = scenario.description;
  return [
    `Let's role-play the situation "${base}". Please open the conversation with a natural greeting and explain why you're here.`,
    `Now give specific details or ask necessary questions related to this situation. Remember: ${detail}.`,
    "Finally, wrap up politely, confirm the next step, and say goodbye in English.",
  ];
}

export default function DailyEnglishExam() {
  const navigate = useNavigate();
  const location = useLocation();

  const sessionScenario = useMemo(() => {
    const stateScenario = (location.state as { scenario?: DailyScenario })?.scenario;
    if (stateScenario) {
      sessionStorage.setItem("dailyExamScenario", JSON.stringify(stateScenario));
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

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionScenario) {
      navigate("/daily-english", { replace: true });
    }
  }, [sessionScenario, navigate]);

  const prompts = useMemo(() => {
    if (!sessionScenario) return [];
    return buildPrompts(sessionScenario);
  }, [sessionScenario]);

  useEffect(() => {
    if (isStarted && prompts.length > 0 && messages.length === 0 && sessionScenario) {
      setMessages([
        {
          id: crypto.randomUUID(),
          author: "system",
          text: "시험이 시작되었습니다. 아래 안내에 따라 영어로 답변해 주세요.",
        },
        {
          id: crypto.randomUUID(),
          author: "assistant",
          text: prompts[0],
        },
      ]);
    }
  }, [isStarted, prompts, messages.length, sessionScenario]);

  const handleStart = () => {
    setIsStarted(true);
    setStepIndex(0);
    setMessages([]);
    setError(null);
  };

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      author: "user",
      text: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    if (stepIndex < prompts.length - 1) {
      const nextPrompt = prompts[stepIndex + 1];
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        author: "assistant",
        text: nextPrompt,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStepIndex((prev) => prev + 1);
    } else {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        author: "assistant",
        text: "Great job! Feel free to review your responses or restart the test.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStepIndex(prompts.length);
    }
  };

  const handleSuggest = async () => {
    if (!isStarted || stepIndex >= prompts.length) return;
    setIsSuggesting(true);
    setError(null);
    try {
      const response = await examApi.getSampleAnswers({
        question: prompts[stepIndex],
        level: "intermediate",
        count: 1,
        englishOnly: true,
      });
      const suggestion = response.samples?.[0]?.text;
      if (suggestion) {
        setInput(suggestion);
      }
    } catch (err) {
      console.error("Failed to fetch sample answer", err);
      setError("예시 답변을 불러오지 못했습니다. 잠시 후 다시 시도하세요.");
    } finally {
      setIsSuggesting(false);
    }
  };

  if (!sessionScenario) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/daily-english")}>← 상황 다시 선택하기</Button>
          <h1 className="text-2xl font-bold text-foreground">Daily English Conversation Test</h1>
          <p className="text-sm text-muted-foreground">
            선택한 상황에 맞춰 영어 회화를 연습합니다. 아래 안내를 참고하여 단계별 요청에 영어로 답변해 보세요.
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-2">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Today&apos;s Scenario</p>
            <CardTitle>{sessionScenario.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{sessionScenario.category}</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground">{sessionScenario.description}</p>
          </CardContent>
        </Card>

        {!isStarted ? (
          <Card>
            <CardContent className="py-6 flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground text-center">
                준비가 되었다면 아래 버튼을 눌러 시험을 시작하세요. AI가 상황에 맞는 안내를 단계별로 제공합니다.
              </p>
              <Button size="lg" onClick={handleStart}>시험 시작</Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex flex-col h-[70vh]">
            <CardHeader>
              <CardTitle className="text-base">Conversation</CardTitle>
              <p className="text-xs text-muted-foreground">
                단계 {Math.min(stepIndex + 1, prompts.length)} / {prompts.length}
              </p>
            </CardHeader>
            <Separator className="mx-6" />
            <CardContent className="flex-1 overflow-y-auto space-y-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.author === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm shadow-sm ${
                      message.author === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.author === "assistant"
                          ? "bg-blue-50 text-blue-900"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </CardContent>
            <Separator className="mx-6" />
            <div className="px-6 py-4 space-y-3 border-t bg-card">
              {error && (
                <div className="rounded bg-red-50 px-3 py-2 text-xs text-red-600">
                  {error}
                </div>
              )}
              <div className="flex items-center gap-3">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="영어로 답변을 입력하세요"
                  className="flex-1 resize-none rounded border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSuggest}
                  disabled={isSuggesting || stepIndex >= prompts.length}
                >
                  {isSuggesting ? "예시 생성 중..." : "예시 답변 보기"}
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsStarted(false);
                      setMessages([]);
                      setStepIndex(0);
                      setInput("");
                      setError(null);
                    }}
                  >
                    시험 다시 시작
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSend}
                    disabled={!input.trim()}
                  >
                    전송
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
