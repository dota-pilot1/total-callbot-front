import FullScreenSlideDialog from "./ui/FullScreenSlideDialog";
import { ChartBarIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

interface EvaluationScores {
  fluency: number;
  grammar: number;
  comprehension: number;
}

interface ConversationEvaluationProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  evaluationData?: {
    scores: EvaluationScores;
    weakPoints: string[];
    goodExpressions: string[];
    recommendations: string[];
    mainMessages?: string[];
    keyExpressions?: string[];
    overallComment?: string;
  };
}

export default function ConversationEvaluationDialog({
  open,
  onClose,
  loading,
  evaluationData,
}: ConversationEvaluationProps) {
  const ScoreBar = ({
    label,
    score,
    color,
  }: {
    label: string;
    score: number;
    color: string;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-bold text-foreground">{score}/10</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
    </div>
  );

  const StarRating = ({ score }: { score: number }) => {
    const stars = [];
    const fullStars = Math.floor(score / 2); // 10점 만점을 5점 만점으로 변환
    const hasHalfStar = score % 2 >= 1;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarSolidIcon key={i} className="h-5 w-5 text-yellow-400" />,
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <StarIcon className="h-5 w-5 text-gray-300" />
            <StarSolidIcon className="h-5 w-5 text-yellow-400 absolute top-0 left-0 clip-path-half" />
          </div>,
        );
      } else {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-gray-300" />);
      }
    }
    return <div className="flex space-x-1">{stars}</div>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getOverallScore = () => {
    if (!evaluationData?.scores) return 0;
    const scores = evaluationData.scores;
    return Math.round(
      (scores.fluency + scores.grammar + scores.comprehension) / 3,
    );
  };

  return (
    <FullScreenSlideDialog
      isOpen={open}
      onClose={onClose}
      title="회화 평가 결과"
      className="h-[100vh]"
    >
      <div className="h-full overflow-y-auto bg-background">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">AI가 회화를 분석하고 있습니다...</p>
            <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
          </div>
        ) : evaluationData ? (
          <div className="px-4 py-6 space-y-8">
            {/* 전체 점수 */}
            <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">오늘의 점수</h2>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {getOverallScore()}/10
              </div>
              <StarRating score={getOverallScore()} />
              <p className="text-sm text-gray-600 mt-2">
                {getOverallScore() >= 8
                  ? "정말 잘하셨어요! 🎉"
                  : getOverallScore() >= 6
                    ? "잘하고 계세요! 💪"
                    : "꾸준히 하시면 늘어요! 📚"}
              </p>
            </div>

            {/* 세부 점수 */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                📊 상세 점수
              </h3>
              <div className="space-y-4">
                <ScoreBar
                  label="🗣️ 말하기 자연스러움"
                  score={evaluationData.scores.fluency}
                  color={getScoreColor(evaluationData.scores.fluency)}
                />
                <ScoreBar
                  label="📝 문법 정확성"
                  score={evaluationData.scores.grammar}
                  color={getScoreColor(evaluationData.scores.grammar)}
                />
                <ScoreBar
                  label="🧠 의사소통 능력"
                  score={evaluationData.scores.comprehension}
                  color={getScoreColor(evaluationData.scores.comprehension)}
                />
              </div>
            </div>

            {/* 잘한 점 */}
            {evaluationData.goodExpressions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  👍 잘한 점
                </h3>
                <div className="space-y-3">
                  {evaluationData.goodExpressions.map((expression, index) => (
                    <div
                      key={index}
                      className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg"
                    >
                      <p className="text-sm text-green-800">{expression}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 개선할 점 */}
            {evaluationData.weakPoints.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  📝 개선할 점
                </h3>
                <div className="space-y-3">
                  {evaluationData.weakPoints.map((point, index) => (
                    <div
                      key={index}
                      className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg"
                    >
                      <p className="text-sm text-orange-800">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 총평 */}
            {evaluationData.overallComment && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  💬 총평
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {evaluationData.overallComment}
                  </p>
                </div>
              </div>
            )}

            {/* 하단 액션 버튼 */}
            <div className="pt-6 border-t">
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-600 mb-4">
              평가 결과를 불러올 수 없습니다.
            </p>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </FullScreenSlideDialog>
  );
}

export type { EvaluationScores, ConversationEvaluationProps };
