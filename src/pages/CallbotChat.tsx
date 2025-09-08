import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '../features/auth';
import { Button } from '../components/ui';
import Sidebar from '../components/Sidebar';
import { chatApi } from '../features/chat/api/chat';
import { 
  MicrophoneIcon, 
  PaperAirplaneIcon, 
  CogIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  CircleStackIcon,
  CommandLineIcon,
  CpuChipIcon,
  PhoneIcon,
  ShoppingBagIcon,
  TableCellsIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  LanguageIcon,
  BuildingLibraryIcon,
  ClipboardDocumentListIcon,
  PuzzlePieceIcon,
  CalendarIcon,
  NewspaperIcon,
  DevicePhoneMobileIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';
import { 
  MicrophoneIcon as MicrophoneIconSolid,
  SpeakerWaveIcon as SpeakerWaveIconSolid
} from '@heroicons/react/24/solid';

// 아이콘 매핑 함수
const getIconComponent = (chatbotId: string) => {
  const iconMap: { [key: string]: any } = {
    'backend': CommandLineIcon,
    'backend-framework': CommandLineIcon,
    'frontend': PaintBrushIcon,
    'frontend-framework': PaintBrushIcon,
    'devops': CpuChipIcon,
    'sql': CircleStackIcon,
    'ai': CpuChipIcon,
    'orm': TableCellsIcon,
    'component-manager': PuzzlePieceIcon,
    'figma-expert': SwatchIcon,
    'app-developer': DevicePhoneMobileIcon,
    'english': LanguageIcon,
    'academy': BuildingLibraryIcon,
    'interview': UserGroupIcon,
    'memo': DocumentTextIcon,
    'pilot-pm': ClipboardDocumentListIcon,
    'schedule-manager': CalendarIcon,
    'assistant': ComputerDesktopIcon,
    'callcenter': PhoneIcon,
    'wishket': BriefcaseIcon,
    'ecommerce': ShoppingBagIcon,
    'tech-news': NewspaperIcon,
    'startup-news': NewspaperIcon
  };
  
  return iconMap[chatbotId] || CodeBracketIcon;
};

// 임시 채팅 메시지 데이터
const mockMessages = [
  {
    id: 1,
    sender: 'callbot',
    message: '안녕하세요! 콜봇입니다. 무엇을 도와드릴까요?',
    timestamp: '오후 2:30',
    type: 'text'
  },
  {
    id: 2,
    sender: 'user',
    message: '안녕하세요. 오늘 날씨가 어떤가요?',
    timestamp: '오후 2:31',
    type: 'text'
  },
  {
    id: 3,
    sender: 'callbot',
    message: '오늘은 맑은 날씨입니다. 기온은 22도로 따뜻하네요. 외출하기 좋은 날씨입니다!',
    timestamp: '오후 2:31',
    type: 'text'
  }
];

export default function CallbotChat() {
  const { logout } = useAuthStore();
  const location = useLocation();
  const params = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // localStorage에서 직접 사용자 정보 가져오기
  const getUserFromStorage = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to parse user:', e);
        return null;
      }
    }
    return null;
  };
  
  const user = getUserFromStorage();
  
  // URL 파라미터에서 botId 가져오기
  const botId = params.botId;
  
  // 선택된 챗봇 데이터 가져오기 (state가 있으면 우선, 없으면 botId로 기본값 설정)
  const chatbot = location.state?.chatbot || (botId ? { 
    id: botId, 
    name: '챗봇', 
    greeting: '안녕하세요! 무엇을 도와드릴까요?',
    description: '전문 AI 어시스턴트',
    color: 'from-indigo-500 to-purple-600'
  } : null);
  
  // 챗봇별 초기 메시지 설정
  const getInitialMessages = (greeting: string) => [
    {
      id: 1,
      sender: 'callbot',
      message: greeting,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    }
  ];

  const [messages, setMessages] = useState(
    chatbot 
      ? getInitialMessages(chatbot.greeting)
      : mockMessages
  );
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(true);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [chatRoomDetails, setChatRoomDetails] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const messageContent = newMessage.trim();
    setNewMessage('');
    
    // 로컬 시뮬레이션 (채팅방이 없는 경우)
    const userMessage = {
      id: messages.length + 1,
      sender: 'user' as const,
      message: messageContent,
      timestamp: new Date().toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'text' as const
    };
    
    setMessages([...messages, userMessage]);
    
    // 선택된 챗봇별 맞춤 응답 시뮬레이션
    setTimeout(() => {
      const getBotResponse = (message: string, botId: string) => {
        const responses: { [key: string]: string } = {
          backend: `백엔드 관점에서 "${message}"에 대해 설명드리겠습니다. API 설계나 데이터베이스 구조를 고려하면...`,
          'backend-framework': `백엔드 프레임워크 관점에서 "${message}"에 대해 분석해드리겠습니다. Express나 Spring Boot를 사용한다면...`,
          frontend: `사용자 경험 측면에서 "${message}"를 살펴보겠습니다. React나 Vue.js로 구현한다면...`,
          'frontend-framework': `프론트엔드 프레임워크 관점에서 "${message}"에 대해 설명드립니다. React와 Next.js의 차이점을 고려하면...`,
          devops: `인프라와 배포 관점에서 "${message}"를 분석해보겠습니다. Docker나 Kubernetes를 활용하면...`,
          sql: `데이터베이스 최적화 관점에서 "${message}"에 대해 답변드립니다. 쿼리 성능을 고려하면...`,
          ai: `머신러닝 관점에서 "${message}"를 해석해보겠습니다. 알고리즘 선택과 데이터 전처리가 중요한데...`,
          orm: `ORM 최적화 관점에서 "${message}"에 답변드립니다. Sequelize나 Prisma를 사용한다면...`,
          'component-manager': `컴포넌트 재사용성 관점에서 "${message}"에 답변드립니다. Design System과 Storybook을 활용하면...`,
          'figma-expert': `UI/UX 디자인 관점에서 "${message}"에 대해 도움드리겠습니다. Figma로 프로토타입을 제작한다면...`,
          'app-developer': `모바일 앱 개발 관점에서 "${message}"를 분석해보겠습니다. React Native와 Flutter를 비교하면...`,
          english: `개발자 영어 관점에서 "${message}"에 대해 설명드립니다. 기술 용어를 영어로 표현하면...`,
          academy: `교육 과정 관점에서 "${message}"에 대해 안내드립니다. 단계별 학습 로드맵을 제시하면...`,
          interview: `면접 전략 관점에서 "${message}"에 답변드립니다. 기술 면접에서는 이런 점을 강조하세요...`,
          memo: `문서화 관점에서 "${message}"를 체계적으로 정리해보겠습니다. Markdown 형식으로...`,
          'pilot-pm': `파일럿 프로젝트 관점에서 "${message}"를 분석해보겠습니다. MVP 범위 설정과 위험 요소를 고려하면...`,
          'schedule-manager': `프로젝트 일정 관점에서 "${message}"를 계획해보겠습니다. 스프린트와 마일스톤을 고려하면...`,
          assistant: `업무 효율성 관점에서 "${message}"를 정리해드리겠습니다. 시간 관리와 우선순위 설정이...`,
          callcenter: `고객 서비스 관점에서 "${message}"에 대해 조언드립니다. 고객 만족도를 높이려면...`,
          wishket: `프리랜싱 프로젝트 관점에서 "${message}"에 대해 조언드립니다. 클라이언트와의 소통에서...`,
          ecommerce: `이커머스 전략 관점에서 "${message}"를 분석해보겠습니다. 사용자 구매 여정을 고려하면...`,
          'tech-news': `최신 기술 동향 관점에서 "${message}"에 대해 분석해드리겠습니다. 최근 트렌드를 보면...`,
          'startup-news': `스타트업 생태계 관점에서 "${message}"에 대해 설명드립니다. 최근 투자 동향과 창업 트렌드를 고려하면...`
        };
        
        return responses[botId] || `"${message}"에 대해 답변드리겠습니다. 더 자세한 정보가 필요하시면 말씀해 주세요!`;
      };

      const botResponse = {
        id: messages.length + 2,
        sender: 'callbot' as const,
        message: getBotResponse(newMessage, chatbot?.id || 'default'),
        timestamp: new Date().toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        type: 'text' as const
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1500);
  };

  const toggleConnection = async () => {
    if (isConnected) {
      // 연결 해제: 웹소켓 닫기 (향후 추가)
      setIsConnected(false);
      setChatRoomId(null);
      setChatRoomDetails(null);
    } else {
      // 연결 시작: 방 참여
      setIsConnecting(true);
      
      try {
        // 1. 채팅방 생성 또는 조회
        const chatRoomData = await chatApi.getOrCreateChatRoom({
          chatbotId: chatbot?.id || 'default',
          chatbotName: chatbot?.name || '챗봇'
        });
        
        // 2. 방 참여
        await chatApi.joinChatRoom(chatRoomData.id);
        
        // 3. 방 세부정보 조회
        const roomDetails = await chatApi.getChatRoomDetails(chatRoomData.id);
        
        // 4. 상태 업데이트
        setChatRoomId(chatRoomData.id);
        setChatRoomDetails(roomDetails);
        setIsConnected(true);
        
        console.log('방 참여 성공:', chatRoomData.id, roomDetails);
        
      } catch (error) {
        console.error('방 참여 실패:', error);
        alert('채팅방 참여에 실패했습니다.');
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <nav className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">

              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {chatbot?.name.slice(0, 2) || '콜'}
                </span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                {chatbot?.name || '콜봇'} 채팅
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name || user?.email || '게스트'}님
              </span>
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('Logout button clicked in CallbotChat');
                  logout();
                }}
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 사이드바 */}
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col">
          {/* 메인 콘텐츠 */}
          <main className="flex flex-1 overflow-hidden">
            {/* 왼쪽: 콜봇 아바타 및 연결 */}
            <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
              <div className="text-center mb-6">
                <div className={`w-24 h-24 mx-auto mb-3 bg-gradient-to-br ${chatbot?.color || 'from-indigo-500 to-purple-600'} rounded-full flex items-center justify-center`}>
                  {chatbot?.id ? (
                    (() => {
                      const IconComponent = getIconComponent(chatbot.id);
                      return <IconComponent className="h-12 w-12 text-white" />;
                    })()
                  ) : (
                    <span className="text-white text-2xl font-bold">콜봇</span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {chatbot?.name || 'AI 콜봇'}
                </h3>
                {chatbot && (
                  <p className="text-sm text-gray-600 mb-2 text-center">
                    {chatbot.description}
                  </p>
                )}
                <div className="flex items-center justify-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : (isConnecting ? 'bg-yellow-400' : 'bg-gray-400')}`}></div>
                  <span className={`text-sm ${isConnected ? 'text-green-600' : (isConnecting ? 'text-yellow-600' : 'text-gray-500')}`}>
                    {isConnecting ? '연결중...' : (isConnected ? '연결됨' : '연결 대기중')}
                  </span>
                </div>
                
                {/* 방 정보 표시 */}
                {isConnected && chatRoomId && (
                  <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-xs text-green-800 space-y-1">
                      <div><span className="font-medium">방 ID:</span> {chatRoomId}</div>
                      {chatRoomDetails?.participantCount && (
                        <div><span className="font-medium">참여자:</span> {chatRoomDetails.participantCount}명</div>
                      )}
                      {chatRoomDetails?.createdAt && (
                        <div><span className="font-medium">생성:</span> {new Date(chatRoomDetails.createdAt).toLocaleString('ko-KR')}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={toggleConnection}
                  variant={isConnected ? "destructive" : "default"}
                  className="w-full"
                  disabled={isConnecting}
                >
                  {isConnecting ? '연결중...' : (isConnected ? '연결 해제' : '콜봇 연결하기')}
                </Button>
                
                <Button variant="outline" className="w-full">
                  콜봇 소개
                </Button>
              </div>

              <div className="mt-auto pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">음성 설정</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">음성 인식</span>
                    <button
                      onClick={() => setVoiceEnabled(!voiceEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        voiceEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 가운데: 채팅 영역 */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* 채팅 메시지 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-indigo-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 메시지 입력 */}
              <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
                <div className="flex items-center space-x-4">
                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-full transition-colors ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  disabled={!isConnected || !voiceEnabled || isConnecting}
                >
                  {isRecording ? (
                    <MicrophoneIconSolid className="h-5 w-5" />
                  ) : (
                    <MicrophoneIcon className="h-5 w-5" />
                  )}
                </button>
                
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder={isConnected ? "메시지를 입력하세요..." : (isConnecting ? "연결 중..." : "콜봇에 연결해주세요")}
                    disabled={!isConnected || isConnecting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!isConnected || !newMessage.trim() || isConnecting}
                    size="sm"
                    className="px-3"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </Button>
                  
                  {/* 설정 패널 토글 버튼 */}
                  <Button 
                    onClick={() => setSettingsPanelOpen(!settingsPanelOpen)}
                    variant="outline"
                    size="sm"
                    className="px-3"
                  >
                    <CogIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

            {/* 오른쪽: 설정 패널 (조건부 렌더링) */}
            {settingsPanelOpen && (
              <div className="w-72 bg-white border-l border-gray-200 p-4">
                <div className="flex items-center space-x-2 mb-6">
                  <CogIcon className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">설정</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">음성 옵션</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">음성 출력</span>
                        <SpeakerWaveIconSolid className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">음성 속도</span>
                        <select className="text-sm border border-gray-300 rounded px-2 py-1">
                          <option>보통</option>
                          <option>빠름</option>
                          <option>느림</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">콜봇 설정</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">자동 응답</span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">응답 지연</span>
                        <span className="text-sm text-gray-500">1.5초</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">대화 기록</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full text-left justify-start">
                        대화 내용 저장
                      </Button>
                      <Button variant="outline" size="sm" className="w-full text-left justify-start">
                        기록 다운로드
                      </Button>
                      <Button variant="destructive" size="sm" className="w-full text-left justify-start">
                        대화 기록 삭제
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}