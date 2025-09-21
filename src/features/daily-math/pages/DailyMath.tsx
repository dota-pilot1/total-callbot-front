import { useState } from 'react';
import { Button } from '../../../components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';

export default function DailyMath() {
  const [activeTab, setActiveTab] = useState<'practice' | 'quiz' | 'progress'>('practice');

  return (
    <div className="min-h-screen bg-background">
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center">
            <span className="text-sm">🔢</span>
          </div>
          <span className="text-sm font-medium text-foreground">일일 수학</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
        >
          뒤로
        </Button>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'practice' ? 'default' : 'outline'}
            onClick={() => setActiveTab('practice')}
            size="sm"
          >
            문제 연습
          </Button>
          <Button
            variant={activeTab === 'quiz' ? 'default' : 'outline'}
            onClick={() => setActiveTab('quiz')}
            size="sm"
          >
            일일 퀴즈
          </Button>
          <Button
            variant={activeTab === 'progress' ? 'default' : 'outline'}
            onClick={() => setActiveTab('progress')}
            size="sm"
          >
            진행상황
          </Button>
        </div>

        {/* 콘텐츠 영역 */}
        {activeTab === 'practice' && (
          <Card>
            <CardHeader>
              <CardTitle>오늘의 수학 문제</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">문제 연습 기능을 준비 중입니다.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'quiz' && (
          <Card>
            <CardHeader>
              <CardTitle>일일 수학 퀴즈</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">퀴즈 기능을 준비 중입니다.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'progress' && (
          <Card>
            <CardHeader>
              <CardTitle>학습 진행상황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">진행상황 기능을 준비 중입니다.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
