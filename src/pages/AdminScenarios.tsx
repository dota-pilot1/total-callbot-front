import { HeaderAuthControls } from "../components/layout/HeaderAuthControls";
import { Button } from "../components/ui";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import ScenarioManagement from "../features/daily-english/components/ScenarioManagement";

export default function AdminScenarios() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">홈</span>
              </Button>
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <span className="text-sm">⚙️</span>
              </div>
              <h1 className="text-lg font-semibold text-foreground">시나리오 관리</h1>
            </div>
            <HeaderAuthControls />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <ScenarioManagement />
      </div>
    </div>
  );
}
