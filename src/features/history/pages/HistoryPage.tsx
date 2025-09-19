import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';
import { Button } from '../../../components/ui';
import type { HistoricalEvent, HistoryQuiz } from '../types';

const sampleEvents: HistoricalEvent[] = [
  {
    id: '1',
    title: '한국전쟁 발발',
    description: '북한이 38선을 넘어 남한을 침공하면서 한국전쟁이 시작되었습니다.',
    year: 1950,
    category: 'contemporary',
    country: '한국'
  },
  {
    id: '2',
    title: '세종대왕 즉위',
    description: '조선 제4대 왕인 세종대왕이 즉위하여 한글을 창제하고 많은 업적을 남겼습니다.',
    year: 1418,
    category: 'medieval',
    country: '한국'
  },
  {
    id: '3',
    title: '광복절',
    description: '일제강점기가 끝나고 한국이 광복을 맞이한 날입니다.',
    year: 1945,
    category: 'contemporary',
    country: '한국'
  }
];

const sampleQuizzes: HistoryQuiz[] = [
  {
    id: '1',
    question: '한글을 창제한 조선의 왕은 누구인가요?',
    options: ['태조', '세종대왕', '정조', '영조'],
    correctAnswer: 1,
    explanation: '세종대왕은 1443년 한글(훈민정음)을 창제하여 백성들이 쉽게 문자를 사용할 수 있도록 했습니다.'
  },
  {
    id: '2',
    question: '한국전쟁이 발발한 연도는?',
    options: ['1948년', '1950년', '1952년', '1953년'],
    correctAnswer: 1,
    explanation: '한국전쟁은 1950년 6월 25일 북한의 남침으로 시작되었습니다.'
  },
  {
    id: '3',
    question: '광복절은 언제인가요?',
    options: ['8월 14일', '8월 15일', '8월 16일', '9월 15일'],
    correctAnswer: 1,
    explanation: '광복절은 1945년 8월 15일로, 일제강점기로부터 해방된 날을 기념하는 국경일입니다.'
  }
];

export default function HistoryPage() {
  const [currentTab, setCurrentTab] = useState<'events' | 'quiz'>('events');
  const [currentQuiz, setCurrentQuiz] = useState<HistoryQuiz | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCount, setQuizCount] = useState(0);

  const startRandomQuiz = () => {
    const randomQuiz = sampleQuizzes[Math.floor(Math.random() * sampleQuizzes.length)];
    setCurrentQuiz(randomQuiz);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null || !currentQuiz) return;

    setShowResult(true);
    setQuizCount(quizCount + 1);

    if (selectedAnswer === currentQuiz.correctAnswer) {
      setScore(score + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🏛️ 역사 학습</CardTitle>
            <div className="flex justify-center gap-2">
              <Button
                variant={currentTab === 'events' ? 'default' : 'outline'}
                onClick={() => setCurrentTab('events')}
              >
                역사 사건
              </Button>
              <Button
                variant={currentTab === 'quiz' ? 'default' : 'outline'}
                onClick={() => setCurrentTab('quiz')}
              >
                퀴즈
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {currentTab === 'events' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">주요 역사 사건들</h3>
                {sampleEvents.map((event) => (
                  <Card key={event.id} className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg">{event.title}</h4>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {event.year}년
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-2">{event.description}</p>
                      <div className="flex gap-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {event.country}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {event.category}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {currentTab === 'quiz' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-lg font-medium text-muted-foreground mb-4">
                    점수: {score}/{quizCount}
                  </div>
                </div>

                {!currentQuiz ? (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">역사 퀴즈를 시작해보세요!</p>
                    <Button onClick={startRandomQuiz} size="lg">
                      퀴즈 시작하기
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Card className="bg-muted/50">
                      <CardContent className="pt-6">
                        <h3 className="text-xl font-bold mb-4">{currentQuiz.question}</h3>
                        <div className="space-y-2">
                          {currentQuiz.options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => !showResult && setSelectedAnswer(index)}
                              disabled={showResult}
                              className={`w-full p-3 text-left border rounded-md transition-colors ${
                                selectedAnswer === index
                                  ? showResult
                                    ? index === currentQuiz.correctAnswer
                                      ? 'bg-green-100 border-green-500 text-green-800'
                                      : 'bg-red-100 border-red-500 text-red-800'
                                    : 'bg-blue-100 border-blue-500'
                                  : showResult && index === currentQuiz.correctAnswer
                                  ? 'bg-green-100 border-green-500 text-green-800'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              {index + 1}. {option}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {showResult && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-4">
                          <div className="text-blue-800">
                            <div className="font-bold mb-2">
                              {selectedAnswer === currentQuiz.correctAnswer ? '정답입니다! 🎉' : '틀렸습니다 😔'}
                            </div>
                            <p>{currentQuiz.explanation}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={submitAnswer}
                        disabled={selectedAnswer === null || showResult}
                        variant="default"
                      >
                        정답 확인
                      </Button>
                      <Button
                        onClick={startRandomQuiz}
                        variant="outline"
                      >
                        다음 문제
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
