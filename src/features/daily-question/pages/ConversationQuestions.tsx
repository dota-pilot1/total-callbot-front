import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useConversationQuestions } from "../api/useDailyQuestions";
import type { ConversationQuestion } from "../api/dailyQuestionApi";
import { Button } from "../../../components/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui";
import { Badge } from "../../../components/ui";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  SpeakerWaveIcon
} from "@heroicons/react/24/outline";

// Simple date formatter helper
const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function ConversationQuestions() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: questionData, isLoading, error } = useConversationQuestions(date);

  const questions = questionData?.questions as ConversationQuestion[] || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: number, answer: string) => {
    if (showResults) return; // 결과 보기 모드에서는 답변 변경 불가

    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: questions.length };
  };

  const playConversation = async () => {
    if (!currentQuestion?.conversationText || isPlaying) return;

    setIsPlaying(true);

    try {
      // Web Speech API를 사용한 TTS
      const utterance = new SpeechSynthesisUtterance(currentQuestion.conversationText);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlaying(false);
    }
  };

  const stopConversation = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">오류가 발생했습니다</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : "문제를 불러올 수 없습니다"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/daily-questions')} className="w-full">
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">문제를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>문제가 없습니다</CardTitle>
            <CardDescription>해당 날짜에 생성된 영어 회화 문제가 없습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/daily-questions')} className="w-full">
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { correct, total } = showResults ? calculateScore() : { correct: 0, total: 0 };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/daily-questions')}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
              <div className="flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">English Conversation</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDate(new Date(date))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            문제 {currentQuestionIndex + 1} / {questions.length}
          </div>
          {showResults && (
            <Badge variant="default" className="bg-green-100 text-green-800">
              점수: {correct}/{total}
            </Badge>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{currentQuestion.questionTitle}</CardTitle>
                <CardDescription className="mt-2">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{currentQuestion.conversationType}</Badge>
                    <Badge variant="outline">{currentQuestion.difficulty}</Badge>
                    <div className="flex items-center gap-1 text-xs">
                      <ClockIcon className="w-3 h-3" />
                      약 {currentQuestion.estimatedSolvingTime}분
                    </div>
                  </div>
                </CardDescription>
              </div>
              {showResults && selectedAnswers[currentQuestion.id] && (
                <div className="text-right">
                  {selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircleIcon className="w-6 h-6 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Conversation */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Conversation</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isPlaying ? stopConversation : playConversation}
                  disabled={!currentQuestion.conversationText}
                >
                  <SpeakerWaveIcon className={`w-4 h-4 mr-2 ${isPlaying ? 'animate-pulse' : ''}`} />
                  {isPlaying ? '정지' : '재생'}
                </Button>
              </div>
              <div className="whitespace-pre-line text-sm font-mono bg-background p-3 rounded border">
                {currentQuestion.conversationText}
              </div>
            </div>

            {/* Question */}
            <div>
              <h3 className="font-medium mb-3">{currentQuestion.questionContent}</h3>

              {/* Options */}
              <div className="space-y-3">
                {[
                  { key: 'A', value: currentQuestion.optionA },
                  { key: 'B', value: currentQuestion.optionB },
                  { key: 'C', value: currentQuestion.optionC },
                  { key: 'D', value: currentQuestion.optionD },
                ].map((option) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === option.key;
                  const isCorrect = option.key === currentQuestion.correctAnswer;
                  return (
                    <button
                      key={option.key}
                      onClick={() => handleAnswerSelect(currentQuestion.id, option.key)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? showResults
                            ? isCorrect
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                            : 'border-primary bg-primary/5'
                          : showResults && isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                      disabled={showResults}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                          isSelected
                            ? showResults
                              ? isCorrect
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-red-500 bg-red-500 text-white'
                              : 'border-primary bg-primary text-white'
                            : showResults && isCorrect
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-muted-foreground'
                        }`}>
                          {option.key}
                        </span>
                        <span className="text-sm">{option.value}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation (결과 보기 모드에서만) */}
            {showResults && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">해설</h4>
                <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            이전
          </Button>

          <div className="flex items-center gap-2">
            {!showResults && (
              <Button
                onClick={handleSubmit}
                disabled={questions.some(q => !selectedAnswers[q.id])}
              >
                결과 보기
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
          >
            다음
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
