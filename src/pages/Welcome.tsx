import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

type Tab = 'chatbot' | 'chat';

export default function Welcome() {
  const [tab, setTab] = useState<Tab>('chatbot');

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="rounded-lg border bg-card p-8 shadow-lg">
            {/* 브랜드 라인 (심플) */}
            <div className="flex items-center gap-3 mb-4">
              <img src="/gpt-star.jpeg" alt="콜봇" className="h-8 w-8 rounded-md object-cover" />
              <span className="text-sm font-medium text-foreground">Total Callbot</span>
            </div>

            {/* 소개 탭 */}
            <div className="mb-4">
              <div className="flex gap-2 border-b border-border">
                <button
                  type="button"
                  onClick={() => setTab('chatbot')}
                  aria-pressed={tab === 'chatbot'}
                  className={`px-3 py-2 text-sm -mb-px rounded-t-md transition-colors ${
                    tab === 'chatbot'
                      ? 'border-b-2 border-primary text-foreground bg-muted/40'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                  }`}
                >
                  챗봇
                </button>
                <button
                  type="button"
                  onClick={() => setTab('chat')}
                  aria-pressed={tab === 'chat'}
                  className={`px-3 py-2 text-sm -mb-px rounded-t-md transition-colors ${
                    tab === 'chat'
                      ? 'border-b-2 border-primary text-foreground bg-muted/40'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
                  }`}
                >
                  채팅
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {tab === 'chatbot'
                  ? 'AI 챗봇과 짧게 대화하며 자연스럽게 연습하세요.'
                  : '실시간 채팅방에서 가볍게 소통해보세요.'}
              </p>
            </div>

            {/* 시크한 선택 카드 */}
            <div className="grid grid-cols-2 gap-3 mb-6 bg-muted/20 p-2 rounded-xl">
              <Link to="/login" className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-colors duration-200 ${
                tab === 'chatbot' ? 'border-primary bg-muted/60 text-foreground ring-1 ring-primary/30' : 'border-border hover:bg-muted/30 hover:text-foreground hover:border-primary/30'
              }`}>
                <img src="/gpt-star.jpeg" alt="챗봇" className="h-8 w-8 rounded-md object-cover" />
              </Link>
              <Link to="/login" className={`relative flex flex-col items-center p-4 rounded-lg border-2 transition-colors duration-200 ${
                tab === 'chat' ? 'border-primary bg-muted/60 text-foreground ring-1 ring-primary/30' : 'border-border hover:bg-muted/30 hover:text-foreground hover:border-primary/30'
              }`}>
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
              </Link>
            </div>

            {/* 액션 */}
            <div className="space-y-2">
              {tab === 'chatbot' ? (
                <>
                  <Link to="/chatbots" className="block w-full">
                    <Button className="w-full" size="lg" variant="outline">챗봇 둘러보기</Button>
                  </Link>
                  <Link to="/login" className="block w-full">
                    <Button variant="outline" className="w-full" size="lg">로그인</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/chat" className="block w-full">
                    <Button className="w-full" size="lg" variant="outline">채팅 참여</Button>
                  </Link>
                  <Link to="/login" className="block w-full">
                    <Button variant="outline" className="w-full" size="lg">로그인</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
