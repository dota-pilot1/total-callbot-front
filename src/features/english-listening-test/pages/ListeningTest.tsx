import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayIcon } from "@heroicons/react/24/solid";
import { ArrowLeftIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "../../auth";
import { ListeningSettingsDialog } from "../components";
import type { Question } from "../types";

const englishQuestions: Question[] = [
  {
    audioText: "I went to the library yesterday to study for my exam.",
    question: "Where did the person go yesterday?",
    options: ["To the bookstore", "To the library", "To the school", "To the cafe"],
    correct: 1
  },
  {
    audioText: "The weather is beautiful today. Let's go for a walk in the park.",
    question: "What does the speaker suggest doing?",
    options: ["Going shopping", "Going for a walk", "Staying inside", "Going to work"],
    correct: 1
  },
  {
    audioText: "I usually have breakfast at seven o'clock in the morning.",
    question: "When does the person usually have breakfast?",
    options: ["At 6 o'clock", "At 7 o'clock", "At 8 o'clock", "At 9 o'clock"],
    correct: 1
  },
  {
    audioText: "My favorite subject in school is mathematics because I enjoy solving problems.",
    question: "What is the person's favorite subject?",
    options: ["English", "Science", "Mathematics", "History"],
    correct: 2
  },
  {
    audioText: "Can you help me carry these heavy boxes to the second floor?",
    question: "What does the speaker need help with?",
    options: ["Moving boxes", "Finding something", "Opening a door", "Cleaning"],
    correct: 0
  }
];

export default function ListeningTest() {
  const navigate = useNavigate();
  const { getUser } = useAuthStore();
  const user = getUser();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 듣기 설정 상태
  const [speechRate, setSpeechRate] = useState(0.8);
  const [autoRepeat, setAutoRepeat] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const question = englishQuestions[currentQuestion];

  const playAudio = () => {
    if ("speechSynthesis" in window) {
      setIsPlaying(true);
      const utterance = new SpeechSynthesisUtterance(question.audioText);
      utterance.lang = "en-US";
      utterance.rate = speechRate;
      utterance.onend = () => {
        setIsPlaying(false);
        // 자동 반복 기능
        if (autoRepeat) {
          setTimeout(() => {
            if ("speechSynthesis" in window) {
              const repeatUtterance = new SpeechSynthesisUtterance(question.audioText);
              repeatUtterance.lang = "en-US";
              repeatUtterance.rate = speechRate;
              speechSynthesis.speak(repeatUtterance);
            }
          }, 1000);
        }
      };
      speechSynthesis.speak(utterance);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === question.correct) {
      setScore(score + 1);
    }

    if (currentQuestion < englishQuestions.length - 1) {
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
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🎉 시험 완료!</h2>
            <div className="text-6xl font-bold text-blue-600 mb-4">
              {score}/{englishQuestions.length}
            </div>
            <p className="text-xl text-gray-600 mb-8">
              정답률: {Math.round((score / englishQuestions.length) * 100)}%
            </p>
            <button
              onClick={handleRestart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              다시 시작
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="text-sm">뒤로</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">🎧 영어 듣기</h1>
                <p className="text-sm text-gray-600">
                  안녕하세요, {user?.name || '사용자'}님!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              문제 {currentQuestion + 1} / {englishQuestions.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              점수: {score}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / englishQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🎧 영어 듣기
            </h2>
            <button
              onClick={playAudio}
              disabled={isPlaying}
              className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                isPlaying
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <PlayIcon className="w-5 h-5" />
              <span>{isPlaying ? "재생 중..." : "▶ 듣기"}</span>
            </button>
            <p className="text-sm text-gray-500 mt-2">
              버튼을 클릭해서 영어 문장을 들어보세요
            </p>
            {showSubtitles && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 italic">
                  "{question.audioText}"
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {question.question}
          </h3>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedAnswer === index
                    ? "border-blue-600 bg-blue-50 text-blue-800"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
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
          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              selectedAnswer !== null
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {currentQuestion < englishQuestions.length - 1
              ? "다음 문제"
              : "결과 보기"}
          </button>
        </div>
      </div>

      {/* 듣기 설정 다이얼로그 */}
      <ListeningSettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        speechRate={speechRate}
        onSpeechRateChange={setSpeechRate}
        autoRepeat={autoRepeat}
        onAutoRepeatChange={setAutoRepeat}
        showSubtitles={showSubtitles}
        onShowSubtitlesChange={setShowSubtitles}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
      />
    </div>
  );
}
