// 영어 학습 시험 주제들
export const EXAM_TOPICS = [
  {
    id: 1,
    en: "Personal statement & career goals",
    ko: "개인 소개와 진로 목표",
  },
  {
    id: 2,
    en: "Job interview (behavioral & technical)",
    ko: "면접(행동/기술)",
  },
  {
    id: 3,
    en: "Project explanation & trade-offs",
    ko: "프로젝트 설명과 트레이드오프",
  },
  {
    id: 4,
    en: "Technical troubleshooting & root cause",
    ko: "기술 트러블슈팅과 원인 분석",
  },
  {
    id: 5,
    en: "Data interpretation (charts/tables)",
    ko: "데이터 해석(차트/표 설명)",
  },
  { id: 6, en: "Product pitch & sales", ko: "제품 피치/세일즈" },
  { id: 7, en: "Customer support escalation", ko: "고객 지원/에스컬레이션" },
  { id: 8, en: "Negotiation & compromise", ko: "협상과 타협" },
  {
    id: 9,
    en: "Meeting facilitation & action items",
    ko: "회의 진행과 액션아이템 정리",
  },
  { id: 10, en: "Cross-cultural communication", ko: "다문화 커뮤니케이션" },
  { id: 11, en: "Ethical dilemma discussion", ko: "윤리적 딜레마 토론" },
  {
    id: 12,
    en: "Crisis communication & apology",
    ko: "위기 커뮤니케이션/사과",
  },
  { id: 13, en: "Email etiquette & drafting", ko: "이메일 에티켓/작성" },
  { id: 14, en: "Presentation Q&A handling", ko: "발표 질의응답 대응" },
  { id: 15, en: "Travel & immigration interview", ko: "여행/출입국 인터뷰" },
  { id: 16, en: "Healthcare/doctor consultation", ko: "병원/의료 상담" },
  { id: 17, en: "Banking & finance appointment", ko: "은행/금융 상담" },
  {
    id: 18,
    en: "Academic discussion & summarization",
    ko: "학술 토론과 요약",
  },
  { id: 19, en: "News summary & opinion", ko: "뉴스 요약과 의견" },
  {
    id: 20,
    en: "Remote collaboration tools & process",
    ko: "원격 협업 도구/프로세스",
  },
] as const;

export type ExamTopic = typeof EXAM_TOPICS[number];
