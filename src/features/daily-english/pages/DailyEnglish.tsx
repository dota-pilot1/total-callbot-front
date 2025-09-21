import { useState } from 'react';
import { Button } from '../../../components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';

export default function DailyEnglish() {
  const [activeTab, setActiveTab] = useState<'words' | 'quiz' | 'progress'>('words');

  return (
    <div className="min-h-screen bg-background">
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <span className="text-sm">🇺🇸</span>
          </div>
          <span className="text-sm font-medium text-foreground">일일 영어</span>
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
            variant={activeTab === 'words' ? 'default' : 'outline'}
            onClick={() => setActiveTab('words')}
            size="sm"
          >
            단어 학습
          </Button>
          <Button
            variant={activeTab === 'quiz' ? 'default' : 'outline'}
            onClick={() => setActiveTab('quiz')}
            size="sm"
          >
            퀴즈
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
        {activeTab === 'words' && (
          <Card>
            <CardHeader>
              <CardTitle>오늘의 단어</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">단어 학습 기능을 준비 중입니다.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'quiz' && (
          <Card>
            <CardHeader>
              <CardTitle>일일 영어 퀴즈</CardTitle>
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
