import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpenIcon,
  AcademicCapIcon,
  TrophyIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../components/ui";
import { HeaderAuthControls } from "../components/layout/HeaderAuthControls";

type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

type ReadingTestData = {
  id: number;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  totalQuestions: number;
  timeLimitMinutes: number;
};

type ReadingQuestion = {
  passage: string;
  question: string;
  options: string[];
  correct: number;
};

type ReadingTestListProps = {
  onStartTest: (testId: number) => void;
};

type ReadingTestProps = {
  testId: number;
  onBack: () => void;
};

// --- Mock Data --- //
const mockTests: ReadingTestData[] = [
  {
    id: 1,
    title: "The History of Computers",
    description: "A brief look at the evolution of computing.",
    difficulty: "BEGINNER",
    totalQuestions: 5,
    timeLimitMinutes: 10,
  },
  {
    id: 2,
    title: "The Impact of AI on Society",
    description:
      "Exploring the societal changes brought by artificial intelligence.",
    difficulty: "INTERMEDIATE",
    totalQuestions: 8,
    timeLimitMinutes: 15,
  },
  {
    id: 3,
    title: "Quantum Physics Explained",
    description: "A deep dive into the complex world of quantum mechanics.",
    difficulty: "ADVANCED",
    totalQuestions: 10,
    timeLimitMinutes: 20,
  },
];

const mockQuestions: Record<number, ReadingQuestion[]> = {
  1: [
    {
      passage:
        "The first computer was invented in the 1940s. It was a large machine that took up an entire room.",
      question: "When was the first computer invented?",
      options: ["1930s", "1940s", "1950s", "1960s"],
      correct: 1,
    },
    {
      passage:
        "Computers have become much smaller and more powerful over time.",
      question: "How have computers changed over time?",
      options: [
        "They have become larger",
        "They have become less powerful",
        "They have become smaller and more powerful",
        "They have not changed",
      ],
      correct: 2,
    },
  ],
  2: [
    {
      passage:
        "AI is transforming many industries, from healthcare to transportation.",
      question: "Which industries is AI transforming?",
      options: [
        "Only healthcare",
        "Only transportation",
        "Healthcare and transportation",
        "No industries",
      ],
      correct: 2,
    },
  ],
  3: [
    {
      passage:
        "Quantum physics is the study of matter and energy at the most fundamental level.",
      question: "What is quantum physics?",
      options: [
        "The study of large objects",
        "The study of matter and energy at the most fundamental level",
        "The study of space",
        "The study of time",
      ],
      correct: 1,
    },
  ],
};

// --- Helper Components --- //

const ReadingHeader = ({
  timeLeft,
  onBack,
}: {
  timeLeft?: number;
  onBack?: () => void;
}) => (
  <header className="bg-card border-b border-border">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        <h1 className="text-lg font-semibold text-foreground">
          Interval English Reading
        </h1>
        <div className="flex items-center gap-4">
          {onBack ? (
            <Button variant="outline" onClick={onBack}>
              Exit
            </Button>
          ) : null}
          {typeof timeLeft === "number" ? (
            <span className="text-lg font-semibold">
              {Math.floor(timeLeft / 60)}:{("0" + (timeLeft % 60)).slice(-2)}
            </span>
          ) : null}
          <HeaderAuthControls />
        </div>
      </div>
    </div>
  </header>
);

// --- Main Component --- //

export default function IntervalEnglishReadingPage() {
  const [activeTestId, setActiveTestId] = useState<number | null>(null);

  if (activeTestId === null) {
    return (
      <ReadingTestList onStartTest={(testId) => setActiveTestId(testId)} />
    );
  }

  return (
    <ReadingTest testId={activeTestId} onBack={() => setActiveTestId(null)} />
  );
}

const ReadingTestList = ({ onStartTest }: ReadingTestListProps) => {
  const navigate = useNavigate();
  const difficultyLabels: Record<DifficultyLevel, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
  };

  return (
    <div className="min-h-screen bg-background">
      <ReadingHeader />
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              English Practice
            </h2>
            <p className="text-muted-foreground">
              Choose your practice type and start learning.
            </p>
          </div>

          {/* Practice Type Selection */}
          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <BookOpenIcon className="h-8 w-8" />
                <h3 className="text-xl font-semibold text-foreground">
                  Interval Reading
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Improve your reading comprehension with timed interval reading
                exercises.
              </p>
              <Button
                className="w-full"
                onClick={() => navigate("/interval-english-reading-mobile")}
              >
                Start Reading Practice
              </Button>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <SpeakerWaveIcon className="h-8 w-8" />
                <h3 className="text-xl font-semibold text-foreground">
                  Interval Listening
                </h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Enhance your listening skills with interactive audio exercises
                and TTS practice.
              </p>
              <Button
                className="w-full"
                onClick={() => navigate("/interval-listening")}
              >
                Start Listening Practice
              </Button>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Reading Tests (Demo)
            </h2>
            <p className="text-muted-foreground">
              Try these sample reading comprehension tests.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {mockTests.map((test) => (
              <div
                key={test.id}
                className="rounded-lg border bg-card p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2 text-primary">
                    <BookOpenIcon className="h-6 w-6" />
                    <h3 className="text-xl font-semibold text-foreground">
                      {test.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {test.description}
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <AcademicCapIcon className="h-4 w-4" />
                      <span>
                        Difficulty: {difficultyLabels[test.difficulty]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrophyIcon className="h-4 w-4" />
                      <span>{test.totalQuestions} questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpenIcon className="h-4 w-4" />
                      <span>{test.timeLimitMinutes} minute time limit</span>
                    </div>
                  </div>
                </div>
                <Button className="mt-6" onClick={() => onStartTest(test.id)}>
                  Start Test
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Test View --- //

const ReadingTest = ({ testId, onBack }: ReadingTestProps) => {
  const questions = mockQuestions[testId] ?? [];
  const testDetails = mockTests.find((test) => test.id === testId);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(
    () => (testDetails?.timeLimitMinutes ?? 10) * 60,
  );

  useEffect(() => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setTimeLeft((testDetails?.timeLimitMinutes ?? 10) * 60);
  }, [testId, testDetails?.timeLimitMinutes]);

  useEffect(() => {
    if (showResult) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResult]);

  const question = questions[currentQuestion];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (!question) {
      return;
    }
    if (selectedAnswer === question.correct) {
      setScore(score + 1);
    }
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setTimeLeft((testDetails?.timeLimitMinutes ?? 10) * 60);
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="rounded-lg border bg-card p-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Test Complete!
            </h2>
            <div className="text-6xl font-bold text-primary mb-4">
              {score}/{questions.length}
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              Your score: {Math.round((score / questions.length) * 100)}%
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestart} variant="outline" size="lg">
                Restart
              </Button>
              {onBack ? (
                <Button onClick={onBack} size="lg">
                  Back to Tests
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="rounded-lg border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              No questions found for this test.
            </h2>
            {onBack ? (
              <Button onClick={onBack} size="lg">
                Back to Tests
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ReadingHeader timeLeft={timeLeft} onBack={onBack} />
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentQuestion + 1}/{questions.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Score: {score}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Reading Passage
          </h3>
          <div className="prose prose-sm max-w-none text-foreground">
            <p>{question.passage}</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {question.question}
          </h3>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedAnswer === index
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <span className="font-medium">
                  {String.fromCharCode(65 + index)}. {option}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            size="lg"
          >
            {currentQuestion < questions.length - 1
              ? "Next Question"
              : "Finish Test"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const IntervalEnglishReadingFeature = IntervalEnglishReadingPage;
