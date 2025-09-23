import { SparklesIcon } from "@heroicons/react/24/outline";
import { Button } from "../../../components/ui";

interface AutoGenerateButtonProps {
  onGenerate: (topic: string) => void;
  loading?: boolean;
  disabled?: boolean;
  topic: string;
  className?: string;
  compact?: boolean;
}

export default function AutoGenerateButton({
  onGenerate,
  loading = false,
  disabled = false,
  topic,
  className = "",
  compact = false,
}: AutoGenerateButtonProps) {
  const handleClick = () => {
    if (!topic.trim()) {
      alert("먼저 시나리오 주제를 입력해주세요.");
      return;
    }
    onGenerate(topic.trim());
  };

  return (
    <Button
      type="button"
      variant={loading ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={disabled || loading || !topic.trim()}
      className={`flex items-center gap-1.5 whitespace-nowrap ${
        compact ? "h-8 px-2 text-xs" : "h-9 px-3 text-sm"
      } ${className}`}
    >
      <SparklesIcon
        className={`${compact ? "h-3 w-3" : "h-4 w-4"} ${
          loading
            ? "animate-spin"
            : topic.trim()
              ? "text-orange-500 animate-pulse"
              : "text-muted-foreground"
        }`}
      />
      <span className="hidden sm:inline">
        {loading ? "생성 중..." : compact ? "AI 완성" : "AI 자동 완성"}
      </span>
      <span className="sm:hidden">{loading ? "생성중" : "AI"}</span>
    </Button>
  );
}
