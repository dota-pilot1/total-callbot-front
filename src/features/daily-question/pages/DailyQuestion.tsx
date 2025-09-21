import { useNavigate } from "react-router-dom";
import {
  useTodayQuestionSet,
  useDailyQuestionStatistics,
} from "../api/useDailyQuestions";
import { Button } from "../../../components/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui";
import { Badge } from "../../../components/ui";
import {
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  CalculatorIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// Simple date formatter helper
const formatDate = (
  date: Date,
  formatType: "date" | "display" | "time" = "date",
) => {
  if (formatType === "date") {
    return date.toISOString().split("T")[0]; // yyyy-mm-dd
  } else if (formatType === "display") {
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else if (formatType === "time") {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
  return date.toString();
};

export default function DailyQuestion() {
  const navigate = useNavigate();
  const selectedDate = formatDate(new Date(), "date");

  const {
    data: questionSet,
    isLoading,
    error,
    refetch,
  } = useTodayQuestionSet();

  const { data: stats } = useDailyQuestionStatistics();

  const categories = [
    {
      id: "conversation",
      title: "English Conversation",
      subtitle: "영어 회화",
      description: "실생활 영어 대화 문제 9개",
      icon: ChatBubbleLeftRightIcon,
      color: "blue",
      questionCount: 9,
    },
    {
      id: "reading",
      title: "English Reading",
      subtitle: "영어 독해",
      description: "독해력 향상 문제 9개",
      icon: BookOpenIcon,
      color: "green",
      questionCount: 9,
    },
    {
      id: "math",
      title: "Mathematics",
      subtitle: "수학",
      description: "다양한 수학 문제 9개",
      icon: CalculatorIcon,
      color: "purple",
      questionCount: 9,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "READY":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 border-green-200"
          >
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            준비 완료
          </Badge>
        );
      case "GENERATING":
        return (
          <Badge
            variant="default"
            className="bg-blue-100 text-blue-800 border-blue-200"
          >
            <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
            생성 중
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive">
            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
            생성 실패
          </Badge>
        );
      case "NOT_GENERATED":
        return (
          <Badge variant="secondary">
            <ClockIcon className="w-3 h-3 mr-1" />
            대기 중
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (questionSet?.status === "READY") {
      // 각 카테고리별 문제 페이지로 이동
      navigate(`/daily-questions/${categoryId}?date=${selectedDate}`);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">
              오류가 발생했습니다
            </CardTitle>
            <CardDescription>
              {error instanceof Error
                ? error.message
                : "데이터를 불러올 수 없습니다"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} className="w-full">
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Daily Questions
              </h1>
              <p className="text-muted-foreground mt-1">
                매일 새로운 문제로 실력을 향상시키세요
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="w-4 h-4" />
              {formatDate(new Date(), "display")}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ChartBarIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      총 문제 세트
                    </p>
                    <p className="text-xl font-semibold">{stats.totalSets}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">준비 완료</p>
                    <p className="text-xl font-semibold">{stats.readySets}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <ArrowPathIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">생성 중</p>
                    <p className="text-xl font-semibold">
                      {stats.generatingSets}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpenIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">총 문제</p>
                    <p className="text-xl font-semibold">
                      {stats.totalQuestions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Today's Status */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>오늘의 문제 상태</CardTitle>
                <CardDescription>
                  {formatDate(new Date(), "display")} 문제 현황
                </CardDescription>
              </div>
              {questionSet && getStatusBadge(questionSet.status)}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                상태를 확인하는 중...
              </div>
            ) : questionSet ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    전체 문제 수
                  </span>
                  <span className="font-medium">
                    {questionSet.totalQuestionCount}개
                  </span>
                </div>
                {questionSet.generationStartTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      생성 시작
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(
                        new Date(questionSet.generationStartTime),
                        "time",
                      )}
                    </span>
                  </div>
                )}
                {questionSet.errorMessage && (
                  <div className="p-3 bg-destructive/10 rounded-lg">
                    <p className="text-sm text-destructive">
                      {questionSet.errorMessage}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                오늘의 문제를 불러올 수 없습니다.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isAvailable = questionSet?.status === "READY";

            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all duration-200 ${
                  isAvailable
                    ? "hover:shadow-lg hover:-translate-y-1"
                    : "opacity-60 cursor-not-allowed"
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-lg ${
                        category.color === "blue"
                          ? "bg-blue-100"
                          : category.color === "green"
                            ? "bg-green-100"
                            : "bg-purple-100"
                      }`}
                    >
                      <IconComponent
                        className={`w-6 h-6 ${
                          category.color === "blue"
                            ? "text-blue-600"
                            : category.color === "green"
                              ? "text-green-600"
                              : "text-purple-600"
                        }`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {category.title}
                      </CardTitle>
                      <CardDescription>{category.subtitle}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {category.questionCount}문제
                      </Badge>
                      <Badge variant="outline">약 30분</Badge>
                    </div>
                    {isAvailable && <Button size="sm">시작하기</Button>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
