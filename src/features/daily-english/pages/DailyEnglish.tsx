import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import FullScreenSlideDialog from "../../../components/ui/FullScreenSlideDialog";
import { Button } from "../../../components/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";

interface ScenarioItem {
  id: string;
  category: string;
  title: string;
  description: string;
}

const BASIC_SCENARIOS: ScenarioItem[] = [
  {
    id: "everyday-1",
    category: "일상생활 (Everyday Life)",
    title: "호텔 객실 예약 및 체크인/체크아웃",
    description:
      "전화 또는 프런트 데스크에서 원하는 객실 유형, 숙박 날짜, 특별 요청사항 등을 문의하고 답하는 대화",
  },
  {
    id: "everyday-2",
    category: "일상생활 (Everyday Life)",
    title: "카페 또는 레스토랑에서 주문",
    description:
      "메뉴 추천 요청, 주문 변경, 계산 요청 등 점원과 고객 사이의 다양한 대화",
  },
  {
    id: "everyday-3",
    category: "일상생활 (Everyday Life)",
    title: "길 찾기 및 교통수단 이용",
    description:
      "행인이 길을 묻거나, 버스/지하철 노선 및 환승 정보를 문의하는 상황",
  },
  {
    id: "everyday-4",
    category: "일상생활 (Everyday Life)",
    title: "쇼핑 (옷/전자제품/식료품)",
    description:
      "매장에서 원하는 물건을 찾고, 사이즈나 색상 교환, 환불을 요청하는 대화",
  },
  {
    id: "everyday-5",
    category: "일상생활 (Everyday Life)",
    title: "공항 이용",
    description:
      "항공권 발권, 수하물 부치기, 보안 검색대 통과, 탑승 안내 방송 등 공항에서 겪는 다양한 상황",
  },
  {
    id: "everyday-6",
    category: "일상생활 (Everyday Life)",
    title: "병원 예약 및 진료",
    description:
      "증상 설명, 의사의 진단 및 처방, 다음 진료 예약 등 병원에서 이루어지는 대화",
  },
  {
    id: "everyday-7",
    category: "일상생활 (Everyday Life)",
    title: "전화 통화 (약속 잡기/변경)",
    description:
      "친구나 직장 동료와 약속 시간을 정하거나 변경하고, 약속 장소를 정하는 통화 내용",
  },
  {
    id: "everyday-8",
    category: "일상생활 (Everyday Life)",
    title: "취미 및 여가 활동에 대한 대화",
    description:
      "주말 계획, 좋아하는 영화나 음악, 운동 등 개인적인 관심사에 대해 이야기하는 친구 간의 대화",
  },
  {
    id: "everyday-9",
    category: "일상생활 (Everyday Life)",
    title: "은행 업무 (계좌 개설, 송금)",
    description:
      "은행원에게 계좌 개설을 요청하고, 필요한 서류를 작성하며, 해외 송금에 대해 문의하는 상황",
  },
  {
    id: "everyday-10",
    category: "일상생활 (Everyday Life)",
    title: "우체국 이용 (소포 보내기, 우표 구매)",
    description:
      "소포를 보내기 위해 주소를 기입하고, 배송 옵션을 선택하며, 우표를 구매하는 대화",
  },
  {
    id: "everyday-11",
    category: "일상생활 (Everyday Life)",
    title: "미용실 또는 이발소 예약 및 스타일 요청",
    description:
      "원하는 헤어스타일을 설명하고, 예약 시간을 정하며, 가격에 대해 문의하는 대화",
  },
  {
    id: "everyday-12",
    category: "일상생활 (Everyday Life)",
    title: "세탁소 이용 (세탁물 맡기기, 찾기)",
    description:
      "얼룩 제거를 요청하고, 세탁 완료 시간을 확인하며, 세탁물을 찾아가는 과정",
  },
  {
    id: "everyday-13",
    category: "일상생활 (Everyday Life)",
    title: "자동차 정비소 방문",
    description:
      "차량의 문제점을 설명하고, 수리 견적을 받으며, 정비 예약을 하는 대화",
  },
  {
    id: "everyday-14",
    category: "일상생활 (Everyday Life)",
    title: "영화관 티켓 예매 및 상영관 찾기",
    description:
      "온라인 또는 현장에서 영화표를 예매하고, 좌석을 선택하며, 상영관을 찾는 과정",
  },
  {
    id: "everyday-15",
    category: "일상생활 (Everyday Life)",
    title: "공연 티켓 예매 및 문의",
    description:
      "콘서트나 연극 티켓을 예매하고, 공연 정보에 대해 문의하며, 환불 규정을 확인하는 대화",
  },
  {
    id: "everyday-16",
    category: "일상생활 (Everyday Life)",
    title: "스포츠 경기 관람",
    description:
      "경기 규칙에 대해 질문하고, 응원하는 팀에 대해 이야기하며, 경기장 내 편의시설을 이용하는 상황",
  },
  {
    id: "everyday-17",
    category: "일상생활 (Everyday Life)",
    title: "반려동물 병원 방문",
    description:
      "반려동물의 건강 상태를 설명하고, 수의사의 진료를 받으며, 예방 접종에 대해 상담하는 대화",
  },
  {
    id: "everyday-18",
    category: "일상생활 (Everyday Life)",
    title: "음식 배달 주문",
    description:
      "전화나 앱을 통해 음식을 주문하고, 배달 주소를 확인하며, 결제 방법을 선택하는 대화",
  },
  {
    id: "everyday-19",
    category: "일상생활 (Everyday Life)",
    title: "가구 또는 가전제품 구매 및 배송 문의",
    description:
      "제품의 특징과 가격을 비교하고, 배송 날짜를 조율하며, 설치 서비스에 대해 문의하는 상황",
  },
  {
    id: "everyday-20",
    category: "일상생활 (Everyday Life)",
    title: "고객센터 문의 (제품 불량, 서비스 불만)",
    description:
      "구매한 제품의 문제점을 설명하고, 교환 또는 환불을 요청하며, 서비스 개선을 요구하는 대화",
  },
  {
    id: "social-1",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "여행 계획 짜기 (항공권, 숙소, 일정 논의)",
    description:
      "친구나 가족과 함께 여행지를 정하고, 예산을 계획하며, 세부 일정을 논의하는 대화",
  },
  {
    id: "social-2",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "새로운 이웃과 인사 나누기",
    description:
      "처음 만난 이웃에게 자신을 소개하고, 동네 정보에 대해 질문하며, 친목을 다지는 대화",
  },
  {
    id: "social-3",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "집들이 초대 및 대화",
    description:
      "친구들을 집에 초대하고, 음식을 대접하며, 집 구경을 시켜주는 등 즐거운 시간을 보내는 상황",
  },
  {
    id: "social-4",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "명절 또는 기념일 계획",
    description:
      "가족과 함께 명절 음식을 준비하고, 기념일을 축하하며, 특별한 이벤트를 계획하는 대화",
  },
  {
    id: "social-5",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "정치 및 사회 문제에 대한 토론",
    description:
      "현재 사회적으로 이슈가 되는 문제에 대해 자신의 의견을 말하고, 다른 사람의 생각을 경청하며 토론하는 대화",
  },
  {
    id: "social-6",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "환경 문제에 대한 토의",
    description:
      "기후 변화, 재활용, 환경 보호 등 지구 환경 문제에 대해 심각성을 인지하고, 해결 방안을 모색하는 대화",
  },
  {
    id: "social-7",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "기술 발전과 미래 사회에 대한 대화",
    description:
      "인공지능, 자율주행, 가상현실 등 최신 기술이 우리 삶에 미칠 영향에 대해 예측하고 토론하는 대화",
  },
  {
    id: "social-8",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "인공지능(AI)과 윤리에 대한 토론",
    description:
      "AI의 발전이 가져올 윤리적인 문제에 대해 고민하고, 인간과 AI의 공존에 대해 토론하는 대화",
  },
  {
    id: "social-9",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "문화 차이에 대한 이해와 존중",
    description:
      "다른 나라의 문화와 관습에 대해 배우고, 문화적 차이에서 오는 오해를 풀며, 서로를 존중하는 대화",
  },
  {
    id: "social-10",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "성격 및 가치관에 대한 대화",
    description:
      "MBTI 등 성격 유형에 대해 이야기하고, 각자의 가치관과 삶의 우선순위에 대해 공유하는 대화",
  },
  {
    id: "social-11",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "연애 및 결혼에 대한 생각 나누기",
    description:
      "이상형, 연애 스타일, 결혼에 대한 가치관 등 사랑과 관계에 대한 솔직한 생각을 나누는 대화",
  },
  {
    id: "social-12",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "자녀 교육에 대한 의견 교환",
    description:
      "자녀의 학습 방법, 진로 고민, 인성 교육 등 교육적인 문제에 대해 부모나 교사와 상담하는 대화",
  },
  {
    id: "social-13",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "인생 목표 및 꿈에 대한 이야기",
    description:
      "장래 희망, 이루고 싶은 목표, 인생의 꿈에 대해 이야기하며 서로를 응원하는 대화",
  },
  {
    id: "social-14",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "어려움과 고민 상담",
    description:
      "힘든 일이 있을 때 친구나 가족에게 고민을 털어놓고, 조언을 구하며 위로를 받는 대화",
  },
  {
    id: "social-15",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "성공과 실패 경험담 공유",
    description:
      "자신의 성공 경험을 통해 얻은 교훈을 나누고, 실패를 극복한 이야기를 통해 용기를 주는 대화",
  },
  {
    id: "social-16",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "감사 표현 및 칭찬",
    description:
      "다른 사람의 도움에 대해 진심으로 감사함을 표현하고, 상대방의 장점을 칭찬하며 긍정적인 관계를 형성하는 대화",
  },
  {
    id: "social-17",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "사과 및 용서",
    description:
      "자신의 잘못을 인정하고 진심으로 사과하며, 상대방의 사과를 받아들이고 용서하는 과정을 담은 대화",
  },
  {
    id: "social-18",
    category: "사회생활 및 관계 (Social Life & Relationships)",
    title: "축하 및 위로",
    description:
      "생일, 졸업, 취업 등 기쁜 일을 함께 축하하고, 슬픈 일을 겪은 사람에게 따뜻한 위로의 말을 건네는 대화",
  },
  {
    id: "business-1",
    category: "비즈니스 및 학업 (Business & Academic)",
    title: "회의 (의견 제시 및 토론)",
    description:
      "특정 안건에 대해 자신의 의견을 제시하고, 다른 사람의 의견에 동의하거나 반박하며 토론하는 회의 상황",
  },
  {
    id: "business-2",
    category: "비즈니스 및 학업 (Business & Academic)",
    title: "프레젠테이션 및 질의응답",
    description:
      "신제품 발표, 분기별 실적 보고 등 공식적인 프레젠테이션과 그에 대한 청중의 질문에 답변하는 내용",
  },
  {
    id: "business-3",
    category: "비즈니스 및 학업 (Business & Academic)",
    title: "동료와의 업무 협업",
    description:
      "프로젝트 진행 상황을 공유하고, 서로의 역할 분담에 대해 논의하며 문제를 함께 해결해 나가는 대화",
  },
  {
    id: "business-4",
    category: "비즈니스 및 학업 (Business & Academic)",
    title: "상사에게 업무 보고",
    description:
      "진행 중인 업무의 성과와 문제점을 상사에게 명확하게 보고하고, 피드백을 받는 상황",
  },
  {
    id: "business-5",
    category: "비즈니스 및 학업 (Business & Academic)",
    title: "부하 직원에게 업무 지시",
    description:
      "부하 직원에게 업무의 목표와 기대치를 명확하게 전달하고, 동기를 부여하며 업무를 지시하는 대화",
  },
  {
    id: "business-6",
    category: "비즈니스 및 학업 (Business & Academic)",
    title: "고객 불만 처리",
    description:
      "화가 난 고객의 불만을 경청하고, 문제의 원인을 파악하며, 해결책을 제시하는 고객 응대 상황",
  },
  {
    id: "business-7",
    category: "비즈니스 및 학업 (Business & Academic)",
    title: "협상 (가격, 계약 조건)",
    description:
      "비즈니스 파트너와 가격을 흥정하고, 계약 조건을 조율하며, 상호 이익이 되는 합의점을 찾아가는 과정",
  },
  {
    id: "business-8",
    category: "비즈니스 및 학업 (Business & Academic)",
    title: "대학교 수업 소개 (오리엔테이션)",
    description:
      "교수가 한 학기 동안 진행될 수업의 목표, 평가 기준, 과제 등에 대해 설명하는 강의 첫 부분",
  },
  {
    id: "business-9",
    category: "비즈니스 및 학업 (Business & Academic)",
    title: "학술 강의 (다양한 전공)",
    description:
      "역사, 과학, 심리학 등 특정 학문 분야에 대한 교수의 심도 있는 강의",
  },
  {
    id: "business-10",
    category: "비즈니스 및 학업 (Business & Academic)",
    title: "도서관 이용 안내",
    description:
      "도서 대출 및 반납 방법, 자료 검색, 스터디룸 예약 등 도서관 시설 이용에 관한 안내 방송 또는 대화",
  },
  {
    id: "business-11",
    category: "비즈니스 및 학업 (Business & Academic)",
    title: "유학 준비 (상담 및 절차)",
    description:
      "유학원에서 희망하는 국가와 학교에 대한 정보를 얻고, 지원 절차에 대해 상담하는 대화",
  },
  {
    id: "business-12",
    category: "비즈니스 및 학업 (Business & Academic)",
    title: "팀 프로젝트 (역할 분담 및 의견 조율)",
    description:
      "조원들과 함께 프로젝트 주제를 정하고, 각자의 역할을 분담하며, 의견 차이를 조율하여 과제를 완성해 나가는 과정",
  },
];

type PracticeMode = "basic" | "youtube" | "news";
const CATEGORY_ORDER = [
  "일상생활 (Everyday Life)",
  "사회생활 및 관계 (Social Life & Relationships)",
  "비즈니스 및 학업 (Business & Academic)",
];
const CATEGORY_LABELS: Record<string, string> = {
  "일상생활 (Everyday Life)": "일상생활",
  "사회생활 및 관계 (Social Life & Relationships)": "사회생활 · 관계",
  "비즈니스 및 학업 (Business & Academic)": "비즈니스 · 학업",
};

export default function DailyEnglish() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<PracticeMode | null>(null);
  const [isBasicDialogOpen, setIsBasicDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(
    CATEGORY_ORDER[0],
  );
  const [focusedScenarioId, setFocusedScenarioId] = useState<string | null>(
    null,
  );
  const [generatedScenarios, setGeneratedScenarios] = useState<ScenarioItem[]>(
    [],
  );

  const groupedScenarios = useMemo(
    () =>
      BASIC_SCENARIOS.reduce<Record<string, ScenarioItem[]>>((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {}),
    [],
  );
  const scenarioLookup = useMemo(() => {
    const map = new Map<string, ScenarioItem>();
    BASIC_SCENARIOS.forEach((item) => map.set(item.id, item));
    return map;
  }, []);
  const availableCategories = useMemo(
    () =>
      CATEGORY_ORDER.filter((category) =>
        Boolean(groupedScenarios[category]?.length),
      ),
    [groupedScenarios],
  );
  const filteredScenarios = useMemo(
    () => groupedScenarios[activeCategory] ?? [],
    [groupedScenarios, activeCategory],
  );

  const handleModeSelect = (mode: PracticeMode) => {
    setSelectedMode(mode);

    if (mode === "basic") {
      const defaultCategory =
        generatedScenarios[0]?.category ??
        (focusedScenarioId
          ? scenarioLookup.get(focusedScenarioId)?.category
          : undefined) ??
        availableCategories[0] ??
        CATEGORY_ORDER[0];
      setActiveCategory(defaultCategory);
      setIsBasicDialogOpen(true);
    }
  };

  const handleScenarioSelect = (scenario: ScenarioItem) => {
    setFocusedScenarioId(scenario.id);
  };

  const handleOpenBasicSettings = () => {
    console.log("베이직 모드 설정은 준비 중입니다.");
  };

  const handleGenerateScenario = () => {
    const sourceList =
      filteredScenarios.length >= 3 ? filteredScenarios : BASIC_SCENARIOS;
    if (sourceList.length === 0) {
      return;
    }

    const shuffled = [...sourceList];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selection = shuffled.slice(0, Math.min(3, shuffled.length));
    setGeneratedScenarios(selection);
    setFocusedScenarioId(selection[0]?.id ?? null);
    setSelectedMode("basic");
    setIsBasicDialogOpen(false);
  };

  const handleStartScenario = (scenario: ScenarioItem) => {
    setFocusedScenarioId(scenario.id);
    sessionStorage.setItem("dailyExamScenario", JSON.stringify(scenario));
    navigate("/daily-english-conversation", { state: { scenario } });
  };

  useEffect(() => {
    if (isBasicDialogOpen) {
      const defaultCategory =
        generatedScenarios[0]?.category ??
        (focusedScenarioId
          ? scenarioLookup.get(focusedScenarioId)?.category
          : undefined) ??
        availableCategories[0] ??
        CATEGORY_ORDER[0];
      setActiveCategory(defaultCategory);
    }
  }, [
    isBasicDialogOpen,
    generatedScenarios,
    focusedScenarioId,
    scenarioLookup,
    availableCategories,
  ]);

  return (
    <div className="min-h-screen bg-background">
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <span className="text-sm">🇺🇸</span>
          </div>
          <span className="text-sm font-medium text-foreground">일일 영어</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          뒤로
        </Button>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              mode: "basic" as PracticeMode,
              title: "베이직",
              description: "상황별 회화 훈련을 위한 기본 연습 세트",
              icon: "🗣️",
            },
            {
              mode: "youtube" as PracticeMode,
              title: "유튜브",
              description: "유튜브 영상 기반 리스닝 & 쉐도잉 연습 (준비 중)",
              icon: "📺",
            },
            {
              mode: "news" as PracticeMode,
              title: "뉴스",
              description: "뉴스 기사로 학습하는 고급 독해/리스닝 (준비 중)",
              icon: "📰",
            },
          ].map((option) => {
            const isActive = selectedMode === option.mode;

            return (
              <button
                key={option.mode}
                type="button"
                onClick={() => handleModeSelect(option.mode)}
                className={`relative flex flex-col gap-3 rounded-xl border p-5 text-left transition-all ${
                  isActive
                    ? "border-blue-500 shadow-lg ring-2 ring-blue-200 bg-blue-50/60"
                    : "border-border hover:border-blue-200 hover:bg-blue-50/30"
                }`}
              >
                <span className="text-3xl" aria-hidden>
                  {option.icon}
                </span>
                <div>
                  <div className="text-base font-semibold text-foreground">
                    {option.title}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {selectedMode === "basic" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                베이직 회화 연습
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBasicDialogOpen(true)}
              >
                상황 다시 선택하기
              </Button>
            </div>

            {generatedScenarios.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {generatedScenarios.map((scenario, index) => (
                  <Card key={scenario.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>주제 {index + 1}</CardTitle>
                        <span className="text-xs font-medium text-blue-600">
                          {CATEGORY_LABELS[scenario.category] ??
                            scenario.category}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground mt-2">
                        {scenario.title}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {scenario.description}
                      </p>
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => handleStartScenario(scenario)}
                      >
                        🎤 대화 시작
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    위의 베이직 카드에서 상황 선택을 눌러 주제를 생성하면 연습
                    카드가 보여집니다.
                  </p>
                  <Button onClick={() => setIsBasicDialogOpen(true)}>
                    상황 선택하기
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {selectedMode === "youtube" && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>유튜브 기반 학습</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                유튜브 영상과 함께하는 리스닝·쉐도잉 연습을 준비 중입니다. 곧
                다양한 콘텐츠로 찾아올게요!
              </p>
            </CardContent>
          </Card>
        )}

        {selectedMode === "news" && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>뉴스 학습</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                최신 뉴스 기사로 독해와 리스닝을 동시에 연습할 수 있는 모듈을
                개발 중입니다.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <FullScreenSlideDialog
        isOpen={isBasicDialogOpen}
        onClose={() => setIsBasicDialogOpen(false)}
        title="베이직 회화 상황 선택"
      >
        <div className="h-full overflow-y-auto bg-background">
          <div className="px-4 py-6 sm:px-6">
            <p className="text-sm text-muted-foreground">
              연습하고 싶은 상황을 선택하면 해당 주제에 맞는 기본 회화 문제가
              제공됩니다.
            </p>

            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-2">
                <div className="flex flex-1 flex-nowrap gap-2 overflow-x-auto pb-1">
                  {availableCategories.map((category) => {
                    const isActiveCategory = activeCategory === category;

                    return (
                      <Button
                        key={category}
                        size="sm"
                        variant={isActiveCategory ? "default" : "outline"}
                        onClick={() => setActiveCategory(category)}
                        className={`whitespace-nowrap ${
                          isActiveCategory
                            ? "shadow-md ring-2 ring-blue-200"
                            : ""
                        }`}
                      >
                        {CATEGORY_LABELS[category] ?? category}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-shrink-0"
                  onClick={handleOpenBasicSettings}
                  aria-label="베이직 설정"
                >
                  <Cog6ToothIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={handleGenerateScenario}
                >
                  생성
                </Button>
              </div>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {CATEGORY_LABELS[activeCategory] ?? activeCategory}
                </h3>
                <div className="space-y-3">
                  {filteredScenarios.map((item) => {
                    const isSelected = focusedScenarioId === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleScenarioSelect(item)}
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/80 shadow-sm ring-2 ring-blue-200"
                            : "border-border bg-card/60 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        <div className="text-sm font-medium text-foreground">
                          {item.title}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      </FullScreenSlideDialog>
    </div>
  );
}
