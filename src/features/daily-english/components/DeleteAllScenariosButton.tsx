import { useState } from "react";
import { Button } from "../../../components/ui";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useDeleteAllScenarios } from "../hooks/useConversationScenarios";

interface DeleteAllScenariosButtonProps {
  onSuccess?: () => void;
}

export default function DeleteAllScenariosButton({ onSuccess }: DeleteAllScenariosButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const deleteAllScenarios = useDeleteAllScenarios();

  const handleDelete = async () => {
    try {
      await deleteAllScenarios.mutateAsync();
      onSuccess?.();
      setShowConfirm(false);
    } catch (error) {
      console.error("모든 시나리오 삭제 실패:", error);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col items-center gap-4 p-4 border border-red-200 rounded-lg bg-red-50">
        <div className="text-center">
          <TrashIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="font-medium text-red-900 mb-1">모든 시나리오 삭제</h3>
          <p className="text-sm text-red-700">
            정말로 모든 시나리오를 삭제하시겠습니까?<br />
            이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(false)}
            disabled={deleteAllScenarios.isPending}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteAllScenarios.isPending}
          >
            {deleteAllScenarios.isPending ? (
              <>
                <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full mr-2" />
                삭제 중...
              </>
            ) : (
              "삭제 확인"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-2"
    >
      <TrashIcon className="w-4 h-4" />
      모든 데이터 삭제
    </Button>
  );
}
