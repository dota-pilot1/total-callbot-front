import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/Label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { PlusIcon, PlayIcon, TrashIcon } from "@heroicons/react/24/outline";
import { IntervalListeningHeader } from "../components/IntervalListeningHeader";
import { intervalListeningApi } from "../api/intervalListeningApi";
import type {
  CreateTestSetRequest,
  AddQuestionRequest,
  ListeningDifficulty,
  IntervalListeningTest
} from "../types";

interface Question {
  audioText: string;
  questionContent: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
}

export function CreateListeningTest() {
  const navigate = useNavigate();

  // 테스트 세트 정보
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<ListeningDifficulty>("BEGINNER");
  const [estimatedTimeMinutes, setEstimatedTimeMinutes] = useState(10);

  // 문제 목록
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    audioText: "",
    questionContent: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    explanation: "",
  });

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTestSet, setCreatedTestSet] = useState<IntervalListeningTest | null>(null);

  const handleAddQuestion = () => {
    if (!currentQuestion.audioText || !currentQuestion.questionContent ||
        !currentQuestion.optionA || !currentQuestion.optionB ||
        !currentQuestion.optionC || !currentQuestion.optionD) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({
      audioText: "",
      questionContent: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      explanation: "",
    });
    setError(null);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handlePreviewAudio = (text: string) => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleCreateTestSet = async () => {
    if (!title || !description || questions.length === 0) {
      setError("제목, 설명, 그리고 최소 1개의 문제를 입력해주세요.");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      // 1. 테스트 세트 생성
      const testSetRequest: CreateTestSetRequest = {
        title,
        description,
        difficulty,
        estimatedTimeMinutes,
      };

      const testSet = await intervalListeningApi.createTestSet(testSetRequest);
      setCreatedTestSet(testSet);

      // 2. 문제들 추가
      for (const question of questions) {
        const questionRequest: AddQuestionRequest = {
          audioText: question.audioText,
          questionContent: question.questionContent,
          optionA: question.optionA,
          optionB: question.optionB,
          optionC: question.optionC,
          optionD: question.optionD,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
        };

        await intervalListeningApi.addQuestionToTestSet(testSet.id, questionRequest);
      }

      // 3. 완료 후 테스트 목록으로 이동
      setTimeout(() => {
        navigate("/interval-listening");
      }, 2000);

    } catch (err) {
      setError("테스트 세트 생성 중 오류가 발생했습니다.");
      console.error('Failed to create test set:', err);
    } finally {
      setIsCreating(false);
    }
  };

  if (createdTestSet) {
    return (
      <div className="min-h-screen bg-background">
        <IntervalListeningHeader
          title="테스트 생성 완료"
          onBack={() => navigate("/interval-listening")}
        />
        <div className="p-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="text-2xl font-bold text-green-600">
                  ✅ 테스트 세트가 생성되었습니다!
                </div>
                <div className="space-y-2">
                  <div className="font-semibold">{createdTestSet.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {questions.length}개 문제 • 예상 소요시간 {estimatedTimeMinutes}분
                  </div>
                </div>
                <Button onClick={() => navigate("/interval-listening")} className="w-full">
                  테스트 목록으로 돌아가기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <IntervalListeningHeader
        title="듣기 테스트 만들기"
        onBack={() => navigate("/interval-listening")}
      />

      <div className="p-4 space-y-6">
        {/* 에러 메시지 */}
        {error && (
          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="text-red-600 text-sm">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* 테스트 세트 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>테스트 세트 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="테스트 제목을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="테스트 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>난이도</Label>
                <Select value={difficulty} onValueChange={(value: ListeningDifficulty) => setDifficulty(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">초급</SelectItem>
                    <SelectItem value="INTERMEDIATE">중급</SelectItem>
                    <SelectItem value="ADVANCED">고급</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">예상 소요시간 (분)</Label>
                <Input
                  id="time"
                  type="number"
                  value={estimatedTimeMinutes}
                  onChange={(e) => setEstimatedTimeMinutes(Number(e.target.value))}
                  min={1}
                  max={60}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 문제 추가 */}
        <Card>
          <CardHeader>
            <CardTitle>문제 추가</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="audioText">오디오 텍스트 (TTS로 읽힐 내용)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreviewAudio(currentQuestion.audioText)}
                  disabled={!currentQuestion.audioText}
                >
                  <PlayIcon className="h-4 w-4 mr-1" />
                  미리듣기
                </Button>
              </div>
              <Textarea
                id="audioText"
                value={currentQuestion.audioText}
                onChange={(e) => setCurrentQuestion({...currentQuestion, audioText: e.target.value})}
                placeholder="TTS로 읽힐 영어 문장을 입력하세요"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionContent">문제</Label>
              <Input
                id="questionContent"
                value={currentQuestion.questionContent}
                onChange={(e) => setCurrentQuestion({...currentQuestion, questionContent: e.target.value})}
                placeholder="문제를 입력하세요"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="optionA">선택지 A</Label>
                <Input
                  id="optionA"
                  value={currentQuestion.optionA}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, optionA: e.target.value})}
                  placeholder="선택지 A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="optionB">선택지 B</Label>
                <Input
                  id="optionB"
                  value={currentQuestion.optionB}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, optionB: e.target.value})}
                  placeholder="선택지 B"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="optionC">선택지 C</Label>
                <Input
                  id="optionC"
                  value={currentQuestion.optionC}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, optionC: e.target.value})}
                  placeholder="선택지 C"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="optionD">선택지 D</Label>
                <Input
                  id="optionD"
                  value={currentQuestion.optionD}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, optionD: e.target.value})}
                  placeholder="선택지 D"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>정답</Label>
              <Select
                value={currentQuestion.correctAnswer}
                onValueChange={(value) => setCurrentQuestion({...currentQuestion, correctAnswer: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="explanation">해설 (선택사항)</Label>
              <Textarea
                id="explanation"
                value={currentQuestion.explanation}
                onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                placeholder="정답 해설을 입력하세요"
                rows={2}
              />
            </div>

            <Button onClick={handleAddQuestion} className="w-full">
              <PlusIcon className="h-4 w-4 mr-2" />
              문제 추가
            </Button>
          </CardContent>
        </Card>

        {/* 추가된 문제 목록 */}
        {questions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>추가된 문제 ({questions.length}개)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {questions.map((question, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium mb-2">문제 {index + 1}</div>
                      <div className="text-sm text-muted-foreground mb-1">
                        오디오: {question.audioText.substring(0, 50)}...
                      </div>
                      <div className="text-sm">
                        질문: {question.questionContent}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        정답: {question.correctAnswer}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveQuestion(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* 생성 버튼 */}
        <Card>
          <CardContent className="p-4">
            <Button
              onClick={handleCreateTestSet}
              disabled={isCreating || !title || !description || questions.length === 0}
              className="w-full"
              size="lg"
            >
              {isCreating ? "생성 중..." : `테스트 세트 생성 (${questions.length}개 문제)`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
