import {
  CodeBracketIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';

export interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
}

export const categories: Category[] = [
  { id: 'development', name: '개발봇', icon: CodeBracketIcon, description: '개발 기술과 코딩 실무' },
  { id: 'education', name: '교육봇', icon: BuildingLibraryIcon, description: '학습과 교육 과정' },
  { id: 'document', name: '문서 관리봇', icon: DocumentTextIcon, description: '문서화와 정리' },
  { id: 'utils', name: '유틸봇', icon: CalendarIcon, description: '일정 관리와 도구 관리' },
  { id: 'community', name: '커뮤니티봇', icon: ChatBubbleLeftRightIcon, description: '소통과 협업' },
  { id: 'news', name: '뉴스봇', icon: NewspaperIcon, description: '최신 정보와 트렌드' }
];