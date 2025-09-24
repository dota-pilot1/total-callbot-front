import { useState } from 'react';
import { Button } from '../../../components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { PlusIcon, UsersIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';
import type { QuizRoom } from '../types';

export default function GroupQuiz() {
  const [activeTab, setActiveTab] = useState<'rooms' | 'create' | 'history'>('rooms');

  // 임시 더미 데이터
  const [quizRooms] = useState<QuizRoom[]>([
    {
      id: '1',
      name: '🧮 수학 기초 퀴즈',
      hostId: 'user1',
      maxPlayers: 6,
      currentPlayers: 3,
      status: 'waiting',
      category: 'math',
      difficulty: 'easy',
      questionsCount: 10,
      timePerQuestion: 30,
      createdAt: new Date(),
      participants: []
    },
    {
      id: '2',
      name: '🇺🇸 영어 단어 퀴즈',
      hostId: 'user2',
      maxPlayers: 8,
      currentPlayers: 5,
      status: 'waiting',
      category: 'english',
      difficulty: 'medium',
      questionsCount: 15,
      timePerQuestion: 20,
      createdAt: new Date(),
      participants: []
    },
    {
      id: '3',
      name: '🧪 과학 상식 퀴즈',
      hostId: 'user3',
      maxPlayers: 4,
      currentPlayers: 2,
      status: 'in-progress',
      category: 'science',
      difficulty: 'hard',
      questionsCount: 12,
      timePerQuestion: 45,
      createdAt: new Date(),
      participants: []
    }
  ]);

  const getCategoryIcon = (category: QuizRoom['category']) => {
    switch (category) {
      case 'math': return '🧮';
      case 'english': return '🇺🇸';
      case 'science': return '🧪';
      case 'history': return '🏛️';
      default: return '❓';
    }
  };

  const getDifficultyColor = (difficulty: QuizRoom['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: QuizRoom['status']) => {
    switch (status) {
      case 'waiting': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-orange-600 bg-orange-100';
      case 'finished': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: QuizRoom['status']) => {
    switch (status) {
      case 'waiting': return '대기중';
      case 'in-progress': return '진행중';
      case 'finished': return '종료됨';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
            <span className="text-sm">👥</span>
          </div>
          <span className="text-sm font-medium text-foreground">단체 퀴즈</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
        >
          뒤로
        </Button>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'rooms' ? 'default' : 'outline'}
            onClick={() => setActiveTab('rooms')}
            size="sm"
            className="flex items-center gap-2"
          >
            <UsersIcon className="h-4 w-4" />
            퀴즈방 목록
          </Button>
          <Button
            variant={activeTab === 'create' ? 'default' : 'outline'}
            onClick={() => setActiveTab('create')}
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            방 만들기
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'outline'}
            onClick={() => setActiveTab('history')}
            size="sm"
            className="flex items-center gap-2"
          >
            <StarIcon className="h-4 w-4" />
            내 기록
          </Button>
        </div>

        {/* 퀴즈방 목록 */}
        {activeTab === 'rooms' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">참여 가능한 퀴즈방</h2>
              <Button
                onClick={() => setActiveTab('create')}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                새 퀴즈방 만들기
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizRooms.map((room) => (
                <Card key={room.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(room.category)}</span>
                        {room.name}
                      </CardTitle>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                        {getStatusText(room.status)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <UsersIcon className="h-4 w-4" />
                        {room.currentPlayers}/{room.maxPlayers}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <ClockIcon className="h-4 w-4" />
                        {room.timePerQuestion}초
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(room.difficulty)}`}>
                        {room.difficulty === 'easy' ? '쉬움' : room.difficulty === 'medium' ? '보통' : '어려움'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {room.questionsCount}문제
                      </span>
                    </div>

                    <div className="pt-2">
                      <Button
                        className="w-full"
                        disabled={room.status === 'in-progress' || room.currentPlayers >= room.maxPlayers}
                      >
                        {room.status === 'in-progress' ? '진행중' :
                         room.currentPlayers >= room.maxPlayers ? '정원 초과' :
                         '참여하기'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {quizRooms.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    <UsersIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>현재 참여 가능한 퀴즈방이 없습니다.</p>
                  </div>
                  <Button onClick={() => setActiveTab('create')}>
                    새 퀴즈방 만들기
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* 방 만들기 */}
        {activeTab === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle>새 퀴즈방 만들기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">퀴즈방 생성 기능을 준비 중입니다.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  곧 다양한 주제와 난이도의 퀴즈방을 만들 수 있습니다!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 내 기록 */}
        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>내 퀴즈 기록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">퀴즈 기록 기능을 준비 중입니다.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  참여한 퀴즈 결과와 통계를 확인할 수 있습니다!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
