import {
  CommandLineIcon,
  PaintBrushIcon,
  CircleStackIcon,
  CpuChipIcon,
  PhoneIcon,
  ShoppingBagIcon,
  TableCellsIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  LanguageIcon,
  ClipboardDocumentListIcon,
  PuzzlePieceIcon,
  DevicePhoneMobileIcon,
  SwatchIcon,
  ServerIcon,
  GlobeAltIcon,
  CloudIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
  CalendarIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';

export interface Chatbot {
  id: string;
  category: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  description: string;
  expertise: string[];
  greeting: string;
}

export const chatbots: Chatbot[] = [
  // 🖥️ 개발봇 카테고리
  {
    id: 'backend',
    category: 'development',
    name: '백엔드 전문가',
    icon: ServerIcon,
    color: 'from-green-400 to-green-600',
    description: 'API 설계, 데이터베이스, 서버 아키텍처 전문',
    expertise: ['Node.js', 'Python', 'Java', 'API Design', 'Microservices'],
    greeting: '안녕하세요! 백엔드 개발의 모든 것을 도와드리겠습니다.'
  },
  {
    id: 'backend-framework',
    category: 'development',
    name: '백엔드 프레임워크 전문가',
    icon: CommandLineIcon,
    color: 'from-emerald-500 to-emerald-700',
    description: 'Express, FastAPI, Spring, Django 등 프레임워크 전문',
    expertise: ['Express.js', 'FastAPI', 'Spring Boot', 'Django', 'NestJS'],
    greeting: '백엔드 프레임워크 선택과 구현을 도와드리겠습니다!'
  },
  {
    id: 'frontend',
    category: 'development',
    name: '프론트엔드 전문가',
    icon: GlobeAltIcon,
    color: 'from-blue-400 to-blue-600',
    description: 'React, Vue, 반응형 웹, 사용자 경험 설계',
    expertise: ['React', 'Vue.js', 'TypeScript', 'CSS/SCSS', 'UX/UI'],
    greeting: '프론트엔드 개발과 사용자 경험을 함께 만들어보세요!'
  },
  {
    id: 'frontend-framework',
    category: 'development',
    name: '프론트엔드 프레임워크 전문가',
    icon: PaintBrushIcon,
    color: 'from-sky-500 to-sky-700',
    description: 'React, Vue, Angular, Next.js, Nuxt.js 프레임워크 전문',
    expertise: ['React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js'],
    greeting: '최적의 프론트엔드 프레임워크 선택을 도와드리겠습니다!'
  },
  {
    id: 'devops',
    category: 'development',
    name: 'DevOps 전문가',
    icon: CloudIcon,
    color: 'from-purple-400 to-purple-600',
    description: 'CI/CD, Docker, Kubernetes, 클라우드 인프라',
    expertise: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
    greeting: '배포와 인프라 자동화의 모든 것을 알려드립니다.'
  },
  {
    id: 'sql',
    category: 'development',
    name: 'SQL 전문가',
    icon: CircleStackIcon,
    color: 'from-indigo-400 to-indigo-600',
    description: '데이터베이스 설계, 쿼리 최적화, 데이터 분석',
    expertise: ['MySQL', 'PostgreSQL', 'Query Optimization', 'Data Modeling'],
    greeting: 'SQL과 데이터베이스 설계를 마스터해보세요!'
  },
  {
    id: 'ai',
    category: 'development',
    name: 'AI 전문가',
    icon: CpuChipIcon,
    color: 'from-pink-400 to-pink-600',
    description: '머신러닝, 딥러닝, 자연어 처리, 컴퓨터 비전',
    expertise: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
    greeting: 'AI와 머신러닝의 세계로 안내해드리겠습니다.'
  },
  {
    id: 'orm',
    category: 'development',
    name: 'ORM 전문가',
    icon: TableCellsIcon,
    color: 'from-emerald-400 to-emerald-600',
    description: 'Sequelize, Prisma, TypeORM, 데이터베이스 매핑',
    expertise: ['Sequelize', 'Prisma', 'TypeORM', 'Database Mapping'],
    greeting: 'ORM을 활용한 효율적인 데이터베이스 작업을 도와드립니다.'
  },
  {
    id: 'component-manager',
    category: 'development',
    name: '공통 컴포넌트 관리자',
    icon: PuzzlePieceIcon,
    color: 'from-lime-400 to-lime-600',
    description: '재사용 컴포넌트 설계, 라이브러리 관리, 디자인 시스템',
    expertise: ['Design System', '컴포넌트 설계', 'Storybook', '재사용성'],
    greeting: '효율적인 컴포넌트 시스템을 구축해보세요!'
  },
  {
    id: 'figma-expert',
    category: 'development',
    name: '피그마 전문가',
    icon: SwatchIcon,
    color: 'from-purple-500 to-purple-700',
    description: 'UI/UX 디자인, 프로토타이핑, 디자인 시스템 구축',
    expertise: ['Figma', 'UI/UX Design', 'Prototyping', 'Design Token'],
    greeting: '디자인부터 개발까지 완벽한 UI/UX를 만들어보세요!'
  },
  {
    id: 'app-developer',
    category: 'development',
    name: '앱 개발 전문가',
    icon: DevicePhoneMobileIcon,
    color: 'from-pink-500 to-pink-700',
    description: 'React Native, Flutter, 하이브리드 앱 개발',
    expertise: ['React Native', 'Flutter', 'iOS', 'Android', '하이브리드 앱'],
    greeting: '모바일 앱 개발의 모든 것을 도와드리겠습니다!'
  },

  // 📚 교육봇 카테고리
  {
    id: 'english',
    category: 'education',
    name: '영어 교육 전문가',
    icon: LanguageIcon,
    color: 'from-cyan-400 to-cyan-600',
    description: '개발자 영어, 기술 영어, 영어 면접',
    expertise: ['기술 영어', '영어 면접', 'IT 용어', '영어 회화'],
    greeting: '개발자를 위한 영어 교육을 시작해보세요!'
  },
  {
    id: 'academy',
    category: 'education',
    name: '학원 안내 전문가',
    icon: BuildingLibraryIcon,
    color: 'from-violet-400 to-violet-600',
    description: '개발 교육, 부트캠프, 온라인 강의 추천',
    expertise: ['부트캠프', '온라인 강의', '개발 교육', '커리큘럼'],
    greeting: '최적의 개발 교육 과정을 찾아드리겠습니다.'
  },
  {
    id: 'interview',
    category: 'education',
    name: '면접 전문가',
    icon: UserGroupIcon,
    color: 'from-red-400 to-red-600',
    description: '기술 면접, 코딩 테스트, 면접 준비',
    expertise: ['기술 면접', '코딩 테스트', '면접 준비', '이력서'],
    greeting: '성공적인 개발자 면접을 위해 함께 준비해보세요!'
  },

  // 📋 문서 관리봇 카테고리
  {
    id: 'memo',
    category: 'document',
    name: '메모장 전문가',
    icon: DocumentTextIcon,
    color: 'from-slate-400 to-slate-600',
    description: '노트 정리, 문서화, 지식 관리',
    expertise: ['문서화', '노트 정리', '지식 관리', 'Markdown'],
    greeting: '체계적인 메모와 문서 관리를 도와드립니다.'
  },
  {
    id: 'pilot-pm',
    category: 'document',
    name: '파일럿 프로젝트 관리자',
    icon: ClipboardDocumentListIcon,
    color: 'from-rose-400 to-rose-600',
    description: '파일럿 프로젝트 기획, 일정 관리, 위험 분석',
    expertise: ['프로젝트 기획', '일정 관리', '위험 분석', 'MVP 설계'],
    greeting: '성공적인 파일럿 프로젝트를 함께 계획해보세요!'
  },

  // 🛠️ 유틸봇 카테고리
  {
    id: 'schedule-manager',
    category: 'utils',
    name: '일정 관리자',
    icon: CalendarIcon,
    color: 'from-sky-400 to-sky-600',
    description: '개발 일정, 마일스톤 관리, 팀 스케줄링',
    expertise: ['일정 관리', '마일스톤', '스프린트', '팀 협업'],
    greeting: '체계적인 프로젝트 일정 관리를 도와드립니다!'
  },
  {
    id: 'assistant',
    category: 'utils',
    name: '비서 로봇',
    icon: ComputerDesktopIcon,
    color: 'from-gray-400 to-gray-600',
    description: '일정 관리, 업무 정리, 생산성 향상',
    expertise: ['일정 관리', '업무 정리', '생산성', '시간 관리'],
    greeting: '효율적인 업무 관리를 도와드리겠습니다.'
  },

  // 👥 커뮤니티봇 카테고리
  {
    id: 'callcenter',
    category: 'community',
    name: '콜센터 전문가',
    icon: PhoneIcon,
    color: 'from-teal-400 to-teal-600',
    description: '고객 서비스, 상담 스크립트, CRM 시스템',
    expertise: ['Customer Service', 'CRM', '상담 기법', '고객 관리'],
    greeting: '고객 서비스와 상담의 전문가입니다.'
  },
  {
    id: 'wishket',
    category: 'community',
    name: '위시켓 전문가',
    icon: BriefcaseIcon,
    color: 'from-amber-400 to-amber-600',
    description: '프리랜싱, 프로젝트 관리, 위시켓 플랫폼 활용',
    expertise: ['프리랜싱', '프로젝트 관리', '위시켓', '외주 관리'],
    greeting: '성공적인 프리랜싱 프로젝트를 위해 도움을 드립니다.'
  },
  {
    id: 'ecommerce',
    category: 'community',
    name: '쇼핑몰 전문가',
    icon: ShoppingBagIcon,
    color: 'from-orange-400 to-orange-600',
    description: '이커머스, 결제 시스템, 쇼핑몰 운영',
    expertise: ['E-commerce', '결제 연동', '상품 관리', '주문 처리'],
    greeting: '성공적인 온라인 쇼핑몰을 만들어보세요!'
  },

  // 📰 뉴스봇 카테고리
  {
    id: 'tech-news',
    category: 'news',
    name: '기술 뉴스 전문가',
    icon: NewspaperIcon,
    color: 'from-blue-500 to-blue-700',
    description: '최신 기술 동향, 개발 트렌드, 업계 뉴스',
    expertise: ['기술 트렌드', '업계 동향', '오픈소스', '개발자 뉴스'],
    greeting: '최신 기술 동향과 개발 뉴스를 전해드립니다!'
  },
  {
    id: 'startup-news',
    category: 'news',
    name: '스타트업 뉴스봇',
    icon: NewspaperIcon,
    color: 'from-green-500 to-green-700',
    description: '스타트업 소식, 투자 동향, 창업 정보',
    expertise: ['스타트업', '투자 동향', '창업', '비즈니스 모델'],
    greeting: '스타트업과 창업 생태계의 최신 소식을 알려드립니다!'
  }
];