import { useState } from 'react';
import { Button } from '../../../../components/ui';
import { Card, CardContent } from '../../../../components/ui/Card';
import { ChevronLeftIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';

interface Question {
  id: number;
  questionText: string;
  questionTextKorean?: string;
  options: string[];
  correctOption: number;
  timeLimit: number;
  points: number;
}

const SAMPLE_QUESTION: Question = {
  id: 1,
  questionText: "What is the meaning of 'Hello'?",
  questionTextKorean: "'Hello'의 뜻은 무엇인가요?",
  options: [
    "Goodbye",
    "Greeting",
    "Question",
    "Answer"
  ],
  correctOption: 1, // 0-based index
  timeLimit: 30,
  points: 10
};

export default function GroupQuizMobile() {
  const [currentQuestion] = useState<Question>(SAMPLE_QUESTION);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(10);

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;

    // TODO: 답안 제출 로직
    console.log('Selected option:', selectedOption);

    // 임시로 다음 문제로 이동하는 로직
    setSelectedOption(null);
    setQuestionNumber(prev => prev + 1);
    setTimeLeft(30);
  };

  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <header className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => window.history.back()}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">영어 퀴즈</h1>
            <p className="text-sm text-muted-foreground">
              {questionNumber}/{totalQuestions} 문제
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <StarIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{score}</span>
          </div>
          <div className="flex items-center gap-1 text-orange-600">
            <ClockIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{timeLeft}s</span>
          </div>
        </div>
      </header>

      {/* 진행률 바 */}
      <div className="w-full bg-muted h-2">
        <div
          className="bg-primary h-full transition-all duration-300 ease-out"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col p-4 gap-6">
        {/* 문제 영역 */}
        <Card className="flex-1">
          <CardContent className="p-6 flex flex-col justify-center min-h-[200px]">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground leading-relaxed">
                  {currentQuestion.questionText}
                </h2>
                {currentQuestion.questionTextKorean && (
                  <p className="text-base text-muted-foreground">
                    {currentQuestion.questionTextKorean}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4" />
                  <span>{currentQuestion.points}점</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{currentQuestion.timeLimit}초</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 보기 선택 영역 - 2x2 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedOption === index ? "default" : "outline"}
              className={`
                p-4 h-auto min-h-[80px] text-left justify-start flex-col gap-2
                ${selectedOption === index ? 'ring-2 ring-primary ring-offset-2' : ''}
              `}
              onClick={() => handleOptionSelect(index)}
            >
              <div className="flex items-center gap-2 w-full">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold
                  ${selectedOption === index ? 'bg-primary-foreground text-primary' : 'bg-muted text-muted-foreground'}
                `}>
                  {getOptionLetter(index)}
                </div>
              </div>
              <span className="text-sm leading-relaxed break-words w-full text-center">
                {option}
              </span>
            </Button>
          ))}
        </div>

        {/* 답안 제출 버튼 */}
        <div className="mt-4">
          <Button
            className="w-full py-4 text-lg font-semibold"
            size="lg"
            disabled={selectedOption === null}
            onClick={handleSubmitAnswer}
          >
            {selectedOption !== null ? '답안 제출' : '답을 선택해주세요'}
          </Button>
        </div>
      </div>
    </div>
  );
}
