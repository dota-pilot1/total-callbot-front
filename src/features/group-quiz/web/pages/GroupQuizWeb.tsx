import { useState } from "react";
import { Button } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PlusIcon, UsersIcon, StarIcon } from "@heroicons/react/24/outline";
import CreateRoomDialog, {
  type CreateRoomData,
} from "../components/CreateRoomDialog";
import { groupQuizApi } from "../api/groupQuizApi";
import { useNavigate } from "react-router-dom";

export default function GroupQuiz() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"rooms" | "history">("rooms");

  // 방 만들기 다이얼로그 상태
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleCreateRoom = async (roomData: CreateRoomData) => {
    try {
      console.log("방 생성 데이터:", roomData);

      // 실제 API 호출
      const response = await groupQuizApi.createRoom(roomData);
      console.log("방 생성 성공:", response);

      // 방 생성 성공 시 해당 방으로 이동
      navigate(`/group-quiz/room/${response.roomCode}`);
    } catch (error: any) {
      console.error("방 생성 실패:", error);

      // 에러 메시지 표시
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "방 생성에 실패했습니다.";
      alert(`방 생성 실패: ${errorMessage}`);

      throw error;
    }
  };

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <span className="text-sm">👥</span>
          </div>
          <span className="text-sm font-medium text-foreground">
            인터벌 퀴즈
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          뒤로
        </Button>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "rooms" ? "default" : "outline"}
            onClick={() => setActiveTab("rooms")}
            size="sm"
            className="flex items-center gap-2"
          >
            <UsersIcon className="h-4 w-4" />
            퀴즈방 목록
          </Button>
          <Button
            variant="outline"
            onClick={openCreateDialog}
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />방 만들기
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "outline"}
            onClick={() => setActiveTab("history")}
            size="sm"
            className="flex items-center gap-2"
          >
            <StarIcon className="h-4 w-4" />내 기록
          </Button>
        </div>

        {/* 퀴즈방 목록 */}
        {activeTab === "rooms" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">참여 가능한 퀴즈방</h2>
              <Button
                onClick={openCreateDialog}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />새 퀴즈방 만들기
              </Button>
            </div>

            {/* 빈 상태 표시 */}
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <UsersIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>현재 참여 가능한 퀴즈방이 없습니다.</p>
                  <p className="text-sm mt-1">
                    새로운 퀴즈방을 만들어서 친구들과 함께 퀴즈를 즐겨보세요!
                  </p>
                </div>
                <Button
                  onClick={openCreateDialog}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />새 퀴즈방 만들기
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 내 기록 */}
        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle>내 퀴즈 기록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  퀴즈 기록 기능을 준비 중입니다.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  참여한 퀴즈 결과와 통계를 확인할 수 있습니다!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 방 만들기 다이얼로그 */}
        <CreateRoomDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreateRoom={handleCreateRoom}
        />
      </div>
    </div>
  );
}
