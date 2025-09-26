import { ArrowLeftIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Button } from "../../../components/ui/Button";

interface IntervalListeningHeaderProps {
  title: string;
  onBack: () => void;
  onSettings?: () => void;
  showSettings?: boolean;
}

export function IntervalListeningHeader({
  title,
  onBack,
  onSettings,
  showSettings = false,
}: IntervalListeningHeaderProps) {
  return (
    <header className="flex items-center justify-between p-6 bg-background border-b border-border">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">
          {title}
        </h1>
      </div>

      {showSettings && onSettings && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          className="p-2"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </Button>
      )}
    </header>
  );
}
