import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyStudyHeader } from '../components/MyStudyHeader';
import { StudyCard } from '../components/StudyCard';
import { StudyProgress } from '../components/StudyProgress';
import type { StudySession, StudyStats } from '../types';
import { Button } from '../../../components/ui';
import {
  PlusIcon,
  AcademicCapIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

export default function MyStudyDashboard() {
  const navigate = useNavigate();
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [stats, setStats] = useState<StudyStats>({
    totalSessions: 0,
    totalTime: 0,
    averageScore: 0,
    streakDays: 0,
    completedToday: 0,
  });

  // 더미 데이터 로드
  useEffect(() => {
    const dummySessions: StudySession[] = [
      {
        id: '1',
        title: '카페에서 주문하기',
        category: 'conversation',
        description: '카페에서 음료를 주문하는 기본적인 대화를 연습합니다.',
        progress: 75,
        totalTime: 30,
        createdAt: new Date(),
        tags: ['기초', '실생활'],
      },
      {
        id: '2',
        title: '영어 듣기 연습 - Level 1',
        category: 'listening',
        description: 'TOEIC 기초 수준의 듣기 문제를 풀어봅니다.',
        progress: 100,
        totalTime: 45,
        completedAt: new Date(),
        createdAt: new Date(),
        tags: ['TOEIC', '초급'],
      },
      {
        id: '3',
        title: '기본 문법 - 현재시제',
        category: 'grammar',
        description: '영어 현재시제의 기본 개념과 활용법을 학습합니다.',
        progress: 40,
        totalTime: 25,
        createdAt: new Date(),
        tags: ['문법', '기초'],
      },
      {
        id: '4',
        title: '일상 어휘 100개',
        category: 'vocabulary',
        description: '일상생활에서 자주 사용되는 영어 단어 100개를 학습합니다.',
        progress: 0,
        totalTime: 60,
        createdAt: new Date(),
        tags: ['어휘', '일상'],
      },
    ];

    const dummyStats: StudyStats = {
      totalSessions: dummySessions.length,
      totalTime: 435, // 7시간 15분
      averageScore: 87.5,
      streakDays: 5,
      completedToday: 2,
    };

    setStudySessions(dummySessions);
    setStats(dummyStats);
  }, []);

  const handleStartStudy = (sessionId: string) => {
    const session = studySessions.find(s => s.id === sessionId);
    if (!session) return;

    // 카테고리별 페이지로 이동
    switch (session.category) {
      case 'conversation':
        navigate('/daily-english-conversation');
        break;
      case 'listening':
        navigate('/quiz-list');
        break;
      case 'english':
        navigate('/daily-english');
        break;
      case 'math':
        navigate('/daily-math');
        break;
      default:
        console.log(`${session.category} 학습 시작:`, session.title);
    }
  };

  const handleResumeStudy = (sessionId: string) => {
    handleStartStudy(sessionId); // 동일한 로직 사용
  };

  const quickActions = [
    {
      title: '일일 영어',
      description: '오늘의 영어 학습',
      icon: '🇺🇸',
      color: 'bg-blue-100 text-blue-700',
      action: () => navigate('/daily-english'),
    },
    {
      title: '영어 회화',
      description: '실시간 대화 연습',
      icon: '💬',
      color: 'bg-purple-100 text-purple-700',
      action: () => navigate('/daily-english-conversation'),
    },
    {
      title: '듣기 시험',
      description: '영어 듣기 능력 테스트',
      icon: '🎧',
      color: 'bg-green-100 text-green-700',
      action: () => navigate('/quiz-list'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <MyStudyHeader currentPage="dashboard" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 환영 메시지 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            안녕하세요! 오늘도 학습해볼까요? 📚
          </h1>
          <p className="text-gray-600">
            지금까지 {stats.totalSessions}개의 학습을 완료했고,
            {stats.streakDays}일 연속으로 학습하고 있어요!
          </p>
        </div>

        {/* 학습 현황 */}
        <div className="mb-6">
          <StudyProgress stats={stats} />
        </div>

        {/* 빠른 실행 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">빠른 실행</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{action.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 최근 학습 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">최근 학습</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/my-study/library')}
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              더보기
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {studySessions.map((session) => (
              <StudyCard
                key={session.id}
                session={session}
                onStart={() => handleStartStudy(session.id)}
                onResume={() => handleResumeStudy(session.id)}
              />
            ))}
          </div>
        </div>

        {/* 오늘의 목표 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">오늘의 목표</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <AcademicCapIcon className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">영어 회화 30분 연습</p>
                <p className="text-xs text-gray-600">진행률: 20/30분</p>
              </div>
              <div className="text-sm text-blue-600 font-medium">67%</div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CalendarDaysIcon className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">듣기 문제 10개 풀기</p>
                <p className="text-xs text-gray-600">진행률: 10/10개</p>
              </div>
              <div className="text-sm text-green-600 font-medium">완료!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
