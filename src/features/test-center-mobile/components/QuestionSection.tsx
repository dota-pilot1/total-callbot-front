import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
} from "../../../components/ui";
import type { Question } from "../types/exam";

export interface QuestionSectionProps {
  question: Question;
  selectedAnswer: string;
  isPlaying: boolean;
  onAnswerSelect: (answer: string) => void;
  onPlayAudio: () => void;
  onSubmitAnswer: () => void;
}

export default function QuestionSection({
  question,
  selectedAnswer,
  isPlaying,
  onAnswerSelect,
  onPlayAudio,
  onSubmitAnswer,
}: QuestionSectionProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-base text-gray-900">
              {question.questionNumber}. {question.content}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              유형: {question.category === "MATHEMATICS" ? "수학" : "영어"} · 난이도: {question.difficulty}
            </p>
          </div>
          {question.audioText && (
            <Button variant="outline" size="sm" onClick={onPlayAudio} disabled={isPlaying}>
              {isPlaying ? "재생 중" : "듣기"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {question.options.map((option, index) => {
            const optionLabel = String.fromCharCode(65 + index);
            const isSelected = selectedAnswer === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => onAnswerSelect(option)}
                className={`w-full text-left px-4 py-3 border rounded-md transition-colors ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <span className="font-semibold mr-2">{optionLabel}.</span>
                {option}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={onSubmitAnswer}
            disabled={!selectedAnswer}
          >
            답안 제출
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
