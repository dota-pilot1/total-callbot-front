import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // 간단한 영어 퀴즈 데이터
  const questions = [
    {
      question: "What does 'Hello' mean in Korean?",
      options: ["안녕하세요", "감사합니다", "죄송합니다", "좋은 아침"],
      correct: 0,
    },
    {
      question: "Choose the correct translation of '사랑해요':",
      options: ["I hate you", "I love you", "I like you", "I miss you"],
      correct: 1,
    },
    {
      question: "What is the English word for '물'?",
      options: ["Fire", "Air", "Water", "Earth"],
      correct: 2,
    },
    {
      question: "How do you say 'Thank you' in Korean?",
      options: ["미안해요", "안녕히 가세요", "감사합니다", "죄송합니다"],
      correct: 2,
    },
    {
      question: "What does 'Good morning' translate to?",
      options: ["좋은 밤", "좋은 아침", "좋은 저녁", "좋은 오후"],
      correct: 1,
    },
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setIsCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsCompleted(false);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen px-4 py-8">
          <div className="w-full max-w-md">
            <div className="rounded-lg border bg-card p-6 shadow-lg text-center">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2">퀴즈 완료!</h2>
                <p className="text-lg text-muted-foreground">
                  총 {questions.length}문제 중 {score}문제 정답
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 font-medium">
                    정답률: {Math.round((score / questions.length) * 100)}%
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={resetQuiz}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  다시 풀기
                </button>
                <Link
                  to="/login"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors text-center"
                >
                  메인으로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/login" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">영어 퀴즈</h1>
          <div className="text-sm text-muted-foreground">
            {currentQuestion + 1}/{questions.length}
          </div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="bg-gray-100 h-2">
        <div
          className="bg-blue-500 h-2 transition-all duration-300"
          style={{
            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* 퀴즈 내용 */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-lg border bg-card p-6 shadow-lg">
            {/* 질문 */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {questions[currentQuestion].question}
              </h2>
            </div>

            {/* 답안 선택지 */}
            <div className="space-y-3 mb-6">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedAnswer === index
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium text-gray-600 mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>

            {/* 다음 버튼 */}
            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                selectedAnswer !== null
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {currentQuestion + 1 === questions.length ? "완료" : "다음"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
