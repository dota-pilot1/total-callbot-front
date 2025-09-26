import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon, DocumentTextIcon, PlusIcon } from "@heroicons/react/24/outline";
import { intervalReadingApi } from "../api/intervalReadingApi";
import { ReadingDifficulty } from "../types";
import type { CreateTestRequest, ReadingDifficulty as ReadingDifficultyType } from "../types";

const CreateTest: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateTestRequest>({
    title: "",
    description: "",
    difficulty: ReadingDifficulty.BEGINNER,
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const handleInputChange = (field: keyof CreateTestRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Update word count for content
    if (field === "content") {
      const words = value.trim() ? value.trim().split(/\s+/).length : 0;
      setWordCount(words);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      await intervalReadingApi.createTest(formData);
      navigate("/interval-english-reading");
    } catch (error) {
      console.error("테스트 생성 실패:", error);
      alert("테스트 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLabel = (difficulty: ReadingDifficultyType) => {
    switch (difficulty) {
      case ReadingDifficulty.BEGINNER:
        return "초급";
      case ReadingDifficulty.INTERMEDIATE:
        return "중급";
      case ReadingDifficulty.ADVANCED:
        return "고급";
      default:
        return difficulty;
    }
  };

  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 225)); // Average 225 WPM

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/interval-english-reading")}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">새 독해 테스트 만들기</h1>
          <p className="text-muted-foreground">사용자 정의 영어 독해 테스트를 생성하세요</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5" />
              기본 정보
            </CardTitle>
            <CardDescription>
              독해 테스트의 기본 정보를 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                제목 *
              </label>
              <Input
                id="title"
                type="text"
                placeholder="독해 테스트 제목을 입력하세요"
                value={formData.title}
                onChange={(event) => handleInputChange("title", event.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-foreground">
                설명
              </label>
              <Input
                id="description"
                type="text"
                placeholder="테스트에 대한 간단한 설명 (선택사항)"
                value={formData.description}
                onChange={(event) => handleInputChange("description", event.target.value)}
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <label htmlFor="difficulty" className="text-sm font-medium text-foreground">
                난이도
              </label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(event) =>
                  handleInputChange(
                    "difficulty",
                    event.target.value as CreateTestRequest["difficulty"],
                  )
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value={ReadingDifficulty.BEGINNER}>
                  {getDifficultyLabel(ReadingDifficulty.BEGINNER)}
                </option>
                <option value={ReadingDifficulty.INTERMEDIATE}>
                  {getDifficultyLabel(ReadingDifficulty.INTERMEDIATE)}
                </option>
                <option value={ReadingDifficulty.ADVANCED}>
                  {getDifficultyLabel(ReadingDifficulty.ADVANCED)}
                </option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>독해 텍스트 내용</CardTitle>
            <CardDescription>
              인터벌 독해에 사용할 영어 텍스트를 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Content */}
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium text-foreground">
                텍스트 내용 *
              </label>
              <textarea
                id="content"
                placeholder="독해에 사용할 영어 텍스트를 입력하세요..."
                value={formData.content}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange("content", event.target.value)
                }
                rows={15}
                className="min-h-96 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />

              {/* Word count and estimated time */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>단어 수: {wordCount.toLocaleString()}개</span>
                <span>예상 독해 시간: {estimatedReadingTime}분</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/interval-english-reading")}
            disabled={loading}
          >
            취소
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.title.trim() || !formData.content.trim()}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                생성 중...
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                테스트 생성
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTest;
