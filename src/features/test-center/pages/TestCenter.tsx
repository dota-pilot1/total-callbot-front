import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui';
import {
  PlusIcon,
  UsersIcon,
  ClockIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import type { TestRoom } from '../types';

export default function TestCenter() {
  const [rooms, setRooms] = useState<TestRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo
    const mockRooms: TestRoom[] = [
      {
        id: '1',
        name: '영어 듣기 시험 A',
        description: '기초 수준 영어 듣기 평가',
        createdAt: '2024-01-15T09:00:00Z',
        participants: [
          { id: '1', name: '김학생', email: 'student1@test.com', joinedAt: '2024-01-15T09:05:00Z', status: 'connected' },
          { id: '2', name: '이학생', email: 'student2@test.com', joinedAt: '2024-01-15T09:07:00Z', status: 'connected' }
        ],
        status: 'waiting',
        maxParticipants: 30
      },
      {
        id: '2',
        name: '회화 평가 B',
        description: '중급 수준 영어 회화 테스트',
        createdAt: '2024-01-15T10:00:00Z',
        participants: [
          { id: '3', name: '박학생', email: 'student3@test.com', joinedAt: '2024-01-15T10:02:00Z', status: 'connected' }
        ],
        status: 'active',
        maxParticipants: 20
      }
    ];

    setTimeout(() => {
      setRooms(mockRooms);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleCreateRoom = () => {
    // TODO: Implement room creation
    console.log('Creating new test room...');
  };

  const handleStartTest = (roomId: string) => {
    // TODO: Implement test start
    console.log(`Starting test for room ${roomId}`);
  };

  const handleStopTest = (roomId: string) => {
    // TODO: Implement test stop
    console.log(`Stopping test for room ${roomId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">테스트 센터</h1>
              <p className="text-sm text-muted-foreground mt-1">
                단체 실시간 시험장 관리
              </p>
            </div>
            <Button onClick={handleCreateRoom} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              새 시험방 만들기
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              시험방이 없습니다
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              새로운 시험방을 만들어 학생들과 함께 시험을 진행하세요.
            </p>
            <Button onClick={handleCreateRoom}>
              <PlusIcon className="h-4 w-4 mr-2" />
              첫 번째 시험방 만들기
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div key={room.id} className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1">{room.name}</h3>
                    {room.description && (
                      <p className="text-sm text-muted-foreground">{room.description}</p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    room.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : room.status === 'waiting'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {room.status === 'active' ? '진행중' : room.status === 'waiting' ? '대기중' : '완료'}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UsersIcon className="h-4 w-4" />
                    <span>{room.participants.length}/{room.maxParticipants}명 참여</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ClockIcon className="h-4 w-4" />
                    <span>{new Date(room.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {room.status === 'waiting' ? (
                    <Button
                      size="sm"
                      onClick={() => handleStartTest(room.id)}
                      className="flex-1"
                    >
                      <PlayIcon className="h-4 w-4 mr-2" />
                      시험 시작
                    </Button>
                  ) : room.status === 'active' ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleStopTest(room.id)}
                      className="flex-1"
                    >
                      <StopIcon className="h-4 w-4 mr-2" />
                      시험 종료
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="flex-1" disabled>
                      완료됨
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    관리
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
