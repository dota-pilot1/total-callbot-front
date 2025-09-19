import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';
import { Button } from '../../../components/ui';
import type { MathProblem } from '../types';

export default function MathPage() {
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const generateProblem = () => {
    const operations = ['+', '-', '*', '/'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 10) + 1;

    let question: string;
    let answer: number;

    switch (op) {
      case '+':
        question = `${a} + ${b}`;
        answer = a + b;
        break;
      case '-':
        question = `${a} - ${b}`;
        answer = a - b;
        break;
      case '*':
        question = `${a} × ${b}`;
        answer = a * b;
        break;
      case '/':
        const dividend = a * b;
        question = `${dividend} ÷ ${a}`;
        answer = b;
        break;
      default:
        question = `${a} + ${b}`;
        answer = a + b;
    }

    setCurrentProblem({
      id: Date.now().toString(),
      question,
      answer,
      difficulty: 'easy',
      category: 'arithmetic'
    });
    setUserAnswer('');
    setIsCorrect(null);
  };

  const checkAnswer = () => {
    if (!currentProblem) return;

    const correct = parseInt(userAnswer) === currentProblem.answer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🔢 수학 문제 풀이</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-lg font-medium text-muted-foreground mb-2">점수: {score}</div>
            </div>

            {!currentProblem ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">새로운 수학 문제를 시작해보세요!</p>
                <Button onClick={generateProblem} size="lg">
                  문제 시작하기
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-4">{currentProblem.question} = ?</div>
                      <input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="w-32 px-3 py-2 text-xl text-center border border-border rounded-md"
                        placeholder="답"
                        onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                      />
                    </div>
                  </CardContent>
                </Card>

                {isCorrect !== null && (
                  <Card className={`${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        {isCorrect ? (
                          <div className="text-green-700">
                            <div className="text-xl font-bold">정답입니다! 🎉</div>
                            <div>답: {currentProblem.answer}</div>
                          </div>
                        ) : (
                          <div className="text-red-700">
                            <div className="text-xl font-bold">틀렸습니다 😔</div>
                            <div>정답: {currentProblem.answer}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={checkAnswer}
                    disabled={!userAnswer || isCorrect !== null}
                    variant="default"
                  >
                    정답 확인
                  </Button>
                  <Button
                    onClick={generateProblem}
                    variant="outline"
                  >
                    다음 문제
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
