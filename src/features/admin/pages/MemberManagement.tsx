import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Separator,
} from "@/components/ui";
import { apiClient } from "@/shared/api/client";
import { Users, UserCheck, UserX, RefreshCw } from "lucide-react";
import { useMemberWebSocket } from "../hooks/useMemberWebSocket";

interface Member {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  isOnline: boolean;
}

export const MemberManagement: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 웹소켓 훅으로 실시간 상태 업데이트 수신
  const { onlineStatusUpdates, isConnected } = useMemberWebSocket();

  // 초기 멤버 목록 로드
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("/members");
      setMembers(response.data);
    } catch (err) {
      console.error("멤버 목록 조회 에러:", err);
      setError(
        err instanceof Error ? err.message : "멤버 목록을 불러올 수 없습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 멤버 목록 로드
  useEffect(() => {
    fetchMembers();
  }, []);

  // 웹소켓으로 받은 상태 업데이트를 멤버 목록에 반영
  useEffect(() => {
    onlineStatusUpdates.forEach((update) => {
      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === update.userId
            ? { ...member, isOnline: update.isOnline }
            : member,
        ),
      );
    });
  }, [onlineStatusUpdates]);

  const onlineCount = members.filter((member) => member.isOnline).length;
  const totalCount = members.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>멤버 목록을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <UserX className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">오류가 발생했습니다</p>
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchMembers} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">멤버 관리</h1>
          <p className="text-muted-foreground">
            등록된 멤버들의 현황을 실시간으로 확인할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-sm text-muted-foreground">
              {isConnected ? "실시간 연결됨" : "연결 끊김"}
            </span>
          </div>
          <Button onClick={fetchMembers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalCount}</p>
                <p className="text-sm text-muted-foreground">총 멤버</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{onlineCount}</p>
                <p className="text-sm text-muted-foreground">온라인</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <UserX className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{totalCount - onlineCount}</p>
                <p className="text-sm text-muted-foreground">오프라인</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 멤버 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            멤버 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">등록된 멤버가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={member.id}>
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${
                            member.isOnline ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={member.isOnline ? "default" : "secondary"}
                      >
                        {member.isOnline ? "온라인" : "오프라인"}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          가입일:{" "}
                          {new Date(member.createdAt).toLocaleDateString(
                            "ko-KR",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  {index < members.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
