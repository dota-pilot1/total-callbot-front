import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../../../components/ui";
import { Card, CardContent } from "../../../components/ui/Card";
import FullScreenSlideDialog from "../../../components/ui/FullScreenSlideDialog";
import ScenarioTemplateHeader from "../components/ScenarioTemplateHeader";
import {
  useFilteredScenarioTemplates,
  useScenarioTemplateCategories,
  useCopyScenarioTemplate,
} from "../hooks/useScenarioTemplates";
import type {
  ScenarioTemplate,
  Difficulty,
  ScenarioTemplateFilters,
} from "../types";

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  BEGINNER: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  BEGINNER: "text-green-600",
  INTERMEDIATE: "text-blue-600",
  ADVANCED: "text-red-600",
};

export default function ConversationScenarioTemplateList() {
  const navigate = useNavigate();
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ScenarioTemplate | null>(null);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<ScenarioTemplateFilters>({});
  const [searchQuery, setSearchQuery] = useState("");

  // 복사 폼 상태
  const [copyForm, setCopyForm] = useState({
    title: "",
    category: "",
    isPrivate: true,
  });

  // API 훅들
  const currentFilters = useMemo(
    () => ({
      ...filters,
      search: searchQuery.trim() || undefined,
      page,
      size: 20,
    }),
    [filters, searchQuery, page],
  );

  const {
    data: templatesData,
    isLoading: templatesLoading,
    error: templatesError,
  } = useFilteredScenarioTemplates(currentFilters);

  const { data: categories = [] } = useScenarioTemplateCategories();
  const copyMutation = useCopyScenarioTemplate();

  const scenarios = templatesData?.scenarios || [];
  const hasNextPage = templatesData?.hasNext || false;

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0); // 검색 시 첫 페이지로 리셋
  };

  const handleFilterChange = (newFilters: Partial<ScenarioTemplateFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(0); // 필터 변경 시 첫 페이지로 리셋
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery("");
    setPage(0);
  };

  const handleCopyRequest = (template: ScenarioTemplate) => {
    setSelectedTemplate(template);
    setCopyForm({
      title: `${template.title} (복사본)`,
      category: template.category,
      isPrivate: true,
    });
    setIsCopyDialogOpen(true);
  };

  const handleCopySubmit = async () => {
    if (!selectedTemplate) return;

    try {
      await copyMutation.mutateAsync({
        id: selectedTemplate.id,
        request: {
          sourceScenarioId: selectedTemplate.id,
          title: copyForm.title.trim() || undefined,
          category: copyForm.category.trim() || undefined,
          isPrivate: copyForm.isPrivate,
        },
      });

      setIsCopyDialogOpen(false);
      setSelectedTemplate(null);

      // 성공 메시지 표시 (간단한 alert, 추후 toast로 개선 가능)
      alert("시나리오가 성공적으로 복사되었습니다!");
    } catch (error) {
      console.error("시나리오 복사 실패:", error);
      alert("시나리오 복사에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const isFilterActive = Object.keys(filters).length > 0 || searchQuery.trim();

  return (
    <div className="min-h-screen bg-background">
      <ScenarioTemplateHeader
        title=""
        // subtitle={`(${totalCount}개)`}
        onBack={handleBack}
        // actions={
        //   <div className="flex items-center gap-2">
        //     <Button
        //       variant="outline"
        //       size="sm"
        //       onClick={() => setIsFilterDialogOpen(true)}
        //       className={`flex items-center gap-2 ${isFilterActive ? "ring-2 ring-primary/20 bg-primary/5" : ""}`}
        //     >
        //       <FunnelIcon className="h-4 w-4" />
        //       <span className="hidden sm:inline">필터</span>
        //       {isFilterActive && <span className="text-xs">●</span>}
        //     </Button>
        //   </div>
        // }
      />

      <main className="container mx-auto px-4 py-6">
        {/* 검색 바 */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="시나리오 제목, 설명, 카테고리로 검색..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* 활성 필터 표시 */}
          {isFilterActive && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">활성 필터:</span>
              {filters.category && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                  카테고리: {filters.category}
                  <button
                    onClick={() => handleFilterChange({ category: undefined })}
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.difficulty && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                  난이도: {DIFFICULTY_LABELS[filters.difficulty]}
                  <button
                    onClick={() =>
                      handleFilterChange({ difficulty: undefined })
                    }
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                  검색: {searchQuery}
                  <button onClick={() => handleSearch("")}>
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs h-6"
              >
                모든 필터 지우기
              </Button>
            </div>
          )}
        </div>

        {/* 시나리오 목록 */}
        {templatesLoading ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              시나리오 템플릿을 불러오는 중...
            </p>
          </div>
        ) : templatesError ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-600">
              시나리오 템플릿을 불러오는 중 오류가 발생했습니다.
            </p>
          </div>
        ) : scenarios.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-sm text-muted-foreground">
              {isFilterActive
                ? "조건에 맞는 시나리오 템플릿이 없습니다."
                : "아직 공개된 시나리오 템플릿이 없습니다."}
            </p>
            {isFilterActive && (
              <Button size="sm" onClick={handleClearFilters}>
                모든 필터 지우기
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((template) => (
              <Card
                key={template.id}
                className="group hover:shadow-md transition-shadow h-full flex flex-col"
              >
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-semibold text-foreground line-clamp-2">
                      {template.title}
                    </h3>
                    <EyeIcon
                      className="h-4 w-4 text-green-600 flex-shrink-0"
                      title="공개 시나리오"
                    />
                  </div>

                  <div className="flex items-center gap-3 mb-2 text-sm flex-wrap">
                    <span className="text-blue-600 font-medium">
                      {template.category}
                    </span>
                    <span
                      className={`font-medium ${DIFFICULTY_COLORS[template.difficulty]}`}
                    >
                      {DIFFICULTY_LABELS[template.difficulty]}
                    </span>
                    <span className="text-muted-foreground">
                      {template.expectedTurns}턴 예상
                    </span>
                  </div>

                  {template.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-3">
                      {template.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-4 mt-auto">
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground min-w-0">
                      <span className="truncate">
                        작성자: {template.createdBy}
                      </span>
                      <span>
                        {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleCopyRequest(template)}
                      className="flex items-center gap-2 flex-shrink-0"
                      disabled={copyMutation.isPending}
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">복사하기</span>
                      <span className="sm:hidden">복사</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* 더 보기 버튼 */}
            {hasNextPage && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={templatesLoading}
                >
                  더 보기
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 필터 다이얼로그 */}
      <FullScreenSlideDialog
        isOpen={isFilterDialogOpen}
        onClose={() => setIsFilterDialogOpen(false)}
        title="필터 설정"
        className="max-w-md"
      >
        <div className="space-y-6">
          {/* 카테고리 필터 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              카테고리
            </label>
            <select
              value={filters.category || ""}
              onChange={(e) =>
                handleFilterChange({ category: e.target.value || undefined })
              }
              className="w-full p-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">모든 카테고리</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* 난이도 필터 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              난이도
            </label>
            <select
              value={filters.difficulty || ""}
              onChange={(e) =>
                handleFilterChange({
                  difficulty: (e.target.value as Difficulty) || undefined,
                })
              }
              className="w-full p-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">모든 난이도</option>
              {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex-1"
            >
              초기화
            </Button>
            <Button
              onClick={() => setIsFilterDialogOpen(false)}
              className="flex-1"
            >
              적용
            </Button>
          </div>
        </div>
      </FullScreenSlideDialog>

      {/* 복사 다이얼로그 */}
      <FullScreenSlideDialog
        isOpen={isCopyDialogOpen}
        onClose={() => setIsCopyDialogOpen(false)}
        title="시나리오 복사"
        className="max-w-md"
      >
        {selectedTemplate && (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-md">
              <h3 className="text-sm font-medium text-foreground mb-1">
                복사할 시나리오
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedTemplate.title}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                새 제목
              </label>
              <input
                type="text"
                value={copyForm.title}
                onChange={(e) =>
                  setCopyForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                placeholder="복사본의 새 제목을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                카테고리
              </label>
              <input
                type="text"
                value={copyForm.category}
                onChange={(e) =>
                  setCopyForm((prev) => ({ ...prev, category: e.target.value }))
                }
                className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                placeholder="카테고리를 입력하세요"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={copyForm.isPrivate}
                  onChange={(e) =>
                    setCopyForm((prev) => ({
                      ...prev,
                      isPrivate: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                <span className="text-sm text-foreground">비공개로 설정</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCopyDialogOpen(false)}
                className="flex-1"
                disabled={copyMutation.isPending}
              >
                취소
              </Button>
              <Button
                onClick={handleCopySubmit}
                className="flex-1"
                disabled={copyMutation.isPending}
              >
                {copyMutation.isPending ? "복사 중..." : "복사하기"}
              </Button>
            </div>
          </div>
        )}
      </FullScreenSlideDialog>
    </div>
  );
}
