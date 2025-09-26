import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { apiClient } from "../../../shared/api/client";

interface Question {
  id: number;
  questionNumber: number;
  readingPassage: string;
  questionContent: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  points: number;
  testSetId: number;
}

const IntervalEnglishReadingTest: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [testTitle, setTestTitle] = useState("");

  useEffect(() => {
    if (testId) {
      loadQuestions();
    }
  }, [testId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/interval-reading/tests/${testId}/questions`);
      setQuestions(response.data);

      // 테스트 제목 가져오기
      const testResponse = await apiClient.get(`/interval-reading/tests/${testId}`);
      setTestTitle(testResponse.data.title);
    } catch (error) {
      console.error("Failed to load questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
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
    // TODO: 답안 제출 로직 구현
    console.log("Selected answers:", selectedAnswers);
    alert("테스트가 제출되었습니다!");
    navigate("/interval-english-reading-mobile");
  };

  const handleBack = () => {
    navigate("/interval-english-reading-mobile");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground">문제를 불러올 수 없습니다.</p>
            <Button onClick={handleBack} className="mt-4">
              돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <h1 className="font-semibold">{testTitle}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {currentQuestionIndex + 1} / {questions.length}
              </Badge>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-2">
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Reading Passage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">독해 지문</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {currentQuestion.readingPassage}
            </p>
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              문제 {currentQuestion.questionNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base font-medium">
              {currentQuestion.questionContent}
            </p>

            {/* Answer Options */}
            <div className="space-y-3">
              {[
                { key: "A", text: currentQuestion.optionA },
                { key: "B", text: currentQuestion.optionB },
                { key: "C", text: currentQuestion.optionC },
                { key: "D", text: currentQuestion.optionD },
              ].map((option) => (
                <div
                  key={option.key}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnswer === option.key
                      ? "bg-primary/10 border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                  onClick={() => handleAnswerSelect(option.key)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      selectedAnswer === option.key
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground"
                    }`}>
                      {option.key}
                    </div>
                    <p className="text-sm">{option.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-background border-t p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            이전 문제
          </Button>

          <div className="text-sm text-muted-foreground">
            {Object.keys(selectedAnswers).length} / {questions.length} 답안 완료
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== questions.length}
            >
              제출하기
            </Button>
          ) : (
            <Button onClick={handleNext}>
              다음 문제
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntervalEnglishReadingTest;
