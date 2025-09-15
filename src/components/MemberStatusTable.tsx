import { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

interface MemberStatus {
  name: string;
  email: string;
  isOnline: boolean;
  lastSeen: Date;
  connectionTime?: Date;
}

interface MemberStatusTableProps {
  bordered?: boolean;
}

export default function MemberStatusTable({ bordered = true }: MemberStatusTableProps) {
  const [members, setMembers] = useState<MemberStatus[]>([]);

  useEffect(() => {
    // 로그인 페이지에서는 기본값만 사용 (인증 없이는 API 호출 불가)
    setMembers([
      {
        name: "관리자",
        email: "terecal@daum.net",
        isOnline: false,
        lastSeen: new Date(),
      },
    ]);

    // WebSocket 연결로 실시간 접속자 정보 구독
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1";
    const wsUrl = isLocal
      ? "http://localhost:8080/ws-stomp"
      : "https://api.total-callbot.cloud/ws-stomp";

    const socket = new SockJS(wsUrl);
    const client = Stomp.over(socket);

    client.connect(
      {},
      () => {
        // 전체 채팅방 참여자 수 구독
        client.subscribe("/topic/participant-count", (message: any) => {
          try {
            const participantData = JSON.parse(message.body);
            const participants = participantData.participants || [];

            // 회원 상태 업데이트
            setMembers((prevMembers) =>
              prevMembers.map((member) => {
                const isOnline = participants.includes(member.name);
                return {
                  ...member,
                  isOnline,
                  connectionTime:
                    isOnline && !member.isOnline
                      ? new Date()
                      : member.connectionTime,
                  lastSeen: isOnline ? new Date() : member.lastSeen,
                };
              }),
            );
          } catch (error) {
            console.error("Error parsing participant data:", error);
          }
        });

        // 참여자 수 요청
        setTimeout(() => {
          client.publish({
            destination: "/app/chat/participant-count",
            body: JSON.stringify({}),
          });
        }, 1000);
      },
      (error: any) => {
        console.log("Connection error:", error);
      },
    );

    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, []);

  // 시간 포맷 함수
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  return (
    <div
      className={
        bordered
          ? "mt-6 p-4 bg-muted/30 rounded-lg border"
          : "pt-1"
      }
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">회원 접속 현황</h3>
        <span className="text-xs text-muted-foreground">
          온라인 {members.filter((m) => m.isOnline).length}/{members.length}명
        </span>
      </div>

      <div className={`overflow-hidden rounded-md bg-background ${bordered ? "border" : ""}`}>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-2 font-medium">이름</th>
              <th className="text-left p-2 font-medium">마지막 접속</th>
              <th className="text-left p-2 font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr
                key={member.email}
                className={`border-b last:border-b-0 hover:bg-muted/30 ${index % 2 === 0 ? "bg-background" : "bg-muted/10"}`}
              >
                <td className="p-2">
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {member.email}
                    </div>
                  </div>
                </td>
                <td className="p-2 text-muted-foreground">
                  {formatTime(member.lastSeen)}
                </td>
                <td className="p-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${member.isOnline ? "bg-green-500" : "bg-gray-400"}`}
                    />
                    <span
                      className={`text-xs font-medium ${member.isOnline ? "text-green-600" : "text-gray-500"}`}
                    >
                      {member.isOnline ? "온라인" : "오프라인"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
