import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "../../../components/ui";
import { HeaderAuthControls } from "../../../components/layout/HeaderAuthControls";

interface ScenarioTemplateHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  actions?: React.ReactNode;
}

export default function ScenarioTemplateHeader({
  title,
  subtitle,
  onBack,
  actions
}: ScenarioTemplateHeaderProps) {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">뒤로</span>
            </Button>
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {actions}
            <HeaderAuthControls />
          </div>
        </div>
      </div>
    </header>
  );
}
