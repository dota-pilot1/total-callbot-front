import { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import { useGetAllUsers } from "../api";
import type { MemberStatus } from "../types";
import MemberStatusTable from "../../../components/MemberStatusTable";

// Mock API 제거됨 - 실제 API 사용

export function MemberStatus() {
  const { data: users, isLoading, isError } = useGetAllUsers();
  const [members, setMembers] = useState<MemberStatus[]>([]);

  useEffect(() => {
    if (users) {
      const initialMembers: MemberStatus[] = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        isOnline: false,
        createdAt: new Date().toISOString(),
      }));
      setMembers(initialMembers);
    }
  }, [users]);

  useEffect(() => {
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
        client.subscribe("/topic/participant-count", (message: any) => {
          try {
            const participantData = JSON.parse(message.body);
            const participants = participantData.participants || [];

            setMembers((prevMembers) =>
              prevMembers.map((member) => {
                const isOnline = participants.includes(member.name);
                return {
                  ...member,
                  isOnline,
                  createdAt: member.createdAt, // 기존 createdAt 유지
                };
              }),
            );
          } catch (error) {
            console.error("Error parsing participant data:", error);
          }
        });

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div>
        Error fetching users. Please check if the backend API is running.
      </div>
    );
  }

  return <MemberStatusTable members={members} bordered={false} />;
}
