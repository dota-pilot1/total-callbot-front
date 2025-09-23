import { useState } from "react";
import { Button } from "../../../components/ui";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useCreateDefaultScenarios } from "../hooks/useConversationScenarios";

interface CreateDefaultScenariosButtonProps {
  onSuccess?: () => void;
}

export default function CreateDefaultScenariosButton({ onSuccess }: CreateDefaultScenariosButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const createDefaultScenarios = useCreateDefaultScenarios();

  const handleCreateDefaults = async () => {
    setIsCreating(true);
    try {
      await createDefaultScenarios.mutateAsync();
      onSuccess?.();
    } catch (error) {
      console.error("기본 시나리오 생성 실패:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          상황극 시나리오가 없습니다
        </h3>
        <p className="text-sm text-muted-foreground">
          기본 시나리오를 생성하여 영어 대화 연습을 시작해보세요
        </p>
      </div>

      <Button
        onClick={handleCreateDefaults}
        disabled={isCreating || createDefaultScenarios.isPending}
        size="lg"
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg"
      >
        {isCreating || createDefaultScenarios.isPending ? (
          <>
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            기본 시나리오 생성 중...
          </>
        ) : (
          <>
            <PlusIcon className="w-5 h-5 mr-2" />
            기본 시나리오 생성하기
          </>
        )}
      </Button>

      {createDefaultScenarios.isError && (
        <p className="text-red-500 text-sm mt-4">
          시나리오 생성에 실패했습니다. 다시 시도해주세요.
        </p>
      )}
    </div>
  );
}
